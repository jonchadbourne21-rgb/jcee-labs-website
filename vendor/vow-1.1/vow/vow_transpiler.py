# Copyright (c) 2026 JceeLabs and Jonathan Chadbourne. All rights reserved.
"""VOW transpiler + Shadow runtime (SPEC §6).

VOW quests transpile to "Shadow Python": ordinary Python plus a runtime
preamble providing scar memory, proofs, side-effect shadowing (dry-run),
belief tracking, constraints, and strategy tournaments.
"""
import hashlib
import hmac
import json
import os
import time
from typing import ClassVar, List, Dict, Any, Optional, Callable

from .effect_recovery import (RecoveryAction, load_recovery_adapter,
                              recovery_receipt, resolve_effect)
from .vow_ast import (Program, Quest, Goal, Constraint, Believe, ScarStmt,
                     RecallScars, OnFail, Capability, Set, If, Repeat,
                     Tournament, Strategy, Prove, Success, Let,
                     Axiom, Deduce, IntentDecl, OntologyCall,
                     WaitStmt, AwaitStmt,
                     Num, Str, Bool, Name, BinOp, UnaryOp, Call,
                     ListLit, DictLit, Lambda, Attr)

__all__ = [
    'SHADOW_RUNTIME_PREAMBLE', 'VowProofFailure', 'VowScarMemory',
    'VowSideEffectRecorder', 'VowCapability', 'VowTranspiler',
    'vow_set_dry_run', 'VOW_DRY_RUN',
]


# ---------------------------------------------------------------- runtime ---
class VowProofFailure(Exception):
    """Raised when a `prove` assertion fails. The failure is always
    recorded as a scar before raising — failures are learned, not hidden."""


class VowScarMemory:
    """Class-level memory of failures (scars). main.py may monkeypatch
    record/recall to persist to a database; signatures stay compatible."""
    _scars: ClassVar[List[Dict[str, Any]]] = []

    @classmethod
    def record(cls, message, context=None) -> None:
        cls._scars.append({'message': str(message), 'context': context,
                           'timestamp': time.time()})

    @classmethod
    def recall(cls, target=None) -> List[Dict[str, Any]]:
        if target is None:
            return list(cls._scars)
        return [s for s in cls._scars
                if target in s.get('message', '')
                or target in str(s.get('context', ''))]

    @classmethod
    def all(cls) -> List[Dict[str, Any]]:
        return list(cls._scars)

    @classmethod
    def clear(cls) -> None:
        cls._scars.clear()


class VowSuccessLog:
    """Successful strategy runs ({quest, strategy, seed, env}) — the raw
    material for diff_vs_success counterfactuals. main.py patches
    record/recall to persist to a database (same pattern as VowScarMemory);
    recall prefers same-quest entries, falling back to any quest."""
    _entries: ClassVar[List[Dict[str, Any]]] = []

    @classmethod
    def record(cls, entry) -> None:
        cls._entries.append(dict(entry))

    @classmethod
    def recall(cls, quest=None, strategy=None) -> List[Dict[str, Any]]:
        out = cls._entries
        if strategy is not None:
            out = [e for e in out if e.get('strategy') == strategy]
        if quest is not None:
            same = [e for e in out if e.get('quest') == quest]
            out = same or out
        return list(out)


class VowSideEffectRecorder:
    """Records every side effect (dry-run shadowed or live-executed)."""
    _effects: ClassVar[List[Dict[str, Any]]] = []

    @classmethod
    def record(cls, kind, detail) -> None:
        cls._effects.append({'kind': str(kind), 'detail': detail,
                             'timestamp': time.time(),
                             'dry_run': VOW_DRY_RUN})

    @classmethod
    def all(cls) -> List[Dict[str, Any]]:
        return list(cls._effects)

    @classmethod
    def clear(cls) -> None:
        cls._effects.clear()


VOW_DRY_RUN: bool = True


def vow_set_dry_run(flag: bool) -> None:
    global VOW_DRY_RUN
    VOW_DRY_RUN = bool(flag)


class VowJournalMismatch(Exception):
    """Resume replay diverged from the journal: the quest took a different
    path than the recorded run took. Resume refuses — replay never guesses.
    """


class VowSuspend(Exception):
    """A journaled run parks itself (Arc 3B, docs/DURABILITY.md §5).
    kind: 'wait' (carries wake_at) or 'approval' (carries reason). Not an
    error: the CLI catches this, marks the run suspended/awaiting_approval,
    and exits 0 with resumption instructions."""

    def __init__(self, kind, wake_at=None, reason=None):
        super().__init__(f'suspended:{kind}:{wake_at or reason or ""}')
        self.kind = kind
        self.wake_at = wake_at
        self.reason = reason


