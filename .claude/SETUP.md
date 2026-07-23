# Giving Vaea the same Claude Code setup as the AI Dev Vault

This is a guide to what was actually done, and why, to make working on this
repo with Claude Code behave the same way working in the personal vault
does — identity that survives everywhere, forced context at session start,
on-demand + self-triggering retrieval, and a self-maintaining nightly pass.
Every snippet below is the real, current config — not a hypothetical
example. Where a piece touches your live GitHub account directly, it's
marked as such and was deliberately **not** auto-run without you saying go.

## 1. Identity — already solved, no new work needed

The vault's identity layer (`user.md`/`soul.md`/`identity.md`) is loaded via
`~/.claude/CLAUDE.md`, which is global — it applies in every Claude Code
session on this machine, in every project folder, including this one. There
is nothing Vaea-specific to add here: opening Claude Code anywhere already
carries Anvil/soul.md/The Crucible with it.

This repo's own `AGENTS.md` (already existed before this setup) plays the
role your vault's `/Projects`, `/Decisions` etc. play for *this specific
codebase* — architecture, key files, working conventions. It's not
duplicated identity; it's project-specific working notes, same distinction
your vault draws between the identity layer and the folder structure.

## 2. Forced context at session start

**Status: done, tested.**

The vault's `SessionStart` hook (`~/.claude/settings.json`, global) injects
`vault.md`, priority files, and the 9 most recent vault files — and that
already fires in every session, including ones opened directly in this repo,
since it's global and hardcoded to the vault's path. So vault knowledge was
never actually missing here.

What *was* missing: anything about the current state of *this repo*
specifically — git status, recent commits, the latest Vaea-specific
decisions from the vault. Added a project-scoped hook for that, in
`.claude/settings.json` (this repo, not global):

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "powershell -File \"C:\\Users\\mwall\\vaea\\.claude\\hooks\\load-vaea-context.ps1\""
          }
        ]
      }
    ]
  }
}
```

`.claude/hooks/load-vaea-context.ps1` prints `git status --short`, the last
10 commits, and the 5 most recently updated Vaea-related vault notes in
full. Ran it directly before trusting the config — confirmed real output,
not just a config that looks right on paper.

The vault's `UserPromptSubmit` hook (Crucible reminder) needed **no**
Vaea-specific copy — same reasoning: it's global, hardcoded to fire on
trigger words regardless of project, and it's been firing all session in
this exact repo as proof.

## 3. Retrieval — on-demand and self-triggering

**Status: done, not yet live-tested end-to-end.**

Your `vault-crawler` subagent turned out to be scoped to the vault repo's
own `.claude/agents/`, not global — confirmed by reading its actual
definition file. So a session opened directly in this repo (even with the
vault attached via `--add-dir`) would not have picked it up. Built the
Vaea-specific equivalent instead of assuming it'd just work:

`.claude/agents/vaea-crawler.md` — same 5-hop, "start from one canonical
place first" discipline as `vault-crawler`, but starting from this repo's
own `AGENTS.md`/`README.md` first, falling back to the vault's
`Projects\Vaea.md` (not the vault's own `vault.md` — already known to be
Vaea-specific) for historical/decision questions.

`.claude/commands/vaeacrawl.md` — the manual-trigger equivalent of
`/vaultcrawl`:

```
Use the vaea-crawler agent to search for: $ARGUMENTS
```

**Not yet tested** the way you tested `vault-crawler` — by asking a plain
question in normal conversation with no mention of search, and watching
whether it self-triggers. Worth doing before trusting this the way you
trust the original.

## 4. Self-maintenance — the nightly Routine

**Status: drafted, NOT created. This is the one piece that auto-implements
only if you say go — it pushes branches and merges PRs on your real,
public `SheppCrafd/vaea` GitHub repo, unattended, every night.**

Pulled your actual live "Nightly Vault Maintenance" routine config via the
API to mirror its structure exactly (same branch-backup-first, work-on-a-
branch, PR-and-merge-immediately pattern, same tools/model/notification
settings) — the vault's 9 steps are about wikilinks/MOC/stub files, which
don't mean anything for a codebase, so each step below is re-derived for
what a codebase actually needs, not a copy-paste of the original:

0. Backup branch (`backup-YYYY-MM-DD`) before touching anything — same
   reason as the vault's: your GitHub token is scoped for branch pushes,
   not tag pushes, so branch is the working mechanism, not tag.
1. Run lint/test/build/typecheck, record baseline. `typecheck` has a known,
   pre-existing error count — only flag a *new* regression, never the
   baseline.
2. Check `AGENTS.md`'s "Key Files" list against the real file tree and
   recent commits — fix stale descriptions, add entries for newly
   load-bearing files, always with real reasoning (the vault's "why this
   connection matters" bar, applied to why a file matters).
3. Check `README.md` against the actual code (slash commands table,
   AI chat capabilities, architecture description) — fix drift, never
   invent capabilities that don't exist.
4. Sweep for dead code/unused deps accumulated since the last cleanup —
   this repo has documented history of exactly this pattern (Base44
   scaffold bloat). Only remove what's grep-verified as zero-reference;
   flag, don't delete, anything ambiguous.
5. Surface TODO/FIXME markers as a checklist in the PR description —
   don't resolve them, just surface them.
6. Re-verify lint/test/build clean before merging.
7. Commit, push, open PR, merge immediately (personal automation, no
   review wait — same as the vault's).

Explicit guardrail not in the vault's version, added because we just lived
through exactly this failure mode this session: **never touch
`base44/functions/aiChatStream` or `base44/entities` without certainty the
change matches `AGENTS.md`/the vault's Vaea decision notes** — that
function needs an explicit publish step, and getting its behavior wrong is
expensive to debug blind.

Draft config, ready to create the moment you say go:

- Name: `Nightly Vaea Maintenance`
- Schedule: `17 3 * * *` UTC (11:17pm America/New_York) — a few minutes
  after the vault's own 3:00 UTC run
- Repo: `https://github.com/SheppCrafd/vaea`
- Model: `claude-sonnet-5`, tools: Bash/Read/Write/Edit/Glob/Grep
- Notifications: push, same as the vault's

## Privacy note

Nothing above — hook, subagent, or routine — ever touches actual Vaea
*project* data (areas/products/projects/tasks/notes). The hook only reads
git metadata and vault markdown. The routine runs against a fresh clone of
the GitHub repo, and `data/` is gitignored — never in git history at all —
so there's structurally nothing for a cloud checkout to ever see. This
operates one layer up, on the codebase, never on the layer the app's own
local-only privacy guarantee protects.

## What's real vs. what's waiting

| Piece | Status |
|---|---|
| Global identity (Anvil/soul/Crucible) | Already covers this repo — no action taken, none needed |
| `.claude/settings.json` + `load-vaea-context.ps1` | Built, tested directly |
| `.claude/agents/vaea-crawler.md` | Built, **not yet** live-tested end-to-end |
| `.claude/commands/vaeacrawl.md` | Built |
| Nightly Routine | Drafted above, not created — waiting on your go-ahead |
