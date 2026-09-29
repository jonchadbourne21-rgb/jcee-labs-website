# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""VOW formatter and linter (Ecosystem: vow_formatter.py; commands
`fmt` and `lint`).

fmt:  canonical layout — 2-space indents, decorators above quests, blank
      line between quests. NOTE: comments are not preserved by the AST;
      fmt warns (stderr) when the input had any.

lint: real static checks, real evidence:
      1. syntax errors (with line/col)
      2. scar-injection mandate for @learn quests (ScarInjectionValidator)
      3. transpiler-level violations (undeclared capabilities, effectful
         calls in strategy bodies, set-on-unbound, unknown annotations...)
      4. strategy without a single prove (no proof gate)
      5. duplicate strategy names inside one tournament
      6. items after `success when` (unreachable)
"""
from dataclasses import dataclass, asdict
from typing import Any, Dict, List

from .vow_ast import (Program, Quest, Goal, Constraint, Believe, ScarStmt,
                      RecallScars, OnFail, Capability, Set, If, Repeat,
                      Tournament, Strategy, Prove, Success, Let,
                      Num, Str, Bool, Name, BinOp, UnaryOp, Call,
                      ListLit, DictLit, Lambda, Attr,
                      Axiom, Deduce)
from .vow_parser import VowAdvancedParser, VowSyntaxError
from .vow_transpiler import VowTranspiler, VowTranspileError
from .scar_injection_validator import ScarInjectionValidator


# ---------------------------------------------------------------- fmt -----
def render_expr(node) -> str:
    if isinstance(node, Num):
        return repr(node.value)
    if isinstance(node, Str):
        return '"{}"'.format(node.value.replace('\\', '\\\\').replace('"', '\\"'))
    if isinstance(node, Bool):
        return 'true' if node.value else 'false'
    if isinstance(node, Name):
        return node.id
    if isinstance(node, ListLit):
        return '[{}]'.format(', '.join(render_expr(i) for i in node.items))
    if isinstance(node, DictLit):
        return '{{{}}}'.format(', '.join(
            '{}: {}'.format(render_expr(k), render_expr(v))
            for k, v in node.pairs))
    if isinstance(node, Lambda):
        return 'lambda {}: {}'.format(', '.join(node.params),
                                      render_expr(node.body))
    if isinstance(node, Attr):
        return '{}.{}'.format(render_expr(node.obj), node.name)
    if isinstance(node, UnaryOp):
        return f'({node.op}{render_expr(node.operand)})'
    if isinstance(node, BinOp):
        return f'({render_expr(node.left)} {node.op} {render_expr(node.right)})'
    if isinstance(node, Call):
        args = ', '.join(render_expr(a) for a in node.args)
        return f'{render_expr(node.func)}({args})'
    raise ValueError(f'cannot render {node!r}')


def _fmt_item(item, indent: str) -> List[str]:
    if isinstance(item, Goal):
        return [f'{indent}goal "{item.text}"']
    if isinstance(item, Constraint):
        return [f'{indent}constraint {render_expr(item.expr)}']
    if isinstance(item, Believe):
        line = f'{indent}believe {item.name} = {render_expr(item.value)}'
        if item.confidence != 1.0:
            line += f' confidence {item.confidence:g}'
        if item.source is not None:
            line += f' source "{item.source}"'
        return [line]
    if isinstance(item, ScarStmt):
        return [f'{indent}scar "{item.message}"']
    if isinstance(item, RecallScars):
        return [f'{indent}recall scars']
    if isinstance(item, Capability):
        return [f'{indent}capability {item.name}']
    if isinstance(item, Let):
        ann = f': {item.annotation}' if item.annotation else ''
        return [f'{indent}let {item.name}{ann} = {render_expr(item.value)}']
    if isinstance(item, Set):
        return [f'{indent}set {item.name} = {render_expr(item.value)}']
    if isinstance(item, Prove):
        return [f'{indent}prove {render_expr(item.expr)}']
    if isinstance(item, Success):
        return [f'{indent}success when {render_expr(item.expr)}']
    if isinstance(item, If):
        out = [f'{indent}if {render_expr(item.cond)} {{']
        for sub in item.body:
            out += _fmt_item(sub, indent + '  ')
        if item.orelse:
            out.append(f'{indent}}} else {{')
            for sub in item.orelse:
                out += _fmt_item(sub, indent + '  ')
        out.append(f'{indent}}}')
        return out
    if isinstance(item, Repeat):
        out = [f'{indent}repeat {render_expr(item.count)} times {{']
        for sub in item.body:
            out += _fmt_item(sub, indent + '  ')
        out.append(f'{indent}}}')
        return out
    if isinstance(item, OnFail):
        out = [f'{indent}on fail {{']
        for sub in item.body:
            out += _fmt_item(sub, indent + '  ')
        out.append(f'{indent}}}')
        return out
    if isinstance(item, Strategy):
        return _fmt_strategy(item, indent)
    if isinstance(item, Tournament):
        out = [f'{indent}tournament {{',
               f'{indent}  score by {render_expr(item.score_expr)}', '']
        for i, s in enumerate(item.strategies):
            out += _fmt_strategy(s, indent + '  ')
            if i < len(item.strategies) - 1:
                out.append('')
        out.append(f'{indent}}}')
        return out
    raise ValueError(f'cannot format {item!r}')


def _fmt_strategy(s: Strategy, indent: str) -> List[str]:
    out = [f'{indent}strategy {s.name} {{']
    if s.cost != 1.0:
        out.append(f'{indent}  cost {s.cost:g}')
    if s.risk != 0.0:
        out.append(f'{indent}  risk {s.risk:g}')
    for sub in s.body:
        out += _fmt_item(sub, indent + '  ')
    out.append(f'{indent}}}')
    return out


def _fmt_program_decls(program: Program) -> List[str]:
    """Program-level declarations — domain, axioms/deduce, runbook,
    routes, ontology. (Amputation cured 2026-07-24: fmt previously
    rendered quests only, silently dropping every declaration — an SOP
    program came back exploratory, compile-time truths vanished. A
    formatter must never change what a program MEANS.)"""
    decls = []
    if program.domain != 'exploratory':
        decls.append(f'domain "{program.domain}"')
    for ax in program.axioms:
        if isinstance(ax, Axiom):
            decls.append(f'axiom {ax.name} = {render_expr(ax.expr)}')
        elif isinstance(ax, Deduce):
            lines = [f'deduce {ax.name} {{']
            for given, result in ax.clauses:
                lines.append(f'  given {render_expr(given)} -> '
                             f'{render_expr(result)}')
            lines.append('}')
            decls.append('\n'.join(lines))
    if program.runbook:
        lines = ['runbook {']
        for name, expr in program.runbook.items():
            lines.append(f'  {name} = {render_expr(expr)}')
        lines.append('}')
        decls.append('\n'.join(lines))
    for r in program.routes:
        lines = [f'route intent from {r.source} {{']
        for patterns, label in r.rows:
            pats = ', '.join('"%s"' % p.replace('\\', '\\\\')
                             .replace('"', '\\"') for p in patterns)
            lines.append(f'  recognize {pats} -> "{label}"')
        if r.fallback is not None:
            lines.append(f'  fallback -> "{r.fallback}"')
        lines.append('}')
        decls.append('\n'.join(lines))
    if program.ontology:
        lines = ['ontology {']
        for kw, fn in program.ontology.items():
            lines.append(f'  define_keyword "{kw}" -> "{fn}"')
        lines.append('}')
        decls.append('\n'.join(lines))
    return decls


def format_program(program: Program) -> str:
    chunks = _fmt_program_decls(program)
    for quest in program.quests:
        lines = []
        if quest.learn:
            lines.append('@learn')
        lines.append(f'quest {quest.name} {{')
        for item in quest.items:
            lines += _fmt_item(item, '  ')
        lines.append('}')
        chunks.append('\n'.join(lines))
    return '\n\n'.join(chunks) + '\n'


def format_source(source: str) -> str:
    return format_program(VowAdvancedParser(source).parse_program())


# --------------------------------------------------------------- lint -----
@dataclass
class LintFinding:
    severity: str     # 'error' | 'warning'
    rule: str
    message: str


def _walk_items(items):
    for item in items:
        yield item
        for attr in ('body', 'orelse'):
            sub = getattr(item, attr, None)
            if isinstance(sub, list):
                yield from _walk_items(sub)
        if isinstance(item, Tournament):
            for s in item.strategies:
                yield from _walk_items(s.body)
        if isinstance(item, OnFail):
            yield from _walk_items(item.body)


def lint_program(program: Program) -> List[LintFinding]:
    findings: List[LintFinding] = []
    # rule 2: scar injection mandate (shared component)
    rep = ScarInjectionValidator().validate_program(program)
    for f in rep['findings']:
        findings.append(LintFinding(f['severity'], 'scar-injection',
                                    f['message']))
    for quest in program.quests:
        # rule 6: unreachable items after success
        seen_success = False
        for item in quest.items:
            if seen_success:
                findings.append(LintFinding(
                    'warning', 'unreachable',
                    f"quest '{quest.name}': item after `success when` is "
                    f"unreachable: {type(item).__name__}"))
            if isinstance(item, Success):
                seen_success = True
        # strategies under inspection (quest-level + tournament)
        strategies = [i for i in quest.items if isinstance(i, Strategy)]
        for t in (i for i in quest.items if isinstance(i, Tournament)):
            names = [s.name for s in t.strategies]
            dupes = {n for n in names if names.count(n) > 1}
            if dupes:
                findings.append(LintFinding(
                    'warning', 'duplicate-strategy',
                    f"quest '{quest.name}': duplicate strategy names in "
                    f"tournament: {sorted(dupes)}"))
            strategies.extend(t.strategies)
        # rule 4: proof gate
        for s in strategies:
            if not any(isinstance(x, Prove) for x in _walk_items(s.body)):
                findings.append(LintFinding(
                    'warning', 'no-proof-gate',
                    f"quest '{quest.name}': strategy '{s.name}' has no "
                    f"prove — every strategy must prove its outcome"))
    # rule 3: transpiler-level violations (capability gating, purity,
    # set-on-unbound, unknown annotations) — the transpiler is the enforcer
    try:
        VowTranspiler(include_preamble=False).transpile(program)
    except VowTranspileError as e:
        findings.append(LintFinding('error', 'transpile', str(e)))
    return findings


def lint_source(source: str) -> Dict[str, Any]:
    try:
        program = VowAdvancedParser(source).parse_program()
    except VowSyntaxError as e:
        return {'errors': 1, 'warnings': 0, 'findings': [
            asdict(LintFinding('error', 'syntax',
                               f'{e.message} (line {e.line}, col {e.col})'))]}
    findings = lint_program(program)
    return {
        'errors': sum(1 for f in findings if f.severity == 'error'),
        'warnings': sum(1 for f in findings if f.severity == 'warning'),
        'findings': [asdict(f) for f in findings],
    }