class JournalRuntime:
    """The durability journal (project/docs/DURABILITY.md): a hash-chained,
    append-only event log with a strict single replay cursor.

    live mode:   events append as the quest runs.
    replay mode: events are consumed in exactly the order they were written;
                 any divergence raises VowJournalMismatch; when the cursor
                 exhausts, the runtime flips to live (marking `replay_end`
                 in the chain) and the run continues from there.

    Mechanism lives here; policy (whispers, VowCapability reconstruction,
    winner-env restoration) stays in the preamble call sites.
    """

    GENESIS_PREV = '0' * 64

    def __init__(self, db, run_id, mode='live', events=None,
                 recovery_resolver=None):
        assert mode in ('live', 'replay')
        self._db = db
        self.run_id = run_id
        self.mode = mode
        self._events = list(events or [])
        self._cursor = 0
        self._recovery_resolver = recovery_resolver
        if self._recovery_resolver is None:
            self._recovery_resolver = load_recovery_adapter(
                os.environ.get('VOW_EFFECT_RECOVERY_ADAPTER'))
        # Arc 3C crash injection (docs/DURABILITY.md §6): when armed, the
        # write that would follow committed event #_kill_after kills the
        # process — a deterministic kill -9 at exactly that journal
        # boundary. Set only by the CLI from VOW_KILL_AFTER; a test hook.
        self._kill_after = None
        if self._events:
            self._seq = self._events[-1]['seq']
            self._prev = self._events[-1]['event_hash']
        else:
            self._seq = 0
            self._prev = self.GENESIS_PREV

    # -- hash chain primitives -------------------------------------------------
    def _hash(self, seq, kind, payload_json, prev):
        return hashlib.sha256(
            f'{self.run_id}|{seq}|{kind}|{payload_json}|{prev}'
            .encode()).hexdigest()

    def _store(self, write, kind, payload):
        """Build the next chained event and hand it to the backend's
        journal primitive. Arc 3D: the runtime is store-agnostic — the
        backend (SqliteDatabase / PostgresDatabase) owns its SQL dialect
        and transaction scope; the chain semantics are identical."""
        if self._kill_after is not None and self._seq >= self._kill_after:
            # Events 1.._kill_after are durably committed; this write is
            # the first thing after that boundary — die instead. os._exit:
            # no cleanup, no flush, no atexit (a real power-loss).
            os._exit(9)
        seq = self._seq + 1
        pj = json.dumps(payload, sort_keys=True, default=str)
        eh = self._hash(seq, kind, pj, self._prev)
        write({'run_id': self.run_id, 'seq': seq, 'kind': kind,
               'payload': pj, 'prev_hash': self._prev, 'event_hash': eh})
        self._seq, self._prev = seq, eh
        return eh

    def append(self, kind, payload):
        """Own-transaction append (events not part of a memory-row commit)."""
        self._store(self._db.journal_append, kind, payload)

    def append_tx(self, conn, kind, payload):
        """In-transaction append: the caller holds the db lock and commits —
        used for mem_write so the memory row and its event are atomic."""
        self._store(lambda ev: self._db.journal_append_tx(conn, ev),
                    kind, payload)

    def kill_if_boundary(self):
        """Arc 3C: fire the crash injection at the current head. The
        `_insert` hook covers boundaries 1..N-1 (the next write dies);
        the CLI calls this after `run_end` — the last journal write — to
        cover the final boundary between "journal complete" and
        "registry updated"."""
        if self._kill_after is not None and self._seq >= self._kill_after:
            os._exit(9)

    @property
    def head(self):
        return self._prev, self._seq

    @property
    def unconsumed(self):
        """Events the replay cursor never reached (0 in a faithful replay —
        anything else means the original run did work this run didn't)."""
        if self.mode != 'replay':
            return 0
        return len(self._events) - self._cursor

    @staticmethod
    def verify_chain(run_id, events):
        """Recompute the hash chain over loaded events. (ok, message)."""
        prev = JournalRuntime.GENESIS_PREV
        for ev in events:
            if ev['prev_hash'] != prev:
                return False, f"prev_hash broken at seq {ev['seq']}"
            pj = json.dumps(ev['payload'], sort_keys=True, default=str)
            eh = hashlib.sha256(
                f"{run_id}|{ev['seq']}|{ev['kind']}|{pj}|{prev}"
                .encode()).hexdigest()
            if eh != ev['event_hash']:
                return False, f"event_hash mismatch at seq {ev['seq']}"
            prev = eh
        return True, f'chain intact ({len(events)} events)'

    # -- strict single replay cursor --------------------------------------------
    # Lifecycle markers are evidence, not execution events: the cursor skips
    # them transparently (a twice-crashed run carries resume_begin and
    # replay_end markers mid-stream).
    MARKERS = frozenset({'run_begin', 'resume_begin', 'replay_end',
                         'effect_recovery_decision'})

    def peek(self):
        if self.mode != 'replay':
            return None
        while (self._cursor < len(self._events)
               and self._events[self._cursor]['kind'] in self.MARKERS):
            self._cursor += 1
        if self._cursor < len(self._events):
            return self._events[self._cursor]
        return None

    def _next(self):
        ev = self._events[self._cursor]
        self._cursor += 1
        return ev

    def _go_live(self):
        self.mode = 'live'
        self.append('replay_end', {'at_seq': self._seq})

    def _mismatch(self, msg):
        raise VowJournalMismatch(f'journal_mismatch: {msg}')

    def _expect(self, kind):
        """Consume the next event demanding a kind; None when the journal is
        exhausted (runtime flips to live). Raises on any divergence."""
        ev = self.peek()
        if ev is None:
            if self.mode == 'replay':
                self._go_live()
            return None
        if ev['kind'] != kind:
            self._mismatch(f"expected {kind} at seq {ev['seq']}, "
                           f"found {ev['kind']}")
        return self._next()

    @staticmethod
    def _same(a, b):
        return (json.dumps(a, sort_keys=True, default=str)
                == json.dumps(b, sort_keys=True, default=str))

    # -- effects (preamble: _vow_gated) -----------------------------------------
    def effect_replay(self, capability, action, args, key=None):
        """The recorded instruction for this effect call, or None (execute
        live, then report through effect_record)."""
        if self.mode != 'replay':
            return None
        ev = self.peek()
        if ev is not None and ev['kind'] == 'effect_intent':
            p = ev['payload']
            if not self._same([p['capability'], p['action'], p['args'],
                               p.get('key')],
                              [capability, action, list(args), key]):
                self._mismatch(
                    f"effect diverged at seq {ev['seq']}: journal has "
                    f"{p['capability']}:{p['action']}{p['args']}"
                    f" (key={p.get('key')!r}), code called "
                    f"{capability}:{action}{list(args)} (key={key!r})")
            self._next()
            nxt = self.peek()
            if nxt is not None and nxt['kind'] == 'effect_result':
                self._next()
                return nxt['payload']
            # OPERATION-006 (engine docket #6, frozen case 018): an intent
            # without a result is the crash window -- but the window may
            # have ALREADY closed in an earlier resume: a later intent for
            # the SAME call, carrying its result. Look one pair further
            # (markers are transparent to peek). If the pair is there,
            # consume it and return the recorded result. Without this the
            # cursor flipped live here and every LATER journaled fact was
            # orphaned: approval grants were never consumed (the run
            # re-parked on every approve) and the completed effect
            # re-executed -- exactly-once broken, grant burned.
            _save = self._cursor
            nxt2 = self.peek()
            if (nxt2 is not None and nxt2['kind'] == 'effect_intent'
                    and self._same(
                        [nxt2['payload'].get('capability'),
                         nxt2['payload'].get('action'),
                         nxt2['payload'].get('args'),
                         nxt2['payload'].get('key')],
                        [capability, action, list(args), key])):
                self._next()
                nxt3 = self.peek()
                if nxt3 is not None and nxt3['kind'] == 'effect_result':
                    # window already closed in an earlier resume: the
                    # orphan intent is a disclosed marker, not a live
                    # round -- consume the completing pair and move on.
                    self._next()
                    return nxt3['payload']
            self._cursor = _save
            # Owed 1 (idempotency keys): before accepting the at-least-once
            # re-fire, a KEYED effect consults the durable record across
            # ALL runs in this store. A prior completion with the same
            # (capability, action, key) means the world already saw this
            # effect — return the recorded result, journal the consult,
            # never re-fire. Effectively-once for every keyed effect.
            if key is not None:
                found = self._db.journal_find_completed_effect(
                    capability, action, key)
                if found is not None:
                    # OG O1-1 cure on the crash-window path too: the key
                    # and the args must name the SAME effect.
                    if list(found.get('args') or []) != [str(a) for a in args]:
                        raise RuntimeError(
                            f"idempotency key conflict: key {key!r} "
                            f"completed {capability}:{action} with args "
                            f"{found.get('args')} (run {found['run_id']}) "
                            f"and is now requested with args "
                            f"{[str(a) for a in args]} — a key names ONE "
                            f"effect")
                    self.mode = 'live'
                    self.append('replay_end',
                                {'at_seq': self._seq,
                                 'note': 'crash window: keyed effect '
                                         'already completed elsewhere '
                                         '(idempotent replay, no re-fire)'})
                    payload = {'capability': capability, 'action': action,
                               'outcome': 'idempotent_replay',
                               'key': key,
                               'result': found['payload'].get('result'),
                               'source_run_id': found['run_id']}
                    self.append('effect_result', payload)
                    return payload
                # Authority closure: the local journal cannot distinguish
                # "the outside world committed, receipt lost" from "the
                # outside world never committed."  A typed adapter may ask
                # the authority.  The adapter observes; this frozen runtime
                # policy decides.  Every decision is hash-chained before VOW
                # suppresses, retries, waits, or escalates.
                if self._recovery_resolver is not None:
                    observation, decision = resolve_effect(
                        self._recovery_resolver, capability, action,
                        [str(a) for a in args], key)
                    receipt = recovery_receipt(
                        observation, decision, capability=capability,
                        action=action, key=key)
                    receipt['adapter_sha256'] = getattr(
                        self._recovery_resolver, '_vow_adapter_sha256', None)
                    receipt['adapter_function'] = getattr(
                        self._recovery_resolver, '_vow_adapter_function',
                        getattr(self._recovery_resolver, '__name__', None))
                    self.mode = 'live'
                    self.append('replay_end',
                                {'at_seq': self._seq,
                                 'note': 'crash window: authority '
                                         'reconciliation invoked'})
                    self.append('effect_recovery_decision', receipt)
                    if decision.action == RecoveryAction.NOOP:
                        payload = {
                            'capability': capability,
                            'action': action,
                            'outcome': 'ok',
                            'recovery': 'authority_reconciled',
                            'key': key,
                            'result': observation.evidence.result,
                        }
                        self.append('effect_result', payload)
                        return payload
                    if decision.action == RecoveryAction.RETRY_SAME_KEY:
                        return None
                    if decision.action == RecoveryAction.WAIT:
                        import datetime as _dt
                        wait_seconds = max(
                            1, observation.evidence.retry_after_seconds)
                        wake = (_dt.datetime.now(_dt.timezone.utc)
                                + _dt.timedelta(seconds=wait_seconds))
                        raise VowSuspend(
                            'wait',
                            wake_at=wake.replace(tzinfo=None).isoformat(
                                timespec='seconds'),
                        )
                    # RETRY_MISSING requires an adapter-specific targeted
                    # executor; ESCALATE is already a refusal.  Until that
                    # executor exists, both park for a human decision rather
                    # than silently broadening a partial retry.
                    raise VowSuspend(
                        'approval',
                        reason=(f"effect recovery {decision.action.value}: "
                                f"{decision.reason}"),
                    )
            # true crash window: the effect never completed anywhere --
            # re-execute live (at-least-once, disclosed by the orphan).
            self.mode = 'live'
            self.append('replay_end',
                        {'at_seq': self._seq,
                         'note': 'crash window: effect re-executed'})
            return None
        self._expect('effect_intent')  # raises or flips live
        return None

    def effect_record(self, capability, action, args, call, shadow,
                      key=None, consult=False):
        """Live path: journal the intent BEFORE executing (the crash window
        is then exactly one effect wide), execute, journal the outcome.

        Owed 1: with consult=True (keyed, live), the durable record is
        consulted BEFORE the intent is even written — a prior completion
        with the same key means this effect already happened in the world.
        The intent+idempotent-replay pair is then one atomic commit and
        the real call never fires."""
        if consult and key is not None:
            found = self._db.journal_find_completed_effect(
                capability, action, key)
            if found is not None:
                # OG O1-1 cure: a key names ONE effect. Same key with
                # different args is not a replay — it is a conflict, and
                # it must be loud, never a silent return of another
                # effect's result.
                if list(found.get('args') or []) != [str(a) for a in args]:
                    raise RuntimeError(
                        f"idempotency key conflict: key {key!r} completed "
                        f"{capability}:{action} with args "
                        f"{found.get('args')} (run {found['run_id']}) and "
                        f"is now requested with args "
                        f"{[str(a) for a in args]} — a key names ONE "
                        f"effect; reuse with different arguments is an "
                        f"error, not a replay")
                events = []
                for kind, payload in (
                        ('effect_intent',
                         {'capability': capability, 'action': action,
                          'args': [str(a) for a in args], 'key': key}),
                        ('effect_result',
                         {'capability': capability, 'action': action,
                          'outcome': 'idempotent_replay', 'key': key,
                          'result': found['payload'].get('result'),
                          'source_run_id': found['run_id']})):
                    seq = self._seq + 1
                    pj = json.dumps(payload, sort_keys=True, default=str)
                    eh = self._hash(seq, kind, pj, self._prev)
                    events.append({'run_id': self.run_id, 'seq': seq,
                                   'kind': kind, 'payload': pj,
                                   'prev_hash': self._prev,
                                   'event_hash': eh})
                    self._seq, self._prev = seq, eh
                self._db.journal_append_many(events)
                return found['payload'].get('result')
        self.append('effect_intent',
                    {'capability': capability, 'action': action,
                     'args': [str(a) for a in args], 'key': key})
        try:
            result = call()
        except Exception as exc:
            self.append('effect_result',
                        {'capability': capability, 'action': action,
                         'outcome': 'error', 'key': key,
                         'error': f'{type(exc).__name__}: {exc}'})
            raise
        outcome = 'shadow' if result is shadow else 'ok'
        self.append('effect_result',
                    {'capability': capability, 'action': action,
                     'outcome': outcome, 'key': key,
                     'result': result if outcome == 'ok' else None,
                     'shadow': shadow})
        return result

    def effect_record_blocked(self, capability, action, args, shadow,
                              whisper, key=None):
        """Live path for an intent-denied effect: intent + blocked result,
        one commit (no real-world execution between them) — an atomic
        pair, so the only crash boundaries are before/after the pair."""
        if self._kill_after is not None and self._seq >= self._kill_after:
            os._exit(9)
        events = []
        for kind, payload in (
                ('effect_intent', {'capability': capability,
                                   'action': action,
                                   'args': [str(a) for a in args],
                                   'key': key}),
                ('effect_result', {'capability': capability,
                                   'action': action, 'outcome': 'blocked',
                                   'key': key,
                                   'shadow': shadow, 'whisper': whisper})):
            seq = self._seq + 1
            pj = json.dumps(payload, sort_keys=True, default=str)
            eh = self._hash(seq, kind, pj, self._prev)
            events.append({'run_id': self.run_id, 'seq': seq, 'kind': kind,
                           'payload': pj, 'prev_hash': self._prev,
                           'event_hash': eh})
            self._seq, self._prev = seq, eh
        self._db.journal_append_many(events)

    # -- memory (main.py routing layer) ------------------------------------------
    def mem_recall(self, key, fetch):
        """Memory read. replay: journaled rows verbatim (DB never consulted).
        live: fetch, journal, return."""
        if self.mode == 'replay':
            ev = self._expect('mem_recall')
            if ev is None:
                pass  # flipped live: fall through to fetch+append
            else:
                if not self._same(ev['payload'].get('key'), key):
                    self._mismatch(
                        f"memory read diverged at seq {ev['seq']}: "
                        f"journal {ev['payload'].get('key')}, live {key}")
                return ev['payload']['rows']
        rows = fetch()
        self.append('mem_recall', {'key': key, 'rows': rows})
        return rows

    def mem_write_decision(self, payload):
        """Memory write. replay: consume the matching event, return True
        (suppress the write — the original row is already in the DB).
        live: False (caller writes; the DB appends the event atomically)."""
        if self.mode == 'replay':
            ev = self._expect('mem_write')
            if ev is None:
                return False  # flipped live
            if not self._same(ev['payload'], payload):
                self._mismatch(
                    f"memory write diverged at seq {ev['seq']}: "
                    f"journal {ev['payload']}, live {payload}")
            return True
        return False

    # -- suspension (Arc 3B, docs/DURABILITY.md §5) -------------------------------
    def wait_enter(self, wake_at, shadow=False):
        """`wait until`. live: journal wait_enter, return 'suspend' (or
        'shadow' in a dry-run). replay: consume the matching wait_enter —
        the CLI only resumes suspended runs when due, so reaching here means
        the time has come: journal wait_done and return 'done'."""
        if self.mode == 'replay':
            ev = self._expect('wait_enter')
            if ev is None:
                pass  # flipped live: journal + suspend below
            else:
                if not self._same(ev['payload'].get('wake_at'), wake_at):
                    self._mismatch(
                        f"wait diverged at seq {ev['seq']}: journal "
                        f"{ev['payload'].get('wake_at')}, live {wake_at}")
                if ev['payload'].get('shadow'):
                    return 'shadow'
                import datetime as _dt
                # A wait_done journaled by an earlier resuming life is
                # CONSUMED, not duplicated: re-appending it left the stale
                # event in the stream and the next _expect tripped on it
                # (found by the gauntlet: wait -> sweep resume -> approval
                # park -> approve resume — the third life mismatched here).
                nxt = self.peek()
                if (nxt is not None and nxt['kind'] == 'wait_done'
                        and self._same(nxt['payload'].get('wake_at'),
                                       wake_at)):
                    self._expect('wait_done')
                    return 'done'
                self.append('wait_done',
                            {'wake_at': wake_at,
                             'resumed_at': _dt.datetime.now(_dt.timezone.utc).replace(tzinfo=None)
                                 .strftime('%Y-%m-%dT%H:%M:%S')})
                return 'done'
        self.append('wait_enter',
                    {'wake_at': wake_at, 'shadow': True} if shadow
                    else {'wake_at': wake_at})
        return 'shadow' if shadow else 'suspend'

    def approval_request(self, reason, shadow=False):
        """`await approval`. live: journal the request, return {'suspend'}.
        replay: consume it; the next event must be approval_granted (the CLI
        gates plain resumes by run status) — return the grant payload."""
        if self.mode == 'replay':
            ev = self._expect('approval_request')
            if ev is None:
                pass
            else:
                if not self._same(ev['payload'].get('reason'), reason):
                    self._mismatch(
                        f"approval diverged at seq {ev['seq']}: journal "
                        f"{ev['payload'].get('reason')!r}, live {reason!r}")
                if ev['payload'].get('shadow'):
                    return {'shadow': True}
                ev2 = self._expect('approval_granted')
                if ev2 is None:
                    # journal ended right after the request and we were let
                    # through anyway — suspend again, never guess
                    return {'suspend_again': True}
                return ev2['payload']
        self.append('approval_request',
                    {'reason': reason, 'shadow': True} if shadow
                    else {'reason': reason})
        return {'shadow': True} if shadow else {'suspend': True}

    # -- tournaments (preamble: _vow_tournament) ----------------------------------
    def tournament_event(self, seed, live_results, live_winner,
                         live_senv_names):
        """live: append tournament_result, return None.
        replay: consume + validate, return the journaled payload (the
        preamble replaces metrics wholesale and restores the winner's env;
        the winner must be among the live proof-passers)."""
        if self.mode == 'replay':
            ev = self._expect('tournament_result')
            if ev is None:
                pass  # flipped live
            else:
                p = ev['payload']
                if not self._same(p.get('seed'), seed):
                    self._mismatch(
                        f"tournament seed diverged at seq {ev['seq']}: "
                        f"journal {p.get('seed')}, live {seed}")
                w = p.get('winner')
                if w is not None and w not in live_senv_names:
                    self._mismatch(
                        f"journaled winner '{w}' did not pass proofs in "
                        f"replay — real divergence, refusing")
                return p
        self.append('tournament_result',
                    {'seed': seed, 'results': live_results,
                     'winner': live_winner})
        return None


