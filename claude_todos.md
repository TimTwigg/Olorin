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

### Lint Error Fixes (Session: 2025-10-23)

**Progress**:
- Started this session: 76 problems (66 errors, 10 warnings)
- Current: **75 problems (65 errors, 10 warnings)**
- Fixed 1 error this session (immutability in encounters/$encounterID.tsx)

**Major Work Completed This Session**:
1. ✅ **Fixed React forwardRef implementation** - Converted EntityDisplay and LairDisplay components to properly use React.forwardRef
2. ✅ **Fixed ScrollToEntity functionality** - Implemented proper ref handling with callback refs and fixed scroll timing issue
   - Problem: `TriggerReRender()` was resetting scroll position immediately after setting it
   - Solution: Used `setTimeout(() => ScrollToEntity(...), 0)` to scroll after re-render completes
   - Note: Currently works but not smooth; can be improved later with smooth scrolling
3. ✅ **Fixed immutability errors** - Used `useRef` for refsMap instead of `let` variable

**Remaining Work** (75 problems: 65 errors, 10 warnings):

Categorized by type:
- **Category 1**: `@typescript-eslint/no-explicit-any` (40 errors) - case by case review needed
- **Category 2**: `no-prototype-builtins` (6 errors) - easy fix with `Object.hasOwn()`
- **Category 3**: `react-hooks/exhaustive-deps` (10 warnings) - needs careful dependency management
- **Category 4**: `@typescript-eslint/no-unused-expressions` (2 errors) - likely comma operators
- **Category 6**: Complex dependency array in tableFilter.tsx (2 errors)

**Next Steps**:
1. Category 4: Fix unused expression errors (2 errors) - easy
2. Category 2: Fix no-prototype-builtins errors (6 errors) - easy
3. Category 6: Fix complex dependency array issues in tableFilter.tsx (2 errors) - medium
4. Category 3: Fix React Hook exhaustive-deps warnings (10 warnings) - medium/hard
5. Category 1: Fix TypeScript no-explicit-any errors case-by-case (40 errors) - case by case

---

## Notes

- Developer prefers incremental fixes, not all at once
- When fixing refs, use proper React patterns (forwardRef for components, callback refs for dynamic lists)
- Scroll timing issues: Always scroll AFTER re-renders complete using setTimeout
- ESLint config allows `_` prefix for intentionally unused variables
- Smooth scrolling improvement can be tackled in a future session

---

**Last Updated**: 2025-10-23
