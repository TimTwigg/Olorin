# Claude's To-Do List

**Purpose**: This file tracks incomplete tasks and open items for Claude Code instances working on this project. This is separate from the developer's personal todo list in `todo.md`.

**Instructions for Claude**:
- Update this file at the end of each session
- Only track incomplete/open tasks here
- Remove completed tasks
- Keep notes brief but informative
- When all tasks are complete, clear this file and add a note: "No open tasks"

---

## Current Open Tasks

### Lint Error Fixes (Session: 2025-10-22 - Continued)

**Massive Progress This Session!**
- Started: 227 problems (217 errors, 10 warnings)
- Current: **76 problems (66 errors, 10 warnings)**
- **Fixed 151 errors total! (227 → 76)**

**What Was Fixed This Session**:
1. ✅ Context immutability in profile.lazy.tsx - removed direct context mutation (1 error)
2. ✅ 3 'any' type errors - properly typed in encounters and index routes (3 errors)
3. ✅ 4 prefer-const errors in campaigns/$campaignID.tsx (4 errors)
4. ✅ State mutation issue - used structuredClone() for proper cloning (2 errors)
5. ✅ 30 unused variable errors - added ESLint config for `_` prefix pattern (30 errors)
6. ✅ 10 unused expression errors - changed comma operators to semicolons (10 errors)
7. ✅ 9 React Hook errors in entityDisplay.tsx - moved hooks before conditional returns (9 errors)
8. ✅ **63 prefer-const errors** - auto-fixed with `npx eslint . --fix` (63 errors)
9. ✅ 11 unused expression errors - fixed comma operators in lair, encounters (11 errors)
10. ✅ 15 React Hook errors in encounters/$encounterID.tsx - moved hooks before early return (15 errors)
11. ✅ 3 unused variable errors - prefixed with `_` (context, TData, TValue) (3 errors)

**Remaining Work** (66 errors, 10 warnings):

The remaining issues are mostly:
- More 'any' type errors throughout the codebase
- React Hook dependency warnings (useEffect missing dependencies)
- Possibly more immutability issues
- Other TypeScript type errors

**Next Steps**:
1. Categorize the remaining 66 errors by type
2. Fix 'any' type errors where possible
3. Address React Hook dependency warnings carefully
4. Handle any remaining edge cases

---

## Notes

- Developer prefers incremental fixes, not all at once
- ESLint config updated to allow `_` prefix for intentionally unused variables
- Auto-fix capability (`npx eslint . --fix`) is very effective for simple fixes like prefer-const
- Updated CLAUDE.md to remind future Claude instances to proactively update this file

---

**Last Updated**: 2025-10-22