class VowCapability:
    """A guarded side-effecting action.

    Dry-run: the effect is recorded, fn is NOT called, shadow_result returned.
    Live:    fn actually executes, the effect is recorded, real result returned.
    """

    def __init__(self, name: str, fn: Callable, shadow_result=None):
        self.name = name
        self.fn = fn
        self.shadow_result = shadow_result

    def __call__(self, *args, **kwargs):
        if VOW_DRY_RUN:
            VowSideEffectRecorder.record(
                self.name, {'args': repr(args), 'kwargs': repr(kwargs),
                            'executed': False})
            return self.shadow_result
        result = self.fn(*args, **kwargs)
        VowSideEffectRecorder.record(
            self.name, {'args': repr(args), 'kwargs': repr(kwargs),
                        'executed': True, 'result': repr(result)})
        return result


class VowTypeError(Exception):
    """A `let` type annotation was violated at runtime: the declared
    contract did not hold. Counts as a strategy failure (honest evidence),
    not a quest crash."""


class VowList(list):
    """list + the VOW collection methods. All pure, all chainable."""

    def filter(self, fn):
        return VowList(x for x in self if fn(x))

    def map(self, fn):
        return VowList(fn(x) for x in self)

    def sort_by(self, fn):
        return VowList(sorted(self, key=fn))

    def group_by(self, fn):
        out = {}
        for x in self:
            out.setdefault(fn(x), VowList()).append(x)
        return VowDict(out)


class VowDict(dict):
    """dict + attribute access (d.key == d['key']) + value-semantics
    filter/map. Real dict methods win on name collisions."""

    def __getattr__(self, name):
        try:
            return self[name]
        except KeyError:
            raise AttributeError(name) from None

    def filter(self, fn):
        """Keep entries whose VALUE satisfies the predicate."""
        return VowDict({k: v for k, v in self.items() if fn(v)})

    def map(self, fn):
        """Transform every VALUE, keys unchanged."""
        return VowDict({k: fn(v) for k, v in self.items()})


def _vow_list(items=()):
    return VowList(items)


def _vow_dict(pairs=None):
    return VowDict(pairs or {})


def _vow_attr(obj, name):
    """Attribute access that also works on plain dicts (e.g. recalled scars)."""
    if isinstance(obj, dict):
        try:
            return obj[name]
        except KeyError:
            raise AttributeError(name) from None
    return getattr(obj, name)


_VOW_TYPE_NAMES = ('int', 'str', 'bool', 'float', 'list', 'dict')


def _vow_annotate(name, value, type_name):
    """Runtime check behind `let x: T = ...`. Annotations are enforced
    contracts, not hints: a violation raises VowTypeError."""
    t = str(type_name)
    if t == 'int':
        ok = isinstance(value, int) and not isinstance(value, bool)
    elif t == 'str':
        ok = isinstance(value, str)
    elif t == 'bool':
        ok = isinstance(value, bool)
    elif t == 'float':
        ok = isinstance(value, (int, float)) and not isinstance(value, bool)
    elif t == 'list':
        ok = isinstance(value, list)
    elif t == 'dict':
        ok = isinstance(value, dict)
    else:
        raise VowTypeError(f"unknown type annotation '{t}' on '{name}'")
    if not ok:
        raise VowTypeError(
            f"type annotation violated: '{name}' declared {t}, got "
            f"{type(value).__name__} ({value!r})")
    return value


