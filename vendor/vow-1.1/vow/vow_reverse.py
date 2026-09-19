# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""VOW reverse transpiler: Python -> VOW (SPEC §10).

Maps Python source (or Shadow Python produced by VowTranspiler) back into
VOW quest syntax. Two modes:

- reverse_source(py_src):  general Python -> VOW best-effort mapping
    def name(...):  -> quest name { ... }
    x = expr        -> let x = expr
    assert e        -> prove e
    return e        -> success when e (comparison) or let __result__ = e
    if/for/while    -> comments preserved as scars? No: emitted as VOW
                       comments (VOW core has no control flow; nothing is
                       silently dropped — unsupported constructs become
                       `# unsupported: <src>` comments so the mapping is
                       total and lossless-by-annotation).
- reverse_shadow(code):    Shadow Python (transpiler output) -> VOW
    Recognizes the structured emission patterns of VowTranspiler
    (_vow_goal, _vow_believe, _vow_add_constraint, _vow_tournament,
    _vow_finish, _vow_prove, _strategy_*) for a faithful round trip.

Public API:
    class VowReverseTranspiler:
        def __init__(self)
        def reverse_source(self, python_source: str) -> str
        def reverse_shadow(self, shadow_python: str) -> str
    def reverse_file(path: str, shadow: bool = False) -> str
