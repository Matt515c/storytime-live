# StoryLive — Claude Code Setup Guide

## Initial Setup

### 1. Drop Configuration Files

Copy this entire directory structure into your new StoryLive repo root:

```
CLAUDE.md                    ← Root behavioral rules
STATUS.md                    ← Living project status
MEMORY.md                    ← Persistent learnings (Claude updates this)
docs/
├── architecture.md          ← System architecture reference
├── product-spec.md          ← Full product specification (copy from PRODUCT_SPEC.md)
└── task-scaffold.md         ← Build task sequence (copy from TASK_SCAFFOLD.md)
.claude/
├── rules/
│   ├── pipeline.md          ← AI pipeline code rules (auto-loaded)
│   ├── testing.md           ← Testing conventions (auto-loaded)
│   └── components.md        ← Component & UI rules (auto-loaded)
├── commands/
│   ├── health-check.md      ← /health-check
│   ├── add-service.md       ← /add-service
│   ├── coverage-audit.md    ← /coverage-audit
│   └── deploy.md            ← /deploy
└── agents/
    ├── pipeline-reviewer.md ← Pipeline code reviewer
    └── test-writer.md       ← Test generation agent
```

### 2. Run `/init` in Claude Code

After dropping the files, open a Claude Code session in the repo and run `/init`. This lets Claude scan the actual codebase and merge its findings with the configuration. Review what it suggests and accept/modify.

### 3. Create CLAUDE.local.md (Optional)

For personal preferences that shouldn't be committed:

```markdown
# Personal Preferences

- I prefer verbose git commit messages
- When explaining code, use analogies to cooking
- Always show me the test before the implementation
```

Add `CLAUDE.local.md` to `.gitignore`.

## How to Iterate

### The Self-Improvement Loop

Every time Claude makes a mistake:

1. Correct it
2. Tell Claude: "Add what you learned to MEMORY.md"
3. If the mistake was about a behavioral rule, tell Claude: "Add a rule to CLAUDE.md to prevent this"

### Weekly Review

Once a week, ask Claude:

> "Review CLAUDE.md, MEMORY.md, and STATUS.md. Remove any rules that are redundant with linting or TypeScript config. Add rules for any mistakes you've been making. Update STATUS.md to reflect current state."

### When to Update What

| Something changed...                   | Update...                       |
| -------------------------------------- | ------------------------------- |
| Project status, what's being worked on | STATUS.md                       |
| Discovered a non-obvious behavior      | MEMORY.md                       |
| Claude keeps making the same mistake   | CLAUDE.md (add a rule)          |
| New file type needs specific rules     | .claude/rules/new-rule.md       |
| Doing a task more than twice           | .claude/commands/new-command.md |
| Architecture decision finalized        | docs/architecture.md            |

## Validating the Setup

After initial configuration, test these scenarios:

1. **Ask Claude to create a new component** — verify it follows naming conventions, creates colocated test, uses named exports
2. **Ask Claude about the pipeline architecture** — verify it references the product spec and understands the 3-phase model
3. **Ask Claude to add a service adapter** — verify it follows the adapter pattern from the rules
4. **Run `/health-check`** — verify the command works end-to-end
5. **Introduce a deliberate mistake** — verify Claude catches it or, if it doesn't, add a rule

## Branch Strategy

### Pre-1.0 (Current)

- Work directly on `master`
- Deploy to Vercel on every push
- Tag releases: `v0.1.0`, `v0.2.0`, etc.

### Post-1.0 (After Stable Release)

- `dev` branch for all active development
- Branch from `dev` for features: `feat/task-5-template-prefab`
- PR from feature → `dev` (requires passing CI)
- PR from `dev` → `master` for production releases
- Tag on `master`: `v1.0.0`, `v1.1.0`, etc.
- NEVER commit directly to `master` after 1.0