# ------------------------------------------------------------- preamble ---
# Injected ahead of generated quest code. Defensive: names already present
# in the execution globals (e.g. injected by VowEngineManager) are kept,
# so host overrides (DB-backed scar memory, dry-run flags) still apply.
SHADOW_RUNTIME_PREAMBLE: str = '''
# === VOW Shadow Runtime Preamble ===
import time as _vow_time

try:
    VowProofFailure
except NameError:
    class VowProofFailure(Exception):
        pass

try:
    VowScarMemory
except NameError:
    class VowScarMemory:
        _scars = []
        @classmethod
        def record(cls, message, context=None):
            cls._scars.append({'message': str(message), 'context': context,
                               'timestamp': _vow_time.time()})
        @classmethod
        def recall(cls, target=None):
            if target is None:
                return list(cls._scars)
            return [s for s in cls._scars
                    if target in s.get('message', '')
                    or target in str(s.get('context', ''))]
        @classmethod
        def all(cls):
            return list(cls._scars)
        @classmethod
        def clear(cls):
            cls._scars.clear()

try:
    VowSideEffectRecorder
except NameError:
    class VowSideEffectRecorder:
        _effects = []
        @classmethod
        def record(cls, kind, detail):
            cls._effects.append({'kind': str(kind), 'detail': detail,
                                 'timestamp': _vow_time.time()})
        @classmethod
        def all(cls):
            return list(cls._effects)
        @classmethod
        def clear(cls):
            cls._effects.clear()

try:
    VOW_DRY_RUN
except NameError:
    VOW_DRY_RUN = True

try:
    vow_set_dry_run
except NameError:
    def vow_set_dry_run(flag):
        global VOW_DRY_RUN
        VOW_DRY_RUN = bool(flag)

try:
    VowCapability
except NameError:
    class VowCapability:
        def __init__(self, name, fn, shadow_result=None):
            self.name, self.fn, self.shadow_result = name, fn, shadow_result
        def __call__(self, *args, **kwargs):
            if VOW_DRY_RUN:
                VowSideEffectRecorder.record(
                    self.name, {'args': repr(args), 'kwargs': repr(kwargs),
                                'executed': False})
                return self.shadow_result
            result = self.fn(*args, **kwargs)
            VowSideEffectRecorder.record(
                self.name, {'args': repr(args), 'kwargs': repr(kwargs),
                            'executed': True, 'result': repr(result)})
            return result

try:
    VowList
except NameError:
    class VowTypeError(Exception):
        """A `let` type annotation was violated at runtime: the declared
        contract did not hold. Counts as a strategy failure (honest evidence),
        not a quest crash."""


    class VowList(list):
        """list + the VOW collection methods. All pure, all chainable."""

        def filter(self, fn):
            return VowList(x for x in self if fn(x))

        def map(self, fn):
            return VowList(fn(x) for x in self)

        def sort_by(self, fn):
            return VowList(sorted(self, key=fn))

        def group_by(self, fn):
            out = {}
            for x in self:
                out.setdefault(fn(x), VowList()).append(x)
            return VowDict(out)


    class VowDict(dict):
        """dict + attribute access (d.key == d['key']) + value-semantics
        filter/map. Real dict methods win on name collisions."""

        def __getattr__(self, name):
            try:
                return self[name]
            except KeyError:
                raise AttributeError(name) from None

        def filter(self, fn):
            """Keep entries whose VALUE satisfies the predicate."""
            return VowDict({k: v for k, v in self.items() if fn(v)})

        def map(self, fn):
            """Transform every VALUE, keys unchanged."""
            return VowDict({k: fn(v) for k, v in self.items()})


    def _vow_list(items=()):
        return VowList(items)


    def _vow_dict(pairs=None):
        return VowDict(pairs or {})


    def _vow_attr(obj, name):
        """Attribute access that also works on plain dicts (e.g. recalled scars)."""
        if isinstance(obj, dict):
            try:
                return obj[name]
            except KeyError:
                raise AttributeError(name) from None
        return getattr(obj, name)


    _VOW_TYPE_NAMES = ('int', 'str', 'bool', 'float', 'list', 'dict')


    def _vow_annotate(name, value, type_name):
        """Runtime check behind `let x: T = ...`. Annotations are enforced
        contracts, not hints: a violation raises VowTypeError."""
        t = str(type_name)
        if t == 'int':
            ok = isinstance(value, int) and not isinstance(value, bool)
        elif t == 'str':
            ok = isinstance(value, str)
        elif t == 'bool':
            ok = isinstance(value, bool)
        elif t == 'float':
            ok = isinstance(value, (int, float)) and not isinstance(value, bool)
        elif t == 'list':
            ok = isinstance(value, list)
        elif t == 'dict':
            ok = isinstance(value, dict)
        else:
            raise VowTypeError(f"unknown type annotation '{t}' on '{name}'")
        if not ok:
            raise VowTypeError(
                f"type annotation violated: '{name}' declared {t}, got "
                f"{type(value).__name__} ({value!r})")
        return value

# --- quest-state helpers (used by generated code) ---
_vow_beliefs = []
_vow_constraints = []
_vow_goal_text = None
_vow_tournament_results = []

_vow_learn_enabled = False
_vow_declared_capabilities = set()
_vow_current_quest = None
_vow_current_seed = None
_vow_last_reason = None    # reason of the most recent prove failure
_vow_whispers = []         # non-blocking guidance events (golden path, etc.)
_vow_shared_refs = []      # env keys holding mutables shared by all strategies
_vow_state_log = []        # (op, strategy, key) state accesses (Quantum Dict)
_vow_current_intent = None    # the quest's declared intent, if any
_vow_intent_denied = set()    # gated actions denied by that intent

def _vow_intent_declare(name, denied):
    """A quest declares what it IS. From here, the runtime watches what it
    DOES — denied effects are blocked at the gate, with a whisper."""
    global _vow_current_intent, _vow_intent_denied
    _vow_current_intent = name
    _vow_intent_denied = set(denied or [])

def _vow_route_intent(text):
    """Classify text with the program's route table: first row whose any
    pattern appears (case-insensitive substring) wins; else the fallback.
    Zero tokens, nanosecond latency — the enumerable majority never
    reaches a model."""
    t = str(text).lower()
    for route in _VOW_ROUTES:
        for patterns, label in route.get('rows', []):
            for p in patterns:
                if str(p).lower() in t:
                    return {'intent': label, 'matched': p,
                            'source': route.get('source')}
    for route in _VOW_ROUTES:
        if route.get('fallback') is not None:
            return {'intent': route['fallback'], 'matched': None,
                    'source': route.get('source')}
    return {'intent': None, 'matched': None, 'source': None}

def _vow_ontology_call(keyword, value):
    """A user-defined keyword applied to a value. The host registers the
    callable; an unbound keyword warns and passes the value through —
    never a silent transformation, never a crash."""
    fn = _VOW_ONTOLOGY.get(keyword)
    if fn is None:
        _vow_whisper('ontology_unbound',
                     {'keyword': keyword,
                      'expected_host_fn': _VOW_ONTOLOGY_MAP.get(keyword),
                      'note': 'no host function registered; value passed '
                              'through unchanged'})
        return value
    return fn(value)

class _VowQuantumDict(dict):
    """Quantum Dict: per-strategy state instrumentation. Every read and
    write a strategy makes is logged under its name — the tournament can
    report each strategy's input FOOTPRINT, and shared-mutable hazards are
    visible instead of silent. (Strategies get isolated env copies, so
    cross-strategy entanglement cannot occur by construction; this is the
    sensor that PROVES it every run and arms for effectful futures.)"""
    def __init__(self, *a, _owner=None, **k):
        super().__init__(*a, **k)
        self._vow_owner = _owner

    def __getitem__(self, key):
        _vow_state_log.append(('r', self._vow_owner, key))
        return super().__getitem__(key)

    def __setitem__(self, key, value):
        _vow_state_log.append(('w', self._vow_owner, key))
        return super().__setitem__(key, value)

def _vow_whisper(kind, detail=None):
    """A whisper: structured, non-blocking guidance in the run trace. It
    teaches without crashing — the compassionate-unknotter channel."""
    _vow_whispers.append({'kind': str(kind), 'detail': detail,
                          'quest': _vow_current_quest})

def _vow_mean(values):
    """Restricted-builtin-safe mean (no sum() dependency in the sandbox)."""
    vals = [v for v in (values or []) if isinstance(v, (int, float))]
    if not vals:
        return None
    total = 0.0
    for v in vals:
        total += v
    return total / len(vals)

try:
    _VOW_SCAR_TTL
except NameError:
    _VOW_SCAR_TTL = None   # seconds; None = scars never decay

try:
    _VOW_SUCCESS_TTL
except NameError:
    _VOW_SUCCESS_TTL = None   # seconds; None = victories never age

try:
    _VOW_DOMAIN
except NameError:
    _VOW_DOMAIN = 'exploratory'   # 'sop' enables golden-path optimization
try:
    _VOW_AXIOMS
except NameError:
    _VOW_AXIOMS = {}              # compile-time truths (axiom/deduce)
try:
    _VOW_ROUTES
except NameError:
    _VOW_ROUTES = []              # deterministic intent routers
try:
    _VOW_ONTOLOGY_MAP
except NameError:
    _VOW_ONTOLOGY_MAP = {}        # keyword -> expected host fn name
try:
    _VOW_ONTOLOGY
except NameError:
    _VOW_ONTOLOGY = {}            # keyword -> host-registered callable
try:
    _VOW_GOLDEN_AFTER
except NameError:
    _VOW_GOLDEN_AFTER = 3         # consecutive same-situation wins -> golden
try:
    _VOW_CHALLENGE_EVERY
except NameError:
    _VOW_CHALLENGE_EVERY = 5      # golden wins between open-field runs

def _vow_scar_age(scar):
    """Age of a scar in seconds (None if unknown — treated as fresh).
    In-memory scars carry float `timestamp`; SQLite rows carry ISO
    `created_at` (UTC)."""
    ts = scar.get('timestamp') if isinstance(scar, dict) else None
    if isinstance(ts, (int, float)):
        return _vow_time.time() - ts
    ca = scar.get('created_at') if isinstance(scar, dict) else None
    if ca:
        try:
            from datetime import datetime as _dt, timezone as _tz
            _now = _dt.now(_tz.utc).replace(tzinfo=None)  # sqlite UTC, naive
            return (_now - _dt.fromisoformat(str(ca))).total_seconds()
        except Exception:
            return None
    return None


# OWED 5: victories age the way wounds do — same doctrine (float
# `timestamp` in memory, ISO `created_at` UTC from SQLite, unknown age
# treated as fresh). One helper, one clock law.
_vow_mem_age = _vow_scar_age

try:
    VowSuccessLog
except NameError:
    class VowSuccessLog:
        _entries = []
        @classmethod
        def record(cls, entry):
            cls._entries.append(dict(entry))
        @classmethod
        def recall(cls, quest=None, strategy=None):
            out = cls._entries
            if strategy is not None:
                out = [e for e in out if e.get('strategy') == strategy]
            if quest is not None:
                same = [e for e in out if e.get('quest') == quest]
                out = same or out
            return list(out)

def _vow_autopsy(expr_src, env):
    """Zero-token failure diagnosis: read the failed prove expression (the
    programmer's declared intent) and report WHAT was expected, WITH which
    values, and HOW FAR off it was. Pure symbolic introspection — margins
    are computed only for shapes we can resolve safely (name/constant
    comparisons); anything more complex is honestly labelled."""
    info = {'prove': str(expr_src) if expr_src is not None else None,
            'kind': 'undeclared'}
    if not expr_src:
        return info
    try:
        import ast as _ast
        tree = _ast.parse(str(expr_src), mode='eval')
        names = sorted({n.id for n in _ast.walk(tree)
                        if isinstance(n, _ast.Name) and not n.id.startswith('_')})
        if isinstance(env, dict):
            info['bindings'] = {k: env.get(k) for k in names if k in env}
        node = tree.body

        def _val(n):
            if isinstance(n, _ast.Name) and isinstance(env, dict):
                return env[n.id]
            if isinstance(n, _ast.Constant):
                return n.value
            if (isinstance(n, _ast.UnaryOp) and isinstance(n.op, _ast.USub)
                    and isinstance(n.operand, _ast.Constant)):
                return -n.operand.value
            raise ValueError('unresolvable')

        _OPS = {_ast.Lt: '<', _ast.LtE: '<=', _ast.Gt: '>', _ast.GtE: '>=',
                _ast.Eq: '==', _ast.NotEq: '!=', _ast.In: 'in',
                _ast.NotIn: 'not in'}
        _KIND = {_ast.Lt: 'threshold_violated', _ast.LtE: 'threshold_violated',
                 _ast.Gt: 'threshold_violated', _ast.GtE: 'threshold_violated',
                 _ast.Eq: 'equality_mismatch', _ast.NotEq: 'equality_mismatch',
                 _ast.In: 'membership_missing',
                 _ast.NotIn: 'membership_missing'}
        if isinstance(node, _ast.Compare) and len(node.ops) == 1:
            op_type = type(node.ops[0])
            try:
                lv, rv = _val(node.left), _val(node.comparators[0])
                margin = {'op': _OPS.get(op_type, '?'),
                          'actual': lv, 'expected': rv}
                if isinstance(lv, (int, float)) and isinstance(rv, (int, float)):
                    margin['off_by'] = abs(lv - rv)
                info['margin'] = margin
                info['kind'] = _KIND.get(op_type, 'complex_condition')
            except (ValueError, KeyError):
                info['kind'] = _KIND.get(op_type, 'complex_condition')
        elif isinstance(node, _ast.Name):
            info['kind'] = 'falsy_value'
        elif isinstance(node, _ast.BoolOp):
            info['kind'] = 'compound_condition'
        else:
            info['kind'] = 'complex_condition'
    except Exception:
        info['kind'] = 'unanalyzable'
    return info

def _vow_diff_vs_success(quest, strategy, env):
    """Contrast the failing inputs with the most recent SUCCESS of the same
    strategy (same quest preferred, any quest otherwise): which bindings
    changed, from what to what. The counterfactual — 'last time it worked,
    batch_size was 450'."""
    if not isinstance(env, dict):
        return None
    try:
        pool = VowSuccessLog.recall(quest, strategy)  # same-quest preferred
    except Exception:
        pool = []
    if not pool:
        return None
    old = pool[-1]['env']
    diff = []
    for k in sorted(set(old) | set(env)):
        if k.startswith('_') or k == 'attempts':
            continue
        if k not in old:
            diff.append({'key': k, 'was': '<absent>', 'now': env[k]})
        elif k not in env:
            diff.append({'key': k, 'was': old[k], 'now': '<absent>'})
        elif old[k] != env[k]:
            diff.append({'key': k, 'was': old[k], 'now': env[k]})
    return diff or None

def _vow_prove(value, context=None, env=None):
    global _vow_last_reason
    if not value:
        ctx = dict(context) if isinstance(context, dict) else {'detail': context}
        ctx.setdefault('quest', _vow_current_quest)
        ctx.setdefault('seed', _vow_current_seed)
        reason = _vow_autopsy(ctx.get('expr'), env)
        if _vow_shared_refs:
            # failed in the presence of shared mutable state — suspicious
            # by construction. The autopsy kind stays primary; the shared
            # keys ride along as the entanglement marker.
            reason['entangled_refs'] = list(_vow_shared_refs)
        diff = _vow_diff_vs_success(ctx.get('quest'), ctx.get('strategy'), env)
        if diff:
            reason['diff_vs_success'] = diff
        ctx['reason'] = reason
        _vow_last_reason = reason
        # The scar MESSAGE carries the failing expression and failure kind:
        # the log stays human-readable and ScarPatternAnalyzer can cluster
        # recurring failures (bare 'prove failed' collapses every pattern
        # into one — NicheFlow pilot finding via Manus, 2026-07-20, see
        # docs/VOW-Build-Notes-2026-07-20.md fix #2). Avoidance keys on ctx
        # (strategy/quest/seed), never the message, so skips are unaffected.
        _expr_txt = ctx.get('expr') if isinstance(ctx, dict) else None
        _kind = reason.get('kind', 'unknown') if isinstance(reason, dict) \
            else 'unknown'
        _msg = ('prove failed: %s [%s]' % (_expr_txt, _kind)) if _expr_txt \
            else ('prove failed [%s]' % _kind)
        VowScarMemory.record(_msg, ctx)
        raise VowProofFailure(f'prove failed: {ctx}')
    return True

def _vow_fingerprint(d):
    """Situation fingerprint: hash of the visible inputs in scope.
    Two attempts are 'exactly the same thing' iff name + inputs match."""
    import json as _json, hashlib as _hl
    # recalled_scars is MEMORY loaded into scope by `recall scars`, not an
    # input. Counting it would shift the fingerprint on every run as scars
    # accumulate — silently downgrading exact-skip to cautionary retry.
    items = {k: v for k, v in d.items()
             if not k.startswith('_') and k != 'recalled_scars'}
    return _hl.sha256(_json.dumps(items, sort_keys=True,
                                  default=str).encode()).hexdigest()[:16]

def _vow_grant(name):
    _vow_declared_capabilities.add(name)

def _vow_quest_begin(name, learn=False):
    global _vow_beliefs, _vow_constraints, _vow_goal_text, _vow_tournament_results, _vow_learn_enabled, _vow_current_quest, _vow_whispers, _vow_shared_refs, _vow_state_log, _vow_current_intent, _vow_intent_denied, _vow_last_reason
    _vow_current_quest = name
    _vow_last_reason = None  # OWED 8: never adopt a previous quest's
    # autopsy — an explicit scar's reason must be THIS quest's failure
    _vow_beliefs = []
    _vow_constraints = []
    _vow_goal_text = None
    _vow_tournament_results = []
    _vow_learn_enabled = bool(learn)
    _vow_whispers = []
    _vow_shared_refs = []
    _vow_state_log = []
    _vow_current_intent = None
    _vow_intent_denied = set()
    _vow_declared_capabilities.clear()

def _vow_goal(text):
    global _vow_goal_text
    _vow_goal_text = text

def _vow_believe(name, value, confidence=1.0, source=None):
    _vow_beliefs.append({'name': name, 'value': value,
                         'confidence': confidence, 'source': source})
    return value

def _vow_add_constraint(fn):
    _vow_constraints.append(fn)

def _vow_scar(message, context=None):
    if context is None:
        # OWED 8: an explicit scar carries an autopsy too — adopt the
        # triggering failure's reason (a prove autopsy, or the success-
        # clause autopsy _vow_finish stages before on_fail runs). Only
        # 'explicit' and 'reason' keys are added: exact-skip/caution
        # matching reads quest/strategy/seed, and explicit scars keep
        # their long-standing matching semantics — this debt was about a
        # THIN REASON, not about who skips.
        context = {'explicit': True,
                   'reason': (dict(_vow_last_reason) if _vow_last_reason
                              else {'prove': None, 'kind': 'explicit_scar'})}
    VowScarMemory.record(message, context)

def _vow_tournament(env, score, strategies, collapse=False):
    # collapse=False: `score by` — the score sees engine metrics only.
    # collapse=True:  `collapse by` — the score also sees the strategy's
    # OUTPUTS (its computed env), so selection can rank on results
    # (margin, latency, quality), not just engine metrics. Engine metrics
    # win name collisions; a disqualified strategy scores 0.0.
    global _vow_tournament_results
    _vow_tournament_results = []
    best = None
    _live_senvs = {}   # every proof-passer's computed env (durability replay)
    attempts = 0
    # Scar-informed avoidance with situation fingerprints:
    #   EXACT match (strategy + seed)  -> skip: that exact thing hurt before.
    #   SIMILAR only (name match, different seed) -> cautionary retry:
    #   it runs, with a score penalty and a trace marker; the outcome
    #   sharpens the map (success = situations differ; failure = a new,
    #   distinct scar). If EVERY path is an exact scar, run all anyway.
    global _vow_current_seed, _vow_last_reason, _vow_shared_refs, _vow_state_log
    # Quantum Dict: find shared mutable references visible to every
    # strategy (per-strategy env copies are SHALLOW — nested list/dict
    # values are the same object for all). Mutation is inexpressible in
    # VOW today, so this hazard is latent; it is watched, whispered, and
    # marked on failures so it can never become silent.
    _vow_shared_refs = sorted(k for k, v in env.items()
                              if not k.startswith('_')
                              and isinstance(v, (list, dict)))
    _vow_state_log = []
    if _vow_shared_refs:
        _vow_whisper('shared_reference',
                     {'keys': _vow_shared_refs,
                      'note': 'mutable values visible to all strategies; '
                              'mutation in one would be seen by all'})
    scar_exact = set()   # (strategy, seed)
    scar_names = set()   # strategy names with any scar
    scar_reasons = {}    # strategy name -> most recent failure autopsy
    scar_inherited = {}  # strategy name -> True if newest scar is a fleet import
    scar_aged = set()    # (strategy, seed) pairs whose exact scar DECAYED (older than TTL)
    _pending_success = []  # proof-passers, persisted after the winner is known
    try:
        _recall = getattr(VowScarMemory, 'recall_all', None) or VowScarMemory.recall
        for _scar in _recall():
            _ctx = _scar.get('context') if isinstance(_scar, dict) else None
            if isinstance(_ctx, dict) and _ctx.get('strategy'):
                scar_names.add(_ctx['strategy'])
                scar_inherited[_ctx['strategy']] = bool(_ctx.get('inherited'))
                if _ctx.get('reason'):
                    scar_reasons[_ctx['strategy']] = _ctx['reason']
                if _ctx.get('quest') == _vow_current_quest and _ctx.get('seed'):
                    _age = _vow_scar_age(_scar)
                    if (_VOW_SCAR_TTL is not None and _age is not None
                            and _age > _VOW_SCAR_TTL):
                        # decayed: too old to skip blindly — demote to a
                        # cautionary retry; the world may have changed
                        scar_aged.add((_ctx['strategy'], _ctx['seed']))
                    else:
                        scar_exact.add((_ctx['strategy'], _ctx['seed']))
    except Exception:
        pass  # scar memory unavailable — run everything
    seed_now = _vow_fingerprint(env)
    exact = {s['name'] for s in strategies if (s['name'], seed_now) in scar_exact}
    caution = {s['name'] for s in strategies
               if s['name'] in scar_names and s['name'] not in exact}
    aged_now = {s['name'] for s in strategies
                if (s['name'], seed_now) in scar_aged}  # decayed for THIS situation
    eligible = [s for s in strategies if s['name'] not in exact]
    if not eligible:
        eligible = list(strategies)
    # --- Golden Path (SOP domains): success memory steers execution ---
    # exploratory: every eligible strategy runs, best score wins.
    # sop: a strategy with _VOW_GOLDEN_AFTER wins for THIS exact situation
    # runs alone (the field re-opens every _VOW_CHALLENGE_EVERY golden wins,
    # and instantly if the golden path breaks). Scars always outrank golden:
    # an exact-scarred strategy never reaches this code — it was skipped above.
    golden = None           # strategy with a proven streak for THIS situation
    challenger_run = False  # periodic open-field run keeps the map honest
    run_order = list(eligible)
    if _VOW_DOMAIN == 'sop' and eligible:
        _wins = {}   # strategy -> win count for (quest, seed_now)
        _dur = {}    # strategy -> observed durations for (quest, seed_now)
        _faded = {}  # strategy -> wins aged out by _VOW_SUCCESS_TTL (Owed 5)
        for _s in eligible:
            try:
                _pool = VowSuccessLog.recall(_vow_current_quest, _s['name'])
            except Exception:
                _pool = []
            _mine_all = [e for e in _pool
                         if isinstance(e, dict)
                         and e.get('quest') == _vow_current_quest
                         and e.get('seed') == seed_now
                         and e.get('won')]
            # OWED 5: victories age the way wounds do, gently. A win older
            # than the runbook's success_ttl stops counting toward the
            # crown — the streak fades WIN BY WIN as victories age out
            # (a 5-win golden keeps the crown while 3 wins are fresh),
            # never by deletion: the rows are history and stay.
            if _VOW_SUCCESS_TTL is not None:
                _mine = []
                for e in _mine_all:
                    _age = _vow_mem_age(e)
                    if _age is not None and _age > _VOW_SUCCESS_TTL:
                        _faded[_s['name']] = _faded.get(_s['name'], 0) + 1
                    else:
                        _mine.append(e)
            else:
                _mine = _mine_all
            if _mine:
                _wins[_s['name']] = len(_mine)
                _dur[_s['name']] = [e.get('duration') for e in _mine]
        _qual = [n for n in _wins if _wins[n] >= _VOW_GOLDEN_AFTER]
        if _qual:
            golden = max(_qual,
                         key=lambda n: (_wins[n],
                                        -(_vow_mean(_dur.get(n)) or 0.0)))
            if (_VOW_CHALLENGE_EVERY and _wins[golden] >= _VOW_CHALLENGE_EVERY
                    and _wins[golden] % _VOW_CHALLENGE_EVERY == 0):
                challenger_run = True
        # success memory orders the field: proven winners first, then faster
        run_order = sorted(eligible,
                           key=lambda s: (-_wins.get(s['name'], 0),
                                          _vow_mean(_dur.get(s['name'])) or 0.0))
        if golden is not None and not challenger_run:
            # golden runs first and alone unless it breaks
            run_order = ([s for s in run_order if s['name'] == golden]
                         + [s for s in run_order if s['name'] != golden])
            _vow_whisper('golden_path_engaged',
                         {'strategy': golden, 'wins': _wins[golden]})
        elif golden is not None and challenger_run:
            _vow_whisper('golden_path_challenger_run',
                         {'strategy': golden, 'wins': _wins[golden],
                          'every': _VOW_CHALLENGE_EVERY})
        elif golden is None and _faded:
            # the crown faded purely of age: say so — a faded golden is a
            # whisper, never a silence. (Gently: the field simply reopens,
            # exactly as if the victories had never been crowned.)
            _fc = [n for n in _faded
                   if _faded[n] + _wins.get(n, 0) >= _VOW_GOLDEN_AFTER]
            if _fc:
                _bf = max(_fc, key=lambda n: _faded[n] + _wins.get(n, 0))
                _vow_whisper('golden_path_faded',
                             {'strategy': _bf,
                              'stale_wins': _faded[_bf],
                              'fresh_wins': _wins.get(_bf, 0),
                              'ttl': _VOW_SUCCESS_TTL})
    for s in strategies:
        if s not in eligible:
            _vow_tournament_results.append({
                'strategy': s['name'], 'skipped': 'scar_memory',
                'seed': seed_now,
                'proof_success': 0.0, 'speed': 0.0,
                'safety': 1.0 - s['risk'], 'cost': s['cost'],
                'risk': s['risk'], 'score': 0.0})
    for s in run_order:
        ctx = dict(env)
        ctx['attempts'] = attempts + 1  # 1-based: "attempts <= 6" = up to 6 tries
        if any(not c(ctx) for c in _vow_constraints):
            break  # constraint budget exhausted — stop, non-exception
        attempts += 1
        senv = _VowQuantumDict(env, _owner=s['name'])
        _vow_current_seed = seed_now
        is_caution = s['name'] in caution
        start = _vow_time.perf_counter()
        proof_ok = 1.0
        _vow_last_reason = None
        try:
            s['fn'](senv)
        except VowTypeError as _te:
            proof_ok = 0.0
            _vow_last_reason = {'kind': 'type_violation',
                                'detail': str(_te)}
            VowScarMemory.record('type annotation violated', {
                'strategy': s['name'], 'quest': _vow_current_quest,
                'seed': seed_now, 'reason': _vow_last_reason})
        except VowProofFailure:
            proof_ok = 0.0
        except Exception as _e:
            # a strategy's computation blew up (bad method, bad arity,
            # division by zero...) — that is EVIDENCE: fail the strategy,
            # record the scar, let the tournament continue. Only engine-level
            # faults outside s['fn'] may still crash the run.
            proof_ok = 0.0
            _vow_last_reason = {'kind': 'runtime_error',
                                'error': f'{type(_e).__name__}: {_e}'}
            VowScarMemory.record('strategy runtime error', {
                'strategy': s['name'], 'quest': _vow_current_quest,
                'seed': seed_now, 'reason': _vow_last_reason})
        elapsed = _vow_time.perf_counter() - start
        m = {'strategy': s['name'],
             'proof_success': proof_ok,
             'duration': elapsed,
             'speed': 1.0 / (1.0 + elapsed),
             'safety': 1.0 - s['risk'],
             'cost': s['cost'], 'risk': s['risk'],
             'footprint': {
                 'reads': sorted({k for op, o, k in _vow_state_log
                                  if o == s['name'] and op == 'r'}),
                 'writes': sorted({k for op, o, k in _vow_state_log
                                   if o == s['name'] and op == 'w'})}}
        if collapse and not proof_ok:
            m['score'] = 0.0  # disqualified: no selection score
        else:
            _scope = m
            if collapse:
                _scope = {k: v for k, v in senv.items()
                          if not k.startswith('_') and k != 'recalled_scars'}
                _scope.update(m)  # engine metrics win on collision
            try:
                m['score'] = score(_scope)
            except KeyError as _ke:
                raise KeyError(
                    "collapse by: strategy '%s' produced no output named "
                    "%s — successful strategies must compute every name "
                    "the collapse expression references"
                    % (s['name'], _ke))
        if is_caution:
            # similar situation hurt before — or an exact scar decayed —
            # or another deployment's imported lesson matches this path.
            # Retry anyway, slightly penalized.
            m['caution'] = ('aged_scar' if s['name'] in aged_now
                            else 'inherited_scar'
                            if scar_inherited.get(s['name'])
                            else 'similar_scar')
            m['score'] *= 0.9
            if s['name'] in scar_reasons:
                m['prior_reason'] = scar_reasons[s['name']]  # why it hurt last time
        m['seed'] = seed_now
        if proof_ok:
            _pending_success.append((s, senv, elapsed))
        elif _vow_last_reason:
            m['reason'] = _vow_last_reason  # the autopsy: why this run failed
        _vow_tournament_results.append(m)
        # only strategies whose proofs all passed are eligible to win
        if proof_ok:
            _live_senvs[s['name']] = senv
        if proof_ok and (best is None or m['score'] > best['score']):
            best = m
            best['_senv'] = senv
        if golden is not None and not challenger_run and s['name'] == golden:
            if proof_ok:
                # golden held — the rest of the field sits this one out
                for _rest in run_order:
                    if _rest['name'] == golden:
                        continue
                    _vow_tournament_results.append({
                        'strategy': _rest['name'], 'skipped': 'golden_path',
                        'seed': seed_now,
                        'proof_success': 0.0, 'speed': 0.0,
                        'safety': 1.0 - _rest['risk'], 'cost': _rest['cost'],
                        'risk': _rest['risk'], 'score': 0.0})
                break
            # golden broke: the failure above already recorded the scar
            # (demotion flows through the scar economy) — open the field NOW
            _vow_whisper('golden_path_broken',
                         {'strategy': golden, 'reason': _vow_last_reason})
            golden = None
    # durability (Arc 3A): journal the tournament outcome (metrics are
    # wall-clock — the one true nondeterminism inside the engine). Replay
    # replaces the computed metrics wholesale and restores the journaled
    # winner's live-computed env; Journaled BEFORE success persistence so
    # the event order matches replay's consumption order.
    _j = globals().get('_vow_journal')
    if _j is not None:
        _jr = _j.tournament_event(seed_now, _vow_tournament_results,
                                  best.get('strategy') if best else None,
                                  list(_live_senvs))
        if _jr is not None:  # replayed: take the recorded outcome
            _vow_tournament_results = _jr['results']
            _w = _jr.get('winner')
            best = None
            if _w is not None:
                best = dict(next(r for r in _jr['results']
                                 if r.get('strategy') == _w))
                best['_senv'] = _live_senvs[_w]
    # persist success snapshots now that the winner is known: exactly one
    # row per proof-passer, the winner flagged 'won' — golden-path streaks
    # count WINS, not mere passes; counterfactuals (diff_vs_success) keep
    # their env snapshots either way.
    for _ps, _psenv, _pel in _pending_success:
        try:
            VowSuccessLog.record({
                'quest': _vow_current_quest, 'strategy': _ps['name'],
                'seed': seed_now, 'env': dict(_psenv), 'duration': _pel,
                'won': bool(best is not None
                            and _ps['name'] == best.get('strategy'))})
        except Exception:
            pass  # memory unavailable — the run's result still stands
    if best is not None:
        env.update(best['_senv'])
    return best

def _vow_gated(capability, action, *args, key=None):
    """Deontic gate: permission was checked at transpile time; this dispatches
    the action through the modal layer — dry-run records a shadow, live
    executes the real implementation. When the engine injects a
    _VOW_RATE_LIMITER, dry-run PROBES it (recording would-be throttling in
    the shadow) and live mode ACQUIRES tokens (raising VowRateLimitExceeded
    when the bucket is empty)."""
    # durability (Arc 3A): replay returns the journaled outcome — the effect
    # is never re-executed. Mechanism in JournalRuntime; policy here.
    _j = globals().get('_vow_journal')
    if _j is not None:
        _ins = _j.effect_replay(capability, action, [str(a) for a in args],
                                key=key)
        if _ins is not None:
            _w = _ins.get('whisper')
            if _w:
                _vw = globals().get('_vow_whisper')
                if _vw is not None:
                    _vw(_w.get('kind'), _w.get('detail'))
            _oc = _ins.get('outcome')
            if _oc == 'blocked':
                return VowCapability(f'{capability}:{action}',
                                     lambda: None, _ins.get('shadow'))
            if _oc == 'error':
                raise RuntimeError(_ins.get('error',
                                            'replayed effect failure'))
            if _oc == 'shadow':
                return _ins.get('shadow')
            return _ins.get('result')
    # intent/action policy: the quest declared what it IS; an effect its
    # intent denies never executes — blocked at the gate, with a whisper.
    # Warn, don't crash; but never let it through either. (Shares the
    # generated code's namespace: exec_globals is this module's dict.)
    _denied = globals().get('_vow_intent_denied') or set()
    if action in _denied:
        _detail = {'action': action, 'capability': capability,
                   'intent': globals().get('_vow_current_intent'),
                   'note': 'effect denied by the declared intent policy; '
                           'it was not executed'}
        _vw = globals().get('_vow_whisper')
        if _vw is not None:
            _vw('intent_violation', _detail)
        _shadow = {'shadow': True, 'action': action,
                   'args': [str(a) for a in args], 'blocked': True}
        if _j is not None:
            _j.effect_record_blocked(capability, action,
                                     [str(a) for a in args], _shadow,
                                     {'kind': 'intent_violation',
                                      'detail': _detail}, key=key)
        return VowCapability(f'{capability}:{action}',
                             lambda: None, _shadow)
    _limiter = globals().get('_VOW_RATE_LIMITER')
    _lkey = f'{capability}:{action}'
    _would_throttle = (_limiter is not None and VOW_DRY_RUN
                       and not _limiter.rehearse(_lkey))
    def _real():
        if _limiter is not None:
            _limiter.acquire(_lkey)  # policy denial raises honestly
        if action == 'http_get':
            import urllib.request
            with urllib.request.urlopen(args[0], timeout=30) as r:
                return r.read().decode('utf-8', 'replace')
        if action == 'http_post':
            import urllib.request
            req = urllib.request.Request(args[0], data=str(args[1]).encode())
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read().decode('utf-8', 'replace')
        if action == 'file_read':
            return open(args[0]).read()
        if action == 'file_write':
            open(args[0], 'w').write(str(args[1]))
            return True
        if action == 'shell_exec':
            import subprocess as _sp
            _done = _sp.run(args[0], shell=True, capture_output=True,
                            text=True, timeout=60)
            if _done.returncode != 0:
                raise RuntimeError(
                    'shell_exec failed (exit %d): %s'
                    % (_done.returncode,
                       (_done.stderr or _done.stdout or '')[-500:]))
            return _done.stdout
        if action == 'model_ask':
            handler = globals().get('_vow_model_handler')
            if handler is None:
                raise RuntimeError('model_ask requires a configured '
                                   '_vow_model_handler in live mode')
            return handler(args[0])
        raise RuntimeError(f'unknown gated action: {action}')
    shadow = {'shadow': True, 'action': action,
              'args': [str(a) for a in args]}
    if _would_throttle:
        shadow['rate_limited'] = True   # rehearsal says: this WOULD be denied
        shadow['retry_after'] = _limiter.rehearsal_retry_after(_lkey)
    if _j is not None:
        # Owed 1: a keyed LIVE effect consults the durable record before
        # firing — effectively-once. Dry-run stays shadow (no consult).
        return _j.effect_record(
            capability, action, [str(a) for a in args],
            lambda: VowCapability(f'{capability}:{action}', _real,
                                  shadow_result=shadow)(*[]),
            shadow, key=key, consult=(key is not None and not VOW_DRY_RUN))
    return VowCapability(f'{capability}:{action}', _real,
                         shadow_result=shadow)(*[])


def _vow_wait_until(wake):
    """`wait until <expr>` (Arc 3B): park the run until a wall-clock time
    (ISO-8601 UTC string or epoch seconds). Live + journaled: journal and
    suspend. Dry-run: shadow — record where the run WOULD pause, never
    pause. Live WITHOUT a journal: honest error — a wait that cannot be
    honored is never silently dropped."""
    import datetime as _dt

    def _iso(v):
        if isinstance(v, bool):
            raise RuntimeError(f'wait until: bad timestamp {v!r}')
        if isinstance(v, (int, float)):
            return _dt.datetime.utcfromtimestamp(v).strftime(
                '%Y-%m-%dT%H:%M:%S')
        s = str(v).strip()
        if s.endswith('Z'):
            s = s[:-1]
        try:
            _dt.datetime.fromisoformat(s)
        except ValueError:
            raise RuntimeError(f'wait until: bad timestamp {v!r} '
                               f'(want ISO-8601 UTC or epoch seconds)')
        return s

    wake_at = _iso(wake)
    _j = globals().get('_vow_journal')
    if globals().get('VOW_DRY_RUN'):
        if _j is not None:
            _j.wait_enter(wake_at, shadow=True)
        _vw = globals().get('_vow_whisper')
        if _vw is not None:
            _vw('wait_shadow', {'wake_at': wake_at,
                                'note': 'dry-run: would suspend here'})
        return
    if _j is None:
        raise RuntimeError(
            'wait requires a journaled run (use --db — journaling is on by '
            'default); a wait that cannot be honored is never silently '
            'dropped')
    if _j.wait_enter(wake_at) == 'suspend':
        raise VowSuspend('wait', wake_at=wake_at)
    # 'done': replayed at/after the wake time — continue live


def _vow_await_approval(reason):
    """`await approval "reason"` (Arc 3B): park the run for a human
    decision. The grant (or denial) is journaled inside the run's own hash
    chain — tamper-evident human oversight. Dry-run shadows; live without
    a journal is an honest error."""
    _j = globals().get('_vow_journal')
    if globals().get('VOW_DRY_RUN'):
        if _j is not None:
            _j.approval_request(reason, shadow=True)
        _vw = globals().get('_vow_whisper')
        if _vw is not None:
            _vw('approval_shadow',
                {'reason': reason,
                 'note': 'dry-run: would await human approval here'})
        return
    if _j is None:
        raise RuntimeError(
            'await approval requires a journaled run (use --db — '
            'journaling is on by default); a suspended decision that '
            'cannot be recorded is never silently skipped')
    _r = _j.approval_request(reason)
    if _r.get('suspend') or _r.get('suspend_again'):
        raise VowSuspend('approval', reason=reason)
    if _r.get('shadow'):
        return
    # granted: the human decision becomes part of the run's trace
    _vw = globals().get('_vow_whisper')
    if _vw is not None:
        _vw('approval_granted', {'reason': reason,
                                 'approver': _r.get('approver'),
                                 'note': _r.get('note'),
                                 'at': _r.get('at')})

def _vow_finish(env, success_fn, on_fail=None, success_expr=None):
    global _vow_last_reason
    try:
        ok = bool(success_fn())
    except VowProofFailure:
        # quest-level proof failure: run the on-fail block, then re-raise
        if on_fail is not None:
            on_fail(env)
        raise
    except Exception:
        ok = False
    if not ok:
        # OWED 8: the success clause itself failed — stage an autopsy of
        # IT, so the on-fail block's explicit scars carry the real
        # reason instead of a stale prove autopsy or none at all.
        if success_expr is not None:
            _vow_last_reason = _vow_autopsy(success_expr, env)
        else:
            _vow_last_reason = {'prove': None,
                                'kind': 'success_clause_failed'}
        if on_fail is not None:
            on_fail(env)
    return {'success': ok, 'goal': _vow_goal_text,
            'learn': _vow_learn_enabled,
            'beliefs': list(_vow_beliefs),
            'whispers': [dict(w_) for w_ in _vow_whispers],
            'axioms': dict(_VOW_AXIOMS),
            'tournament': [dict(m, _senv=None) for m in _vow_tournament_results],
            'result': {k: v for k, v in env.items() if not k.startswith('_')}}
'''


