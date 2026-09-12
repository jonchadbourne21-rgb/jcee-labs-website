# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""VOW recursive-descent parser (SPEC §5)."""
from .vow_ast import (Program, Quest, Goal, Constraint, Believe, ScarStmt,
                     RecallScars, OnFail, Capability, Set, If, Repeat,
                     Tournament, Strategy, Prove, Success, Let,
                     Axiom, Deduce, RouteDecl, IntentDecl, OntologyCall,
                     WaitStmt, AwaitStmt,
                     Num, Str, Bool, Name, BinOp, UnaryOp, Call,
                     ListLit, DictLit, Lambda, Attr)
from .vow_lexer import tokenize

try:
    from .vow_lexer import VowLexError
except ImportError:  # pragma: no cover
    VowLexError = Exception


class VowSyntaxError(Exception):
    def __init__(self, line, col, message):
        self.line, self.col, self.message = line, col, message
        super().__init__(f'{message} (line {line}, col {col})')


class VowAdvancedParser:
    def __init__(self, source: str):
        self.source = source
        try:
            self.tokens = tokenize(source)
        except VowLexError as e:
            raise VowSyntaxError(e.line, e.col, e.message) from None
        self.pos = 0

    # --- token helpers ---
    def peek(self, ahead=0):
        return self.tokens[min(self.pos + ahead, len(self.tokens) - 1)]

    def next(self):
        tok = self.tokens[self.pos]
        if tok.type != 'EOF':
            self.pos += 1
        return tok

    def error(self, msg, tok=None):
        tok = tok or self.peek()
        raise VowSyntaxError(tok.line, tok.col, msg)

    def expect_op(self, value):
        tok = self.next()
        if tok.type != 'OP' or tok.value != value:
            self.error(f"expected '{value}', got {tok.value!r}", tok)
        return tok

    def expect_keyword(self, value):
        tok = self.next()
        if tok.type != 'KEYWORD' or tok.value != value:
            self.error(f"expected '{value}', got {tok.value!r}", tok)
        return tok

    def expect_ident(self):
        tok = self.next()
        if tok.type != 'IDENT':
            self.error(f'expected identifier, got {tok.value!r}', tok)
        return tok.value

    def at_keyword(self, value):
        tok = self.peek()
        return tok.type == 'KEYWORD' and tok.value == value

    # --- grammar ---
    def parse_program(self) -> Program:
        domain = 'exploratory'
        if self.at_keyword('domain'):
            self.next()
            tok = self.next()
            if tok.type != 'STRING':
                self.error('domain requires a string: "sop" or "exploratory"',
                           tok)
            domain = tok.value
            if domain not in ('sop', 'exploratory'):
                self.error(f"unknown domain {domain!r} — allowed: "
                           f"'sop', 'exploratory'", tok)
        axioms = []
        while self.at_keyword('axiom') or self.at_keyword('deduce'):
            if self.at_keyword('axiom'):
                self.next()
                name = self.expect_ident()
                self.expect_op('=')
                axioms.append(Axiom(name, self.parse_expr()))
            else:
                self.next()
                name = self.expect_ident()
                self.expect_op('{')
                clauses = []
                while self.at_keyword('given'):
                    self.next()
                    given = self.parse_expr()
                    self.expect_op('->')
                    clauses.append((given, self.parse_expr()))
                if not clauses:
                    self.error('deduce requires at least one given')
                self.expect_op('}')
                axioms.append(Deduce(name, clauses))
        # Arc 2C syntax is CONTEXTUAL: 'route', 'ontology', and 'intent'
        # arrive as IDENTs and are only special in declaration position —
        # no new reserved words, so no existing program can break.
        # 'runbook' (Owed 3) follows the same law.
        routes = []
        ontology = {}
        runbook = {}
        while (self.peek().type == 'IDENT'
               and self.peek().value in ('runbook', 'route', 'ontology')):
            if self.peek().value == 'runbook':
                runbook.update(self.parse_runbook())
            elif self.peek().value == 'route':
                routes.append(self.parse_route())
            else:
                ontology.update(self.parse_ontology())
        self._ontology = ontology
        quests = []
        while self.peek().type != 'EOF':
            quests.append(self.parse_quest())
        return Program(quests, domain=domain, axioms=axioms,
                       runbook=runbook, routes=routes, ontology=ontology)

    def expect_ident_value(self, value) -> None:
        tok = self.next()
        if tok.type != 'IDENT' or tok.value != value:
            self.error(f"expected '{value}'", tok)

    def parse_route(self) -> RouteDecl:
        # route intent from user_input {
        #   recognize "cancel", "refund" -> "termination_request"
        #   fallback -> "general_inquiry" }
        self.expect_ident_value('route')
        self.expect_ident_value('intent')
        self.expect_ident_value('from')
        source = self.expect_ident()
        self.expect_op('{')
        rows, fallback = [], None
        while not (self.peek().type == 'OP' and self.peek().value == '}'):
            tok = self.next()
            if tok.type == 'IDENT' and tok.value == 'recognize':
                patterns = []
                while self.peek().type == 'STRING':
                    patterns.append(self.next().value)
                    if self.peek().type == 'OP' and self.peek().value == ',':
                        self.next()
                if not patterns:
                    self.error('recognize requires at least one pattern string')
                self.expect_op('->')
                label = self.next()
                if label.type != 'STRING':
                    self.error('recognize -> requires a string label', label)
                rows.append((patterns, label.value))
            elif tok.type == 'IDENT' and tok.value == 'fallback':
                self.expect_op('->')
                label = self.next()
                if label.type != 'STRING':
                    self.error('fallback -> requires a string label', label)
                fallback = label.value
            else:
                self.error("expected 'recognize' or 'fallback'", tok)
        self.expect_op('}')
        return RouteDecl(source, rows, fallback)

    def parse_runbook(self) -> dict:
        # runbook { scar_ttl = 86400 ... }  (Owed 3: TTL leaves the
        # per-invocation flag and becomes configuration, versioned with
        # the code it governs. Row VALIDATION — known names, constant
        # values — happens at transpile, with axiom names in scope.)
        self.expect_ident_value('runbook')
        self.expect_op('{')
        rows = {}
        while not (self.peek().type == 'OP' and self.peek().value == '}'):
            name = self.expect_ident()
            if name in rows:
                self.error(f"duplicate runbook row '{name}'")
            self.expect_op('=')
            rows[name] = self.parse_expr()
        if not rows:
            self.error('runbook requires at least one row '
                       '(e.g. scar_ttl = 86400)')
        self.expect_op('}')
        return rows

    def parse_ontology(self) -> dict:
        # ontology { define_keyword "audit" -> "host_audit" ... }
        self.expect_ident_value('ontology')
        self.expect_op('{')
        mapping = {}
        while not (self.peek().type == 'OP' and self.peek().value == '}'):
            self.expect_ident_value('define_keyword')
            kw = self.next()
            if kw.type != 'STRING':
                self.error('define_keyword requires a string keyword', kw)
            self.expect_op('->')
            fn = self.next()
            if fn.type != 'STRING':
                self.error('define_keyword -> requires a host function '
                           'name string', fn)
            mapping[kw.value] = fn.value
        self.expect_op('}')
        return mapping

    def parse_intent_decl(self) -> IntentDecl:
        # intent "general_inquiry" denies file_write, http_post
        self.expect_ident_value('intent')
        name = self.next()
        if name.type != 'STRING':
            self.error('intent requires a string name', name)
        denied = []
        if self.peek().type == 'IDENT' and self.peek().value == 'denies':
            self.next()
            denied.append(self.expect_ident())
            while self.peek().type == 'OP' and self.peek().value == ',':
                self.next()
                denied.append(self.expect_ident())
        return IntentDecl(name.value, denied)

    def parse_wait(self) -> WaitStmt:
        # wait until <expr>   (contextual: 'wait' and 'until' are IDENT values)
        self.expect_ident_value('wait')
        self.expect_ident_value('until')
        return WaitStmt(self.parse_expr())

    def parse_await(self) -> AwaitStmt:
        # await approval "reason"   (contextual IDENT values throughout)
        self.expect_ident_value('await')
        self.expect_ident_value('approval')
        reason = self.next()
        if reason.type != 'STRING':
            self.error('await approval requires a string reason', reason)
        return AwaitStmt(reason.value)

    def parse_ontology_call(self) -> OntologyCall:
        keyword = self.next().value  # an ontology-defined keyword
        return OntologyCall(keyword, self.parse_expr())

    def parse_quest(self) -> Quest:
        learn = False
        while self.peek().type == 'OP' and self.peek().value == '@':
            self.next()
            tok = self.next()
            if tok.type not in ('IDENT', 'KEYWORD'):
                self.error('expected a decorator name after @', tok)
            if tok.value == 'learn':
                learn = True
            else:
                self.error(f'unknown decorator @{tok.value}', tok)
        self.expect_keyword('quest')
        name = self.expect_ident()
        self.expect_op('{')
        items = []
        while not (self.peek().type == 'OP' and self.peek().value == '}'):
            if self.peek().type == 'EOF':
                self.error(f"quest '{name}' is missing a closing '}}'")
            items.append(self.parse_quest_item())
        self.expect_op('}')
        return Quest(name, items, learn=learn)

    def parse_quest_item(self):
        tok = self.peek()
        if tok.type == 'IDENT':
            if tok.value == 'intent':
                return self.parse_intent_decl()
            if tok.value == 'wait':
                return self.parse_wait()
            if tok.value == 'await':
                return self.parse_await()
            if tok.value in getattr(self, '_ontology', {}):
                return self.parse_ontology_call()
            self.error(f'expected a quest item, got {tok.value!r}')
        if tok.type != 'KEYWORD':
            self.error(f'expected a quest item, got {tok.value!r}')
        kw = tok.value
        if kw == 'goal':
            return self.parse_goal()
        if kw == 'constraint':
            return self.parse_constraint()
        if kw == 'believe':
            return self.parse_believe()
        if kw == 'scar':
            return self.parse_scar()
        if kw == 'tournament':
            return self.parse_tournament()
        if kw == 'prove':
            return self.parse_prove()
        if kw == 'success':
            return self.parse_success()
        if kw == 'let':
            return self.parse_let()
        if kw == 'recall':
            return self.parse_recall()
        if kw == 'on':
            return self.parse_on_fail()
        if kw == 'capability':
            self.next()
            return Capability(self.expect_ident())
        if kw == 'set':
            return self.parse_set()
        if kw == 'if':
            return self.parse_if()
        if kw == 'repeat':
            return self.parse_repeat()
        if kw == 'strategy':
            return self.parse_strategy()
        # A reserved KEYWORD with no quest-item branch is a MISPLACED
        # keyword: reject it loudly, the same death a misplaced IDENT gets.
        # Falling through used to return None on the SAME token — the
        # item loop in parse_quest/parse_block then called us again on
        # that token, forever: a one-word silent DoS on every parse entry
        # point (the Parser Guillotine, engine docket #4).
        self.error(f'expected a quest item, got {kw!r}')

    def parse_set(self):
        self.expect_keyword('set')
        name = self.expect_ident()
        self.expect_op('=')
        return Set(name, self.parse_expr())

    def parse_block(self):
        self.expect_op('{')
        body = []
        while not (self.peek().type == 'OP' and self.peek().value == '}'):
            if self.peek().type == 'EOF':
                self.error("block is missing a closing '}'")
            body.append(self.parse_quest_item())
        self.expect_op('}')
        return body

    def parse_if(self):
        self.expect_keyword('if')
        cond = self.parse_expr()
        body = self.parse_block()
        orelse = []
        if self.at_keyword('else'):
            self.next()
            orelse = self.parse_block()
        return If(cond, body, orelse)

    def parse_repeat(self):
        self.expect_keyword('repeat')
        count = self.parse_expr()
        self.expect_keyword('times')
        return Repeat(count, self.parse_block())
        self.error(f'unexpected keyword {kw!r} in quest body')

    def parse_recall(self):
        self.expect_keyword('recall')
        self.expect_keyword('scars')
        return RecallScars()

    def parse_on_fail(self):
        self.expect_keyword('on')
        self.expect_keyword('fail')
        self.expect_op('{')
        body = []
        while not (self.peek().type == 'OP' and self.peek().value == '}'):
            if self.peek().type == 'EOF':
                self.error("'on fail' block is missing a closing '}'")
            body.append(self.parse_quest_item())
        self.expect_op('}')
        return OnFail(body)

    def parse_goal(self):
        self.expect_keyword('goal')
        tok = self.next()
        if tok.type != 'STRING':
            self.error('goal requires a string', tok)
        return Goal(tok.value)

    def parse_constraint(self):
        self.expect_keyword('constraint')
        return Constraint(self.parse_expr())

    def parse_believe(self):
        self.expect_keyword('believe')
        name = self.expect_ident()
        self.expect_op('=')
        value = self.parse_expr()
        confidence, source = 1.0, None
        while True:
            if self.at_keyword('confidence'):
                self.next()
                tok = self.next()
                if tok.type != 'NUMBER':
                    self.error('confidence requires a number', tok)
                confidence = float(tok.value)
            elif self.at_keyword('source'):
                self.next()
                tok = self.next()
                if tok.type != 'STRING':
                    self.error('source requires a string', tok)
                source = tok.value
            else:
                break
        return Believe(name, value, confidence, source)

    def parse_scar(self):
        self.expect_keyword('scar')
        tok = self.next()
        if tok.type != 'STRING':
            self.error('scar requires a string message', tok)
        return ScarStmt(tok.value)

    def parse_let(self):
        self.expect_keyword('let')
        name = self.expect_ident()
        annotation = None
        if self.peek().type == 'OP' and self.peek().value == ':':
            self.next()
            tok = self.next()
            if tok.type not in ('IDENT', 'KEYWORD'):
                self.error(f'expected a type name after :, got {tok.value!r}', tok)
            annotation = tok.value
        self.expect_op('=')
        return Let(name, self.parse_expr(), annotation)

    def parse_prove(self):
        self.expect_keyword('prove')
        return Prove(self.parse_expr())

    def parse_success(self):
        self.expect_keyword('success')
        self.expect_keyword('when')
        return Success(self.parse_expr())

    def parse_tournament(self):
        self.expect_keyword('tournament')
        self.expect_op('{')
        collapse = False
        if self.at_keyword('score'):
            self.next()
        elif self.at_keyword('collapse'):
            self.next()
            collapse = True
        else:
            self.error("tournament requires 'score by' or 'collapse by'")
        self.expect_keyword('by')
        score_expr = self.parse_expr()
        strategies = []
        while self.at_keyword('strategy'):
            strategies.append(self.parse_strategy())
        if not strategies:
            self.error('tournament requires at least one strategy')
        self.expect_op('}')
        return Tournament(score_expr, strategies, collapse=collapse)

    def parse_strategy(self):
        self.expect_keyword('strategy')
        name = self.expect_ident()
        self.expect_op('{')
        cost, risk, body = 1.0, 0.0, []
        while not (self.peek().type == 'OP' and self.peek().value == '}'):
            if self.peek().type == 'EOF':
                self.error(f"strategy '{name}' is missing a closing '}}'")
            tok = self.peek()
            if tok.type == 'KEYWORD' and tok.value in ('cost', 'risk'):
                self.next()
                num = self.next()
                if num.type != 'NUMBER':
                    self.error(f"{tok.value} requires a number", num)
                if tok.value == 'cost':
                    cost = float(num.value)
                else:
                    risk = float(num.value)
            elif tok.type == 'KEYWORD' and tok.value in ('let', 'prove', 'scar',
                                                         'believe', 'goal',
                                                         'constraint', 'set',
                                                         'if', 'repeat',
                                                         'recall'):
                body.append(self.parse_quest_item())
            else:
                self.error(f'unexpected {tok.value!r} in strategy body')
        self.expect_op('}')
        return Strategy(name, cost, risk, body)

    # --- expressions (precedence climbing) ---
    def parse_expr(self):
        return self.parse_or()

    def parse_call_args(self):
        """Positional args plus Owed 1 keyword args (name=expr). Only the
        transpiler decides which keywords are legal (gated: just `key`)."""
        args, kwargs = [], {}
        if self.peek().type == 'OP' and self.peek().value == ')':
            return args, kwargs
        while True:
            if (self.peek().type == 'IDENT'
                    and self.peek(1).type == 'OP'
                    and self.peek(1).value == '='):
                name = self.next().value
                self.next()  # '='
                kwargs[name] = self.parse_expr()
            else:
                args.append(self.parse_expr())
            if self.peek().type == 'OP' and self.peek().value == ',':
                self.next()
                continue
            break
        return args, kwargs

    def parse_or(self):
        left = self.parse_and()
        while self.peek().type == 'OP' and self.peek().value == '||':
            self.next()
            left = BinOp('||', left, self.parse_and())
        return left

    def parse_and(self):
        left = self.parse_equality()
        while self.peek().type == 'OP' and self.peek().value == '&&':
            self.next()
            left = BinOp('&&', left, self.parse_equality())
        return left

    def parse_equality(self):
        left = self.parse_comparison()
        while self.peek().type == 'OP' and self.peek().value in ('==', '!='):
            op = self.next().value
            left = BinOp(op, left, self.parse_comparison())
        return left

    def parse_comparison(self):
        left = self.parse_additive()
        while self.peek().type == 'OP' and self.peek().value in ('<', '>', '<=', '>='):
            op = self.next().value
            left = BinOp(op, left, self.parse_additive())
        return left

    def parse_additive(self):
        left = self.parse_multiplicative()
        while self.peek().type == 'OP' and self.peek().value in ('+', '-'):
            op = self.next().value
            left = BinOp(op, left, self.parse_multiplicative())
        return left

    def parse_multiplicative(self):
        left = self.parse_unary()
        while self.peek().type == 'OP' and self.peek().value in ('*', '/', '%'):
            op = self.next().value
            left = BinOp(op, left, self.parse_unary())
        return left

    def parse_unary(self):
        tok = self.peek()
        if tok.type == 'OP' and tok.value in ('-', '!'):
            op = self.next().value
            return UnaryOp(op, self.parse_unary())
        return self.parse_postfix()

    def parse_postfix(self):
        """Method chaining and attribute access: expr.name, expr.method(args)."""
        expr = self.parse_primary()
        while self.peek().type == 'OP' and self.peek().value == '.':
            self.next()
            tok = self.next()
            if tok.type not in ('IDENT', 'KEYWORD'):
                self.error(f'expected a method or attribute name after ., '
                           f'got {tok.value!r}', tok)
            if self.peek().type == 'OP' and self.peek().value == '(':
                self.next()
                args = []
                if not (self.peek().type == 'OP' and self.peek().value == ')'):
                    args.append(self.parse_expr())
                    while self.peek().type == 'OP' and self.peek().value == ',':
                        self.next()
                        args.append(self.parse_expr())
                self.expect_op(')')
                expr = Call(Attr(expr, tok.value), args)
            else:
                expr = Attr(expr, tok.value)
        return expr

    def parse_primary(self):
        tok = self.next()
        if tok.type == 'NUMBER':
            return Num(tok.value)
        if tok.type == 'STRING':
            return Str(tok.value)
        if tok.type == 'KEYWORD' and tok.value in ('true', 'false'):
            return Bool(tok.value == 'true')
        if tok.type == 'IDENT':
            if self.peek().type == 'OP' and self.peek().value == '(':
                self.next()
                args, kwargs = self.parse_call_args()
                self.expect_op(')')
                return Call(Name(tok.value), args, kwargs)
            return Name(tok.value)
        if tok.type == 'OP' and tok.value == '(':
            expr = self.parse_expr()
            self.expect_op(')')
            return expr
        if tok.type == 'OP' and tok.value == '[':
            items = []
            if not (self.peek().type == 'OP' and self.peek().value == ']'):
                items.append(self.parse_expr())
                while self.peek().type == 'OP' and self.peek().value == ',':
                    self.next()
                    items.append(self.parse_expr())
            self.expect_op(']')
            return ListLit(items)
        if tok.type == 'OP' and tok.value == '{':
            pairs = []
            if not (self.peek().type == 'OP' and self.peek().value == '}'):
                pairs.append(self.parse_dict_pair())
                while self.peek().type == 'OP' and self.peek().value == ',':
                    self.next()
                    pairs.append(self.parse_dict_pair())
            self.expect_op('}')
            return DictLit(pairs)
        if tok.type == 'KEYWORD' and tok.value == 'lambda':
            params = [self.expect_ident()]
            while self.peek().type == 'OP' and self.peek().value == ',':
                self.next()
                params.append(self.expect_ident())
            self.expect_op(':')
            return Lambda(params, self.parse_expr())
        self.error(f'unexpected {tok.value!r} in expression', tok)

    def parse_dict_pair(self):
        key = self.parse_expr()
        self.expect_op(':')
        return (key, self.parse_expr())
