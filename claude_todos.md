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

### Lint Error Fixes (Session: 2025-10-22)

**Progress So Far**:
- Started with 235 lint errors
- Fixed 10 errors (now at 227 errors)
    - Deleted deprecated OptionBox.tsx (3 errors)
    - Fixed card.tsx empty interface (1 error)
    - Deleted deprecated temp folder (2 errors)
    - Fixed 3 variable declarations let → const (3 errors)
    - Fixed unused error variable in profile.lazy.tsx (1 error)

**Remaining Categories** (in order of priority/ease):

1. **Context Immutability Issue** (Important - 1 error)
   - File: `src/routes/profile.lazy.tsx:65-66`
   - Issue: Direct context mutation `context.userOptions.theme = theme`
   - Solution: Remove these lines since page reloads after save anyway, OR find proper way to update context

2. **Simple `any` Type Fixes** (3 errors)
   - `src/routes/encounters/index.lazy.tsx:94` - any type in filter
   - `src/routes/encounters/index.lazy.tsx:125` - any type in template
   - `src/routes/index.lazy.tsx:107` - any type

3. **More Variable Declarations** (let → const)
   - Multiple in `src/routes/campaigns/$campaignID.tsx`
   - Look for other files with prefer-const errors

4. **React Hook Issues** (Medium complexity)
   - `src/components/entityDisplay.tsx` - 9 errors (hooks called conditionally)
   - `src/components/debouncedInput.tsx` - Missing dependencies warning
   - `src/routes/profile.lazy.tsx:84` - Missing SetLocalVariables dependency

5. **Unused Variables** (Many `_` parameters)
   - Throughout various files
   - Can be prefixed with `_` to indicate intentionally unused

6. **Unused Expressions** (Many errors)
   - Check for ternary operators or logical expressions that don't do anything
   - May require understanding the intent of the code

---

## Notes from Current Session

- Developer prefers tackling lint errors bit by bit, not all at once
- Discovered and removed deprecated files:
    - `src/components/OptionBox.tsx` (not used anywhere)
    - `src/temp/` folder (legacy from before backend implementation)
- Added todo in `todo.md` to review custom Card component for migration to PrimeReact

---

**Last Updated**: 2025-10-22