# ------------------------------------------------------------ transpiler ---
class VowTranspileError(Exception):
    pass


class VowSecurityError(Exception):
    """Raised when Shadow Python fails signature verification — the engine
    only executes code the transpiler itself produced and signed."""


def verify_shadow_signature(code: str, signing_key: bytes) -> None:
    """Enforce the exec trust boundary: `code` must carry a valid HMAC
    signature over everything after the signature line."""
    first, _, body = code.partition('\n')
    if not first.startswith(VowTranspiler.SIGNATURE_PREFIX):
        raise VowSecurityError(
            'unsigned Shadow Python refused: engine only executes '
            'transpiler-signed code')
    sig = first[len(VowTranspiler.SIGNATURE_PREFIX):].strip()
    expected = hmac.new(signing_key, body.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(sig, expected):
        raise VowSecurityError('Shadow Python signature mismatch (tampered?)')


class VowTranspiler:
    """Transpiles a VOW AST into Shadow Python source."""

    ALLOWED_CALLS = {'abs', 'min', 'max', 'round', 'len'}

    # Pure collection methods, chainable on VowList/VowDict values.
    ALLOWED_METHODS = {'filter', 'map', 'sort_by', 'group_by'}

    # Deontic layer: effectful builtins -> required capability name.
    # Pure-computation calls stay free; these require a `capability` grant.
    GATED_CALLS = {
        'http_get': 'network',
        'http_post': 'network',
        'file_read': 'file_read',
        'file_write': 'file_write',
        'shell_exec': 'shell',
        'model_ask': 'model',
    }

    SIGNATURE_PREFIX = '# VOW-SIGNATURE: '

    def __init__(self, include_preamble: bool = True,
                 signing_key: Optional[bytes] = None):
        self.include_preamble = include_preamble
        self.signing_key = signing_key
        self._lines: List[str] = []
        self._quest_has_on_fail: bool = False
        self._capabilities: set = set()
        self._in_strategy: bool = False
        self._bound_stack: list = []  # bound-name scopes for set/let checking
        self._current_strategy: Optional[str] = None

    # --- public ---
    def transpile(self, program: Program) -> str:
        if not isinstance(program, Program):
            raise VowTranspileError('transpile() expects a Program AST')
        self._lines = []
        if self.include_preamble:
            self._lines.append(SHADOW_RUNTIME_PREAMBLE)
        self._lines.append(f'\n_VOW_DOMAIN = {program.domain!r}  # domain directive')
        # axioms + deduce: resolved NOW, at transpile time. They become
        # immutable constants in every quest env (and thereby in every
        # situation fingerprint — compile-time truths join the proof economy).
        axmap = {}
        for ax in program.axioms:
            if isinstance(ax, Axiom):
                if ax.name in axmap:
                    raise VowTranspileError(f"duplicate axiom '{ax.name}'")
                axmap[ax.name] = self._const_eval(
                    ax.expr, axmap, f"axiom '{ax.name}'")
            else:  # Deduce
                if ax.name in axmap:
                    raise VowTranspileError(f"duplicate axiom '{ax.name}'")
                _unset = object()
                resolved = _unset
                for given, result in ax.clauses:
                    if self._const_eval(given, axmap,
                                        f"deduce '{ax.name}' given"):
                        resolved = self._const_eval(
                            result, axmap, f"deduce '{ax.name}' result")
                        break
                if resolved is _unset:
                    raise VowTranspileError(
                        f"deduce '{ax.name}': no given matched — the "
                        f"decision table is incomplete at compile time")
                axmap[ax.name] = resolved
        self._axiom_names = set(axmap)
        self._lines.append(f'_VOW_AXIOMS = {axmap!r}  # compile-time truths')
        # runbook (Owed 3): the deployment's standing law, versioned with
        # the code it governs. Rows are compile-time constants — axiom
        # names in scope — and unknown rows are a LOUD error: a misspelled
        # row must never silently do nothing.
        runbook = {}
        for rname, rexpr in (program.runbook or {}).items():
            if rname not in self._RUNBOOK_ROWS:
                raise VowTranspileError(
                    f"unknown runbook row '{rname}' — allowed: "
                    + ', '.join(sorted(self._RUNBOOK_ROWS)))
            runbook[rname] = self._const_eval(
                rexpr, axmap, f"runbook '{rname}'")
        for _row in ('scar_ttl', 'success_ttl'):
            if _row in runbook:
                ttl = runbook[_row]
                if not isinstance(ttl, (int, float)) or isinstance(ttl, bool) \
                        or ttl < 0:
                    raise VowTranspileError(
                        f"runbook {_row} must be a non-negative number of "
                        f"seconds, got {ttl!r}")
        self._lines.append(f'_VOW_RUNBOOK = {runbook!r}  # runbook directive')
        if 'scar_ttl' in runbook:
            # GUARDED: a --scar-ttl flag (deliberate operator override) is
            # pre-injected by the engine and wins; the runbook is the
            # default every operator shares — same runbook, same database,
            # same behavior. (The flag is only ever injected when it is
            # not None, so `is None` here means exactly "no override" —
            # and this must test the VALUE, not the name: the preamble's
            # default has already bound the name to None by the time this
            # directive runs. A NameError guard would never fire — caught
            # by the smoke test, 2026-07-24.)
            self._lines.append(
                'if _VOW_SCAR_TTL is None:\n'
                f'    _VOW_SCAR_TTL = {runbook["scar_ttl"]!r}  # runbook law')
        if 'success_ttl' in runbook:
            # OWED 5: victory aging — runbook-only, no flag (the standing
            # law is the point; drills stage a runbook variant). Same
            # value-guard doctrine as scar_ttl.
            self._lines.append(
                'if _VOW_SUCCESS_TTL is None:\n'
                f'    _VOW_SUCCESS_TTL = {runbook["success_ttl"]!r}'
                '  # runbook law')
        routes = [{'source': r.source,
                   'rows': [(list(p), l) for p, l in r.rows],
                   'fallback': r.fallback} for r in program.routes]
        self._lines.append(f'_VOW_ROUTES = {routes!r}  # intent routers')
        self._lines.append(
            f'_VOW_ONTOLOGY_MAP = {dict(program.ontology)!r}  # keyword -> host fn')
        self._lines.append('\n# === transpiled quests ===')
        for quest in program.quests:
            self._emit_quest(quest)
        names = ', '.join(repr(q.name) for q in program.quests)
        self._lines.append(f'\nQUESTS = [{names}]')
        code = '\n'.join(self._lines) + '\n'
        if self.signing_key is not None:
            sig = hmac.new(self.signing_key, code.encode(),
                           hashlib.sha256).hexdigest()
            code = f'{self.SIGNATURE_PREFIX}{sig}\n' + code
        return code

    # --- compile-time evaluation (axiom / deduce) ---
    # Owed 3: runbook rows known to this engine version. Grow this set as
    # new standing laws land. scar_ttl = wound decay (Owed 3);
    # success_ttl = victory aging (Owed 5).
    _RUNBOOK_ROWS = frozenset({'scar_ttl', 'success_ttl'})
    _CONST_BINOPS = {
        '+': lambda a, b: a + b, '-': lambda a, b: a - b,
        '*': lambda a, b: a * b, '/': lambda a, b: a / b,
        '%': lambda a, b: a % b,
        '==': lambda a, b: a == b, '!=': lambda a, b: a != b,
        '<': lambda a, b: a < b, '<=': lambda a, b: a <= b,
        '>': lambda a, b: a > b, '>=': lambda a, b: a >= b,
        '&&': lambda a, b: bool(a) and bool(b),
        '||': lambda a, b: bool(a) or bool(b),
    }

    def _const_eval(self, node, axmap, what):
        """Evaluate a compile-time constant expression (literals, other
        axioms, arithmetic/comparison over them). Anything else is a
        compile error — deduce is not a runtime mechanism in v1."""
        if isinstance(node, (Num, Str, Bool)):
            return node.value
        if isinstance(node, Name):
            if node.id in axmap:
                return axmap[node.id]
            raise VowTranspileError(
                f"{what} must resolve at compile time — '{node.id}' is "
                f"not an axiom (use strategy proves for runtime conditions)")
        if isinstance(node, ListLit):
            return [self._const_eval(i, axmap, what) for i in node.items]
        if isinstance(node, DictLit):
            return {self._const_eval(k, axmap, what):
                    self._const_eval(v, axmap, what) for k, v in node.pairs}
        if isinstance(node, BinOp) and node.op in self._CONST_BINOPS:
            left = self._const_eval(node.left, axmap, what)
            right = self._const_eval(node.right, axmap, what)
            try:
                return self._CONST_BINOPS[node.op](left, right)
            except Exception as exc:
                raise VowTranspileError(
                    f"{what}: constant expression failed ({exc})")
        if isinstance(node, UnaryOp) and node.op in ('-', 'not'):
            val = self._const_eval(node.operand, axmap, what)
            return -val if node.op == '-' else (not val)
        raise VowTranspileError(f"{what} must be a compile-time constant")

    # --- quest emission ---
    def _emit_quest(self, quest: Quest) -> None:
        w = self._lines.append
        w(f'\ndef quest_{quest.name}():')
        w(f'    _vow_quest_begin({quest.name!r}, learn={quest.learn!r})')
        w('    _env = {}')
        w('    _env.update(_VOW_AXIOMS)  # compile-time truths, immutable')
        on_fail = next((i for i in quest.items if isinstance(i, OnFail)), None)
        self._quest_has_on_fail = on_fail is not None
        self._capabilities = {i.name for i in quest.items if isinstance(i, Capability)}
        self._bound_stack = [set()]  # quest scope
        for cap in sorted(self._capabilities):
            w(f'    _vow_grant({cap!r})')
        if on_fail is not None:
            w('    def _on_fail(_env):')
            if not on_fail.body:
                w('        pass')
            for item in on_fail.body:
                self._emit_item(item, scope='_env', indent='        ')
        handler = '_on_fail' if on_fail is not None else 'None'
        body_items = [i for i in quest.items if not isinstance(i, OnFail)]
        if not body_items:
            w(f'    return _vow_finish(_env, lambda: True, on_fail={handler})')
        if on_fail is not None:
            # quest-level proof failure -> run on-fail block, then re-raise
            w('    try:')
            for item in body_items:
                self._emit_item(item, scope='_env', indent='        ')
            w('    except VowProofFailure:')
            w('        _on_fail(_env)')
            w('        raise')
        else:
            for item in body_items:
                self._emit_item(item, scope='_env', indent='    ')
        w(f'    return _vow_finish(_env, lambda: True, on_fail={handler})  # default: no success clause')

    def _emit_item(self, item, scope: str, indent: str) -> None:
        w = self._lines.append
        if isinstance(item, Goal):
            w(f'{indent}_vow_goal({item.text!r})')
        elif isinstance(item, ScarStmt):
            w(f'{indent}_vow_scar({item.message!r})')
        elif isinstance(item, IntentDecl):
            w(f"{indent}_vow_intent_declare({item.name!r}, {item.denied!r})")
        elif isinstance(item, OntologyCall):
            arg = self._expr(item.arg, scope)
            w(f"{indent}_vow_ontology_call({item.keyword!r}, {arg})")
        elif isinstance(item, WaitStmt):
            wake = self._expr(item.wake, scope)
            w(f"{indent}_vow_wait_until({wake})")
        elif isinstance(item, AwaitStmt):
            w(f"{indent}_vow_await_approval({item.reason!r})")
        elif isinstance(item, Believe):
            if item.name in getattr(self, '_axiom_names', ()):
                raise VowTranspileError(
                    f"'{item.name}' is an axiom — an immutable compile-time "
                    f"truth; it cannot be re-bound by believe")
            expr = self._expr(item.value, scope)
            w(f"{indent}{scope}[{item.name!r}] = _vow_believe({item.name!r}, "
              f"{expr}, {item.confidence!r}, {item.source!r})")
        elif isinstance(item, Let):
            if item.name in getattr(self, '_axiom_names', ()):
                raise VowTranspileError(
                    f"'{item.name}' is an axiom — an immutable compile-time "
                    f"truth; it cannot be re-bound by let")
            self._bound_stack[-1].add(item.name)
            value = self._expr(item.value, scope)
            if item.annotation is not None:
                if item.annotation not in _VOW_TYPE_NAMES:
                    raise VowTranspileError(
                        f"unknown type annotation '{item.annotation}' on "
                        f"'{item.name}' — allowed: {', '.join(_VOW_TYPE_NAMES)}")
                value = (f"_vow_annotate({item.name!r}, {value}, "
                         f"{item.annotation!r})")
            w(f"{indent}{scope}[{item.name!r}] = {value}")
        elif isinstance(item, Set):
            if item.name in getattr(self, '_axiom_names', ()):
                raise VowTranspileError(
                    f"'{item.name}' is an axiom — an immutable compile-time "
                    f"truth; it cannot be mutated by set")
            if item.name not in self._bound_stack[-1]:
                raise VowTranspileError(
                    f"set on unbound name '{item.name}' — use `let` to bind it first")
            w(f"{indent}{scope}[{item.name!r}] = {self._expr(item.value, scope)}")
        elif isinstance(item, If):
            w(f"{indent}if {self._expr(item.cond, scope)}:")
            if not item.body:
                w(f"{indent}    pass")
            for sub in item.body:
                self._emit_item(sub, scope, indent + '    ')
            if item.orelse:
                w(f"{indent}else:")
                for sub in item.orelse:
                    self._emit_item(sub, scope, indent + '    ')
        elif isinstance(item, Repeat):
            w(f"{indent}for _vow_i in range(int({self._expr(item.count, scope)})):")
            if not item.body:
                w(f"{indent}    pass")
            for sub in item.body:
                self._emit_item(sub, scope, indent + '    ')
        elif isinstance(item, Prove):
            ctx = f'{{"expr": {self._expr_source(item.expr)!r}'
            if self._current_strategy:
                ctx += f', "strategy": {self._current_strategy!r}'
            ctx += '}'
            w(f'{indent}_vow_prove({self._expr(item.expr, scope)}, context={ctx}, '
              f'env={scope})')
        elif isinstance(item, Constraint):
            ctx = self._expr(item.expr, '_c')
            w(f'{indent}_vow_add_constraint(lambda _c: {ctx})')
        elif isinstance(item, Success):
            expr = self._expr(item.expr, scope)
            handler = '_on_fail' if self._quest_has_on_fail else 'None'
            # success_expr: the SOURCE expression, for the Owed 8
            # autopsy _vow_finish stages when the clause fails
            w(f'{indent}return _vow_finish({scope}, lambda: {expr}, '
              f'on_fail={handler}, '
              f'success_expr={self._expr_source(item.expr)!r})')
            w(f'{indent}# -- statements after success are unreachable --')
        elif isinstance(item, Capability):
            pass  # deontic grant — enforced at transpile time, no runtime code
        elif isinstance(item, RecallScars):
            w(f"{indent}{scope}['recalled_scars'] = _vow_list(VowScarMemory.recall())")
        elif isinstance(item, Strategy):
            # quest-level strategy: the atomic fallible action — executed
            # through the tournament pipeline (timed, proof-enforced,
            # learning-fed) with no competition (Reconciled §4).
            self._emit_tournament(
                Tournament(score_expr=Name('proof_success'), strategies=[item]),
                scope, indent)
        elif isinstance(item, Tournament):
            self._emit_tournament(item, scope, indent)
        else:
            raise VowTranspileError(f'unsupported AST node: {item!r}')

    def _emit_tournament(self, t: Tournament, scope: str, indent: str) -> None:
        w = self._lines.append
        w(f'{indent}# --- tournament: {len(t.strategies)} strategies ---')
        entries = []
        for s in t.strategies:
            fname = f'_strategy_{s.name}'
            w(f'{indent}def {fname}(_senv):')
            if not s.body:
                w(f'{indent}    pass')
            self._in_strategy = True
            self._current_strategy = s.name
            self._bound_stack.append(set(self._bound_stack[-1]))
            for item in s.body:
                self._emit_item(item, scope='_senv', indent=indent + '    ')
            self._bound_stack.pop()
            self._current_strategy = None
            self._in_strategy = False
            entries.append(
                f"{{'name': {s.name!r}, 'cost': {s.cost!r}, "
                f"'risk': {s.risk!r}, 'fn': {fname}}}")
        score = self._expr(t.score_expr, '_m')
        w(f'{indent}_vow_tournament({scope}, lambda _m: {score},')
        w(f'{indent}    [{", ".join(entries)}], collapse={t.collapse!r})')

    # --- expression emission ---
    def _expr(self, node, scope: str, local_names=frozenset()) -> str:
        """local_names: lambda parameters in scope — emitted as plain Python
        locals; every other name resolves through the VOW env dict."""
        if isinstance(node, Num):
            return repr(node.value)
        if isinstance(node, Str):
            return repr(node.value)
        if isinstance(node, Bool):
            return repr(node.value)
        if isinstance(node, Name):
            if node.id in local_names:
                return node.id
            return f'{scope}[{node.id!r}]'
        if isinstance(node, ListLit):
            return '_vow_list([{}])'.format(
                ', '.join(self._expr(i, scope, local_names) for i in node.items))
        if isinstance(node, DictLit):
            return '_vow_dict({{{}}})'.format(', '.join(
                '{}: {}'.format(self._expr(k, scope, local_names),
                                self._expr(v, scope, local_names))
                for k, v in node.pairs))
        if isinstance(node, Lambda):
            inner = local_names | set(node.params)
            return '(lambda {}: {})'.format(
                ', '.join(node.params),
                self._expr(node.body, scope, inner))
        if isinstance(node, Attr):
            return "_vow_attr({}, {!r})".format(
                self._expr(node.obj, scope, local_names), node.name)
        if isinstance(node, UnaryOp):
            op = 'not ' if node.op == '!' else node.op
            return f'({op}{self._expr(node.operand, scope, local_names)})'
        if isinstance(node, BinOp):
            op = {'&&': 'and', '||': 'or'}.get(node.op, node.op)
            return (f'({self._expr(node.left, scope, local_names)} {op} '
                    f'{self._expr(node.right, scope, local_names)})')
        if isinstance(node, Call):
            if node.kwargs and not (
                    isinstance(node.func, Name)
                    and node.func.id in self.GATED_CALLS):
                raise VowTranspileError(
                    f'keyword arguments are only legal on gated effect '
                    f'calls (got {sorted(node.kwargs)} on {node.func!r}); '
                    f'the only supported keyword is key= (Owed 1)')
            if isinstance(node.func, Attr):
                method = node.func.name
                if method not in self.ALLOWED_METHODS:
                    raise VowTranspileError(
                        f'method .{method}() not allowed; whitelist: '
                        f'{sorted(self.ALLOWED_METHODS)} '
                        f'(pure collection operations only)')
                obj = self._expr(node.func.obj, scope, local_names)
                args = ', '.join(self._expr(a, scope, local_names)
                                 for a in node.args)
                return f'({obj}).{method}({args})'
            if isinstance(node.func, Name) and node.func.id in self.GATED_CALLS:
                action = node.func.id
                cap = self.GATED_CALLS[action]
                if self._in_strategy:
                    raise VowTranspileError(
                        f'{action}() inside a strategy body is a compile-time '
                        f'error: strategies are pure computation '
                        f'(Reconciled Path A)')
                if cap not in self._capabilities:
                    raise VowTranspileError(
                        f'{action}() requires `capability {cap}` — undeclared '
                        f'effectful actions are forbidden even in dry-run')
                unknown = set(node.kwargs) - {'key'}
                if unknown:
                    raise VowTranspileError(
                        f'{action}() got unknown keyword(s) {sorted(unknown)}'
                        f' — gated calls accept only key= (Owed 1 '
                        f'idempotency keys)')
                args = ', '.join(self._expr(a, scope, local_names)
                                 for a in node.args)
                key_expr = ''
                if 'key' in node.kwargs:
                    key_expr = (", key="
                                + self._expr(node.kwargs['key'], scope,
                                             local_names))
                return (f"_vow_gated({cap!r}, {action!r}"
                        f"{', ' if args else ''}{args}{key_expr})")
            if not (isinstance(node.func, Name)
                    and node.func.id in self.ALLOWED_CALLS):
                raise VowTranspileError(
                    f'call to {node.func!r} not allowed; '
                    f'whitelist: {sorted(self.ALLOWED_CALLS)}')
            args = ', '.join(self._expr(a, scope, local_names)
                             for a in node.args)
            return f'{node.func.id}({args})'
        raise VowTranspileError(f'unsupported expression: {node!r}')

    def _expr_source(self, node) -> str:
        """Best-effort human-readable rendering for scar contexts."""
        if isinstance(node, Num):
            return str(node.value)
        if isinstance(node, Str):
            return f'"{node.value}"'
        if isinstance(node, Bool):
            return str(node.value).lower()
        if isinstance(node, Name):
            return node.id
        if isinstance(node, UnaryOp):
            return f'{node.op}{self._expr_source(node.operand)}'
        if isinstance(node, BinOp):
            return (f'{self._expr_source(node.left)} {node.op} '
                    f'{self._expr_source(node.right)}')
        if isinstance(node, ListLit):
            return '[{}]'.format(
                ', '.join(self._expr_source(i) for i in node.items))
        if isinstance(node, DictLit):
            return '{{{}}}'.format(', '.join(
                '{}: {}'.format(self._expr_source(k), self._expr_source(v))
                for k, v in node.pairs))
        if isinstance(node, Lambda):
            return 'lambda {}: {}'.format(
                ', '.join(node.params), self._expr_source(node.body))
        if isinstance(node, Attr):
            return f'{self._expr_source(node.obj)}.{node.name}'
        if isinstance(node, Call):
            if isinstance(node.func, Attr):
                return '{}.{}({})'.format(
                    self._expr_source(node.func.obj), node.func.name,
                    ', '.join(self._expr_source(a) for a in node.args))
            return f"{self._expr_source(node.func)}(...)"
        return repr(node)
