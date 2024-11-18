# Git Stash Notes

## Active Stashes

### 1. CLI Improvements (Latest)
**Stash Date:** Current
**Branch:** docs/update-workflow-guide
**Description:** WIP: CLI improvements and new commands

**Contains:**
1. New Commands:
   - `code.ts`
   - `context.ts`
   - `sync.ts`
   - Associated command directories

2. Modified Files:
   - Package files (package.json, package-lock.json)
   - CLI core (src/cli.ts)
   - Existing commands
   - Utils and config files
   - TypeScript config

3. New Directories:
   - `.ai/stories/`
   - `src/commands/code/`

**To Restore:**
```bash
# To apply and keep in stash:
git stash apply stash@{0}

# To apply and remove from stash:
git stash pop stash@{0}
```

**Note:** Review changes carefully after applying, especially package.json modifications.
