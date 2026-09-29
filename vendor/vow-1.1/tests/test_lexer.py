# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from vow.vow_lexer import tokenize, KEYWORDS


def types(src):
    return [(t.type, t.value) for t in tokenize(src) if t.type != 'EOF']


def test_keywords_and_idents():
    ts = types('quest foo goal')
    assert ts == [('KEYWORD', 'quest'), ('IDENT', 'foo'), ('KEYWORD', 'goal')]


def test_all_spec_keywords():
    for kw in ['quest','goal','constraint','believe','confidence','source',
               'scar','tournament','score','by','strategy','cost','risk',
               'prove','success','when','let','true','false']:
        assert kw in KEYWORDS
        assert tokenize(kw)[0].type == 'KEYWORD'


def test_numbers():
    ts = types('42 3.14 0.5')
    assert ts == [('NUMBER', 42), ('NUMBER', 3.14), ('NUMBER', 0.5)]


def test_strings_and_escapes():
    ts = types(r'"hello" "a\nb\t\"c"')
    assert ts[0] == ('STRING', 'hello')
    assert ts[1] == ('STRING', 'a\nb\t"c')


def test_multi_char_ops():
    ts = types('a == b != c <= d >= e && f || g')
    ops = [v for t, v in ts if t == 'OP']
    assert ops == ['==', '!=', '<=', '>=', '&&', '||']


def test_comments_ignored():
    ts = types('let x = 1 # this is a comment\nlet y = 2')
    assert ('NUMBER', 1) in ts and ('NUMBER', 2) in ts
    assert not any(t == 'STRING' and 'comment' in str(v) for t, v in ts)


def test_positions_tracked():
    toks = tokenize('quest\n  goal "g"')
    assert toks[0].line == 1 and toks[1].line == 2 and toks[1].col == 3


def test_bad_character_raises():
    try:
        tokenize('let x = ~')
        assert False, 'should raise'
    except Exception as e:
        assert 'line' in str(e)