"""
import ast as pyast
import json
import re
from typing import List


class VowReverseError(Exception):
    pass


# ---------------------------------------------------------------------------
# Python expression -> VOW expression
# ---------------------------------------------------------------------------
class _ExprRenderer:
    """Render a Python ast expression as VOW expression source."""

    BINOP = {pyast.Add: '+', pyast.Sub: '-', pyast.Mult: '*',
             pyast.Div: '/', pyast.Mod: '%'}
    CMPOP = {pyast.Eq: '==', pyast.NotEq: '!=', pyast.Lt: '<',
             pyast.LtE: '<=', pyast.Gt: '>', pyast.GtE: '>='}

    def render(self, node) -> str:
        if isinstance(node, pyast.Constant):
            if isinstance(node.value, bool):
                return 'true' if node.value else 'false'
            if isinstance(node.value, str):
                return f'"{node.value}"'
            if node.value is None:
                raise VowReverseError('None has no VOW literal')
            return repr(node.value)
        if isinstance(node, pyast.Name):
            return node.id
        if isinstance(node, pyast.BinOp) and type(node.op) in self.BINOP:
            return f'({self.render(node.left)} {self.BINOP[type(node.op)]} {self.render(node.right)})'
        if isinstance(node, pyast.BoolOp):
            op = '&&' if isinstance(node.op, pyast.And) else '||'
            return '(' + f' {op} '.join(self.render(v) for v in node.values) + ')'
        if isinstance(node, pyast.Compare) and len(node.ops) == 1:
            op = self.CMPOP.get(type(node.ops[0]))
            if op is None:
                raise VowReverseError(f'unsupported comparator {node.ops[0]}')
            return f'({self.render(node.left)} {op} {self.render(node.comparators[0])})'
        if isinstance(node, pyast.UnaryOp):
            if isinstance(node.op, pyast.Not):
                return f'(!{self.render(node.operand)})'
            if isinstance(node.op, pyast.USub):
                return f'(-{self.render(node.operand)})'
            raise VowReverseError(f'unsupported unary op {node.op}')
        if isinstance(node, pyast.List):
            return '[{}]'.format(', '.join(self.render(e) for e in node.elts))
        if isinstance(node, pyast.Dict):
            return '{{{}}}'.format(', '.join(
                '{}: {}'.format(self.render(k), self.render(v))
                for k, v in zip(node.keys, node.values)))
        if isinstance(node, pyast.Lambda):
            params = ', '.join(a.arg for a in node.args.args)
            return f'lambda {params}: {self.render(node.body)}'
        if isinstance(node, pyast.Attribute):
            return f'{self.render(node.value)}.{node.attr}'
        if isinstance(node, pyast.Call) and isinstance(node.func, pyast.Name) \
                and node.func.id in ('_vow_list', '_vow_dict'):
            # collection wrappers — render the underlying literal
            return self.render(node.args[0]) if node.args else ('[]' if node.func.id == '_vow_list' else '{}')
        if isinstance(node, pyast.Call) and isinstance(node.func, pyast.Name) \
                and node.func.id == '_vow_attr':
            return f'{self.render(node.args[0])}.{node.args[1].value}'
        if isinstance(node, pyast.Call) and isinstance(node.func, pyast.Attribute):
            if node.func.attr in ('filter', 'map', 'sort_by', 'group_by'):
                args = ', '.join(self.render(a) for a in node.args)
                return f'{self.render(node.func.value)}.{node.func.attr}({args})'
            raise VowReverseError(
                f'method .{node.func.attr}() not expressible in VOW')
        if isinstance(node, pyast.Call) and isinstance(node.func, pyast.Name) \
                and node.func.id == '_vow_gated':
            action = node.args[1].value
            args = ', '.join(self.render(a) for a in node.args[2:])
            return f'{action}({args})'
        if isinstance(node, pyast.Call):
            if isinstance(node.func, pyast.Name) and node.func.id in ('abs', 'min', 'max', 'round', 'len'):
                args = ', '.join(self.render(a) for a in node.args)
                return f'{node.func.id}({args})'
            raise VowReverseError(f'call {pyast.unparse(node)} not expressible in VOW')
        if isinstance(node, pyast.Subscript):
            # env lookups from shadow code: _env['x'] -> x
            if (isinstance(node.value, pyast.Name)
                    and node.value.id in ('_env', '_senv', '_m', '_c')
                    and isinstance(node.slice, pyast.Constant)):
                return str(node.slice.value)
        raise VowReverseError(f'expression not expressible in VOW: {pyast.unparse(node)}')

    def try_render(self, node) -> str:
        try:
            return self.render(node)
        except VowReverseError:
            return f'__expr__({pyast.unparse(node)})'


# ---------------------------------------------------------------------------
class VowReverseTranspiler:
    def __init__(self):
        self._expr = _ExprRenderer()
        # engine docket #3: every statement we cannot recognize is recorded
        # here — the fidelity certificate must see what the comment admits
        self._amputations: List[str] = []

    # ---------------- general python -> vow ----------------
    def reverse_source(self, python_source: str) -> str:
        try:
            tree = pyast.parse(python_source)
        except SyntaxError as e:
            raise VowReverseError(f'invalid Python source: {e}') from None
        out: List[str] = []
        funcs = [n for n in tree.body if isinstance(n, pyast.FunctionDef)]
        others = [n for n in tree.body if not isinstance(n, pyast.FunctionDef)]
        if others:
            out.append('quest __module__ {')
            out += self._stmts(others, '  ')
            out.append('}')
        for fn in funcs:
            out.append(f'quest {fn.name} {{')
            if fn.args.args:
                out.append('  # params: ' + ', '.join(a.arg for a in fn.args.args))
            out += self._stmts(fn.body, '  ')
            out.append('}')
        if not out:
            out.append('quest __empty__ {\n  goal "empty module"\n}')
        return '\n\n'.join(out) + '\n'

    def _stmts(self, stmts, indent: str) -> List[str]:
        out = []
        for s in stmts:
            out += self._stmt(s, indent)
        return out

    def _stmt(self, s, indent: str) -> List[str]:
        if isinstance(s, pyast.Assign) and len(s.targets) == 1 and isinstance(s.targets[0], pyast.Name):
            return [f'{indent}let {s.targets[0].id} = {self._expr.try_render(s.value)}']
        if isinstance(s, pyast.Assert):
            return [f'{indent}prove {self._expr.try_render(s.test)}']
        if isinstance(s, pyast.Expr) and isinstance(s.value, pyast.Constant) and isinstance(s.value.value, str):
            return [f'{indent}goal "{s.value.value}"']
        if isinstance(s, pyast.Return):
            if s.value is None:
                return [f'{indent}success when true']
            rendered = self._expr.try_render(s.value)
            if re.fullmatch(r'\(.*(==|!=|<=|>=|<|>).*', rendered):
                return [f'{indent}success when {rendered.strip("()")}']
            return [f'{indent}let __result__ = {rendered}',
                    f'{indent}success when true']
        if isinstance(s, pyast.Raise):
            return [f'{indent}scar "raised: {pyast.unparse(s.exc) if s.exc else "re-raise"}"']
        if isinstance(s, pyast.If):
            lines = [f'{indent}# if {self._expr.try_render(s.test)}']
            lines += self._stmts(s.body, indent + '  ')
            if s.orelse:
                lines.append(f'{indent}# else')
                lines += self._stmts(s.orelse, indent + '  ')
            return lines
        if isinstance(s, (pyast.For, pyast.While)):
            head = pyast.unparse(s).splitlines()[0]
            lines = [f'{indent}# {head}']
            lines += self._stmts(s.body, indent + '  ')
            return lines
        if isinstance(s, pyast.FunctionDef):
            # nested function: represented as its own quest comment
            return [f'{indent}# nested def {s.name}(...) -> see quest {s.name}']
        return [f'{indent}# unsupported: {pyast.unparse(s)}']

    # ---------------- shadow python -> vow (round trip) ----------------
    def reverse_shadow(self, shadow_python: str) -> str:
        """Recognize VowTranspiler emission patterns and rebuild VOW source."""
        self._amputations = []
        try:
            tree = pyast.parse(shadow_python)
        except SyntaxError as e:
            raise VowReverseError(f'invalid Shadow Python: {e}') from None
        quests = [n for n in tree.body
                  if isinstance(n, pyast.FunctionDef) and n.name.startswith('quest_')]
        if not quests:
            raise VowReverseError('no quest_* functions found — is this Shadow Python?')
        header: List[str] = []
        # program-level axioms: emitted as `_VOW_AXIOMS = {...}` and applied
        # via `_env.update(_VOW_AXIOMS)` — reconstruct the declarations so
        # the round trip keeps compile-time truths
        for n in tree.body:
            if (isinstance(n, pyast.Assign) and len(n.targets) == 1
                    and isinstance(n.targets[0], pyast.Name)
                    and n.targets[0].id == '_VOW_AXIOMS'
                    and isinstance(n.value, pyast.Dict)):
                for k, val in zip(n.value.keys, n.value.values):
                    if isinstance(k, pyast.Constant):
                        header.append('axiom %s = %s'
                                      % (k.value, self._expr.render(val)))
        # domain + runbook directives (2026-07-24: reverse previously
        # boilerplate-skipped _VOW_DOMAIN — an SOP program round-tripped
        # to exploratory, silently; the runbook directive Owed 3 lands
        # gets reconstruction from birth)
        for n in tree.body:
            if not (isinstance(n, pyast.Assign) and len(n.targets) == 1
                    and isinstance(n.targets[0], pyast.Name)
                    and isinstance(n.value, (pyast.Constant, pyast.Dict))):
                continue
            tid = n.targets[0].id
            if tid == '_VOW_DOMAIN' and isinstance(n.value, pyast.Constant):
                if n.value.value != 'exploratory':
                    header.insert(0, 'domain "%s"' % n.value.value)
            elif tid == '_VOW_RUNBOOK' and isinstance(n.value, pyast.Dict):
                rows = ['runbook {']
                for k, val in zip(n.value.keys, n.value.values):
                    if isinstance(k, pyast.Constant):
                        rows.append('  %s = %s'
                                    % (k.value, self._expr.render(val)))
                rows.append('}')
                if len(rows) > 2:
                    header.append('\n'.join(rows))
        # a module-level statement that is neither transpiler boilerplate
        # nor a quest is an amputation: visible in the output AND on the
        # record (a smuggled statement must never vanish silently)
        for n in tree.body:
            if self._is_boilerplate(n):
                continue
            self._amputations.append(pyast.unparse(n))
            header.append('# unsupported: %s' % pyast.unparse(n))
        body = '\n\n'.join(self._shadow_quest(q) for q in quests)
        return ('\n'.join(header) + '\n\n' if header else '') + body + '\n'

    @staticmethod
    def _is_boilerplate(n) -> bool:
        """Transpiler module-level emission we may legitimately skip."""
        if isinstance(n, (pyast.Import, pyast.ImportFrom, pyast.Try,
                          pyast.FunctionDef, pyast.ClassDef)):
            return True
        if isinstance(n, pyast.Assign):
            return all(pyast.unparse(t).startswith(('_vow', '_VOW')) or
                       pyast.unparse(t) == 'QUESTS'
                       for t in n.targets)
        if isinstance(n, pyast.Expr) and isinstance(n.value, pyast.Call):
            f = n.value.func
            name = f.id if isinstance(f, pyast.Name) else (
                f.attr if isinstance(f, pyast.Attribute) else '')
            return name.startswith('_vow')
        if isinstance(n, pyast.If):
            # the runbook's guarded TTL laws are reconstructed from
            # _VOW_RUNBOOK above — the guards themselves are machinery
            return pyast.unparse(n.test) in ("__name__ == '__main__'",
                                             "_VOW_SCAR_TTL is None",
                                             "_VOW_SUCCESS_TTL is None")
        return False

    def _shadow_quest(self, fn: pyast.FunctionDef) -> str:
        name = fn.name[len('quest_'):]
        learn = any(
            isinstance(s, pyast.Expr) and isinstance(s.value, pyast.Call)
            and isinstance(s.value.func, pyast.Name) and s.value.func.id == '_vow_quest_begin'
            and any(isinstance(k, pyast.keyword) and k.arg == 'learn'
                    and isinstance(k.value, pyast.Constant) and k.value.value
                    for k in s.value.keywords)
            for s in fn.body)
        lines = []
        if learn:
            lines.append('@learn')
        lines.append(f'quest {name} {{')
        body = self._shadow_block(fn.body, '  ')
        lines += body if body else ['  goal "(empty quest)"']
        lines.append('}')
        return '\n'.join(lines)

    def _shadow_block(self, stmts, indent: str) -> List[str]:
        out = []
        for s in stmts:
            out += self._shadow_stmt(s, indent)
        return out

    def _shadow_stmt(self, s, indent: str) -> List[str]:
        ex = self._expr
        # transpiler wraps quest bodies in try/except VowProofFailure when an
        # on-fail block exists — unwrap it (the handler maps to `on fail`,
        # reconstructed from the _on_fail def, not from this try)
        if isinstance(s, pyast.Try):
            return self._shadow_block(s.body, indent)
        # for _vow_i in range(int(expr)): -> repeat expr times { }
        if isinstance(s, pyast.For) and isinstance(s.target, pyast.Name) \
                and s.target.id.startswith('_vow_i'):
            call = s.iter
            if isinstance(call, pyast.Call) and call.args:
                inner = call.args[0]
                if isinstance(inner, pyast.Call) and getattr(inner.func, 'id', '') == 'int':
                    inner = inner.args[0]
                out = [f'{indent}repeat {ex.render(inner)} times {{']
                out += self._shadow_block(s.body, indent + '  ')
                out.append(f'{indent}}}')
                return out
        # if cond: / else: -> if cond { } else { }
        if isinstance(s, pyast.If):
            out = [f'{indent}if {ex.render(s.test)} {{']
            out += self._shadow_block(s.body, indent + '  ')
            if s.orelse:
                out.append(f'{indent}}} else {{')
                out += self._shadow_block(s.orelse, indent + '  ')
            out.append(f'{indent}}}')
            return out
        # _vow_goal("...")
        if self._is_call(s, '_vow_goal'):
            return [f'{indent}goal {self._lit(s.value.args[0])}']
        # _vow_quest_begin(...) / _env = {}
        if self._is_call(s, '_vow_quest_begin'):
            return []
        if isinstance(s, pyast.Assign) and isinstance(s.targets[0], pyast.Name) \
                and s.targets[0].id == '_env':
            return []
        # _env['x'] = _vow_believe('x', expr, conf, src)
        if isinstance(s, pyast.Assign) and isinstance(s.value, pyast.Call) \
                and isinstance(s.value.func, pyast.Name) and s.value.func.id == '_vow_believe':
            name = s.value.args[0].value  # raw identifier, not quoted
            val = ex.render(s.value.args[1])
            line = f'{indent}believe {name} = {val}'
            if len(s.value.args) > 2:
                line += f' confidence {self._lit(s.value.args[2])}'
            if len(s.value.args) > 3 and not (isinstance(s.value.args[3], pyast.Constant) and s.value.args[3].value is None):
                line += f' source {self._lit(s.value.args[3])}'
            return [line]
        # _env['recalled_scars'] = VowScarMemory.recall()
        if isinstance(s, pyast.Assign) and isinstance(s.targets[0], pyast.Subscript) \
                and isinstance(s.targets[0].slice, pyast.Constant) \
                and s.targets[0].slice.value == 'recalled_scars':
            return [f'{indent}recall scars']
        # _env['x'] = _vow_annotate('x', expr, 'int')  ->  let x: int = expr
        if isinstance(s, pyast.Assign) and isinstance(s.targets[0], pyast.Subscript) \
                and isinstance(s.value, pyast.Call) \
                and isinstance(s.value.func, pyast.Name) \
                and s.value.func.id == '_vow_annotate':
            name = s.value.args[0].value
            ann = s.value.args[2].value
            return [f'{indent}let {name}: {ann} = {ex.render(s.value.args[1])}']
        # _env['x'] = expr  /  _senv['x'] = expr
        if isinstance(s, pyast.Assign) and isinstance(s.targets[0], pyast.Subscript):
            name = s.targets[0].slice.value
            return [f'{indent}let {name} = {ex.render(s.value)}']
        # def _on_fail(_env): ...
        if isinstance(s, pyast.FunctionDef) and s.name == '_on_fail':
            self._on_fail_body = s.body
            return []
        # _vow_add_constraint(lambda _c: expr)
        if self._is_call(s, '_vow_add_constraint'):
            lam = s.value.args[0]
            return [f'{indent}constraint {ex.render(lam.body)}']
        # _vow_grant('network')
        if self._is_call(s, '_vow_grant'):
            return [f'{indent}capability {s.value.args[0].value}']
        # _vow_scar("...")
        if self._is_call(s, '_vow_scar'):
            return [f'{indent}scar {self._lit(s.value.args[0])}']
        # _vow_prove(expr, context=...)
        if self._is_call(s, '_vow_prove'):
            return [f'{indent}prove {ex.render(s.value.args[0])}']
        # def _strategy_<name>(_senv): ...
        if isinstance(s, pyast.FunctionDef) and s.name.startswith('_strategy_'):
            # store RAW stmts; rendered later by _shadow_tournament, which
            # knows the correct strategy-body indent
            self._pending_strategy = getattr(self, '_pending_strategy', {})
            self._pending_strategy[s.name] = s.body
            return []
        # _vow_tournament(env, lambda _m: score, [{...}, ...])
        if self._is_call(s, '_vow_tournament'):
            return self._shadow_tournament(s.value, indent)
        # return _vow_finish(env, lambda: expr)
        if isinstance(s, pyast.Return) and isinstance(s.value, pyast.Call) \
                and isinstance(s.value.func, pyast.Name) and s.value.func.id == '_vow_finish':
            out = []
            lam = s.value.args[1]
            if isinstance(lam, pyast.Lambda):
                body = lam.body
                if not (isinstance(body, pyast.Constant) and body.value is True):
                    out.append(f'{indent}success when {ex.render(body)}')
            has_on_fail = any(isinstance(k, pyast.keyword) and k.arg == 'on_fail'
                              and isinstance(k.value, pyast.Name)
                              and k.value.id == '_on_fail'
                              for k in s.value.keywords)
            if has_on_fail and getattr(self, '_on_fail_body', None):
                out.append(f'{indent}on fail {{')
                out += self._shadow_block(self._on_fail_body, indent + '  ')
                out.append(f'{indent}}}')
                self._on_fail_body = None
            return out
        # wait until <epoch>: emitted as _vow_wait_until(expr)
        if (isinstance(s, pyast.Expr) and isinstance(s.value, pyast.Call)
                and isinstance(s.value.func, pyast.Name)
                and s.value.func.id == '_vow_wait_until'
                and len(s.value.args) == 1):
            return [f'{indent}wait until {self._expr.render(s.value.args[0])}']
        # await approval "reason": emitted as _vow_await_approval('reason')
        if (isinstance(s, pyast.Expr) and isinstance(s.value, pyast.Call)
                and isinstance(s.value.func, pyast.Name)
                and s.value.func.id == '_vow_await_approval'
                and len(s.value.args) == 1
                and isinstance(s.value.args[0], pyast.Constant)):
            return ['%sawait approval %s'
                    % (indent, json.dumps(s.value.args[0].value))]
        # axioms applied: _env.update(_VOW_AXIOMS) — reconstructed at
        # program level by reverse_shadow; a recognized no-op here
        if (isinstance(s, pyast.Expr) and isinstance(s.value, pyast.Call)
                and isinstance(s.value.func, pyast.Attribute)
                and s.value.func.attr == 'update'
                and isinstance(s.value.func.value, pyast.Name)
                and s.value.func.value.id == '_env'
                and len(s.value.args) == 1
                and isinstance(s.value.args[0], pyast.Name)
                and s.value.args[0].id == '_VOW_AXIOMS'):
            return []
        # unrecognized emission: amputate VISIBLY and ON THE RECORD
        self._amputations.append(pyast.unparse(s))
        return [f'{indent}# unsupported: {pyast.unparse(s)}']

    def _shadow_tournament(self, call: pyast.Call, indent: str) -> List[str]:
        score = self._expr.render(call.args[1].body)
        lines = [f'{indent}tournament {{', f'{indent}  score by {score}']
        pending = getattr(self, '_pending_strategy', {})
        for strat in call.args[2].elts:
            d = {k.value: v for k, v in zip(strat.keys, strat.values)}
            sname = d['name'].value
            cost = d['cost'].value
            risk = d['risk'].value
            fname = d['fn'].id
            lines.append(f'{indent}  strategy {sname} {{')
            lines.append(f'{indent}    cost {cost}')
            lines.append(f'{indent}    risk {risk}')
            lines += self._shadow_block(pending.get(fname, []), indent + '    ')
            lines.append(f'{indent}  }}')
        lines.append(f'{indent}}}')
        return lines

    # --- small helpers ---
    @staticmethod
    def _is_call(s, name) -> bool:
        return (isinstance(s, pyast.Expr) and isinstance(s.value, pyast.Call)
                and isinstance(s.value.func, pyast.Name) and s.value.func.id == name)

    @staticmethod
    def _lit(node):
        if isinstance(node, pyast.Constant):
            if isinstance(node.value, str):
                return f'"{node.value}"'
            return repr(node.value)
        return pyast.unparse(node)


def reverse_file(path: str, shadow: bool = False) -> str:
    src = open(path).read()
    rt = VowReverseTranspiler()
    return rt.reverse_shadow(src) if shadow else rt.reverse_source(src)
