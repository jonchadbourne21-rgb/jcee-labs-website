# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""VOW lexer (SPEC §4)."""
from dataclasses import dataclass

KEYWORDS = {
    'quest', 'goal', 'constraint', 'believe', 'confidence', 'source',
    'scar', 'tournament', 'score', 'by', 'strategy', 'cost', 'risk',
    'prove', 'success', 'when', 'let', 'true', 'false',
    'learn', 'recall', 'scars', 'on', 'fail', 'capability',
    'if', 'else', 'repeat', 'times', 'set', 'lambda',
    'domain', 'axiom', 'deduce', 'given', 'collapse',
}

MULTI_OPS = ('==', '!=', '<=', '>=', '&&', '||', '->')
SINGLE_OPS = set('+-*/%<>=!(){},.@[]:')

# Keyword dialect aliases (author ruling 2026-07-23): prose words map to
# the symbol tokens the parser already knows.
_BOOL_WORD_OPS = {'and': '&&', 'or': '||', 'not': '!'}


class VowLexError(Exception):
    def __init__(self, line, col, message):
        self.line, self.col, self.message = line, col, message
        super().__init__(f'{message} (line {line}, col {col})')


@dataclass
class Token:
    type: str   # KEYWORD | IDENT | NUMBER | STRING | OP | EOF
    value: object
    line: int
    col: int

    def __repr__(self):
        return f'Token({self.type}, {self.value!r}, {self.line}:{self.col})'


def tokenize(source: str):
    tokens = []
    i, line, col = 0, 1, 1
    n = len(source)

    def advance(k=1):
        nonlocal i, line, col
        for _ in range(k):
            if i < n and source[i] == '\n':
                line += 1
                col = 1
            else:
                col += 1
            i += 1

    while i < n:
        c = source[i]
        if c in ' \t\r\n':
            advance()
            continue
        if c == '#':
            while i < n and source[i] != '\n':
                advance()
            continue
        start_line, start_col = line, col
        # strings
        if c == '"':
            advance()
            buf = []
            while i < n and source[i] != '"':
                if source[i] == '\\' and i + 1 < n:
                    esc = source[i + 1]
                    buf.append({'n': '\n', 't': '\t', '"': '"', '\\': '\\'}.get(esc, esc))
                    advance(2)
                else:
                    buf.append(source[i])
                    advance()
            if i >= n:
                raise VowLexError(start_line, start_col, 'unterminated string')
            advance()  # closing quote
            tokens.append(Token('STRING', ''.join(buf), start_line, start_col))
            continue
        # numbers
        if c.isdigit() or (c == '.' and i + 1 < n and source[i + 1].isdigit()):
            j = i
            seen_dot = False
            while j < n and (source[j].isdigit() or (source[j] == '.' and not seen_dot)):
                if source[j] == '.':
                    seen_dot = True
                j += 1
            text = source[i:j]
            advance(j - i)
            tokens.append(Token('NUMBER', float(text) if '.' in text else int(text),
                                start_line, start_col))
            continue
        # identifiers / keywords
        if c.isalpha() or c == '_':
            j = i
            while j < n and (source[j].isalnum() or source[j] == '_'):
                j += 1
            word = source[i:j]
            advance(j - i)
            # Keyword dialect (author ruling 2026-07-23 — "unify on
            # keywords"): and/or/not are aliases for &&/||/!, emitted as
            # the SAME op tokens so the parser and transpiler see one
            # vocabulary. The words are reserved from here on.
            alias = _BOOL_WORD_OPS.get(word)
            if alias is not None:
                tokens.append(Token('OP', alias, start_line, start_col))
                continue
            tokens.append(Token('KEYWORD' if word in KEYWORDS else 'IDENT',
                                word, start_line, start_col))
            continue
        # operators
        two = source[i:i + 2]
        if two in MULTI_OPS:
            advance(2)
            tokens.append(Token('OP', two, start_line, start_col))
            continue
        if c in SINGLE_OPS:
            advance()
            tokens.append(Token('OP', c, start_line, start_col))
            continue
        raise VowLexError(line, col, f'unexpected character {c!r}')
    tokens.append(Token('EOF', None, line, col))
    return tokens
