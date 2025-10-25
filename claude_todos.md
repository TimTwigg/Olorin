# Claude's To-Do List

**Purpose**: This file tracks incomplete tasks and open items for Claude Code instances working on this project. This is separate from the developer's personal todo list in `todo.md`.

**Instructions for Claude**:
- Update this file during the session as you work on tasks
- Move completed work to "Recently Completed" section - keep details for context
- Ask before final removal - when you think an issue is fully resolved, ask the user to confirm before removing it entirely
- Only track YOUR incomplete tasks - Not the user's personal todos
- Keep notes brief but informative - Include enough detail for future sessions
- Organize as needed - Structure sections and categorize in whatever way works best

---

## Current Open Tasks

### Lint Error Fixes (Ongoing)

**Current Status**: **67 problems (57 errors, 10 warnings)** - down from 75!

**Progress this session**:
- ✅ Fixed Category 4: `@typescript-eslint/no-unused-expressions` (2 errors) - converted comma operators to separate statements
- ✅ Fixed Category 2: `no-prototype-builtins` (6 errors) - replaced `.hasOwnProperty()` with `Object.hasOwn()`

**Remaining work** (67 problems):
- **Category 1**: `@typescript-eslint/no-explicit-any` (~40 errors) - case by case review needed
- **Category 3**: `react-hooks/exhaustive-deps` (~9 warnings) - needs careful dependency management
- **Category 6**: Complex dependency array in tableFilter.tsx (1 error, 1 warning)

**Next Steps** (when resuming lint fixes):
1. **Category 6** (tableFilter.tsx) - Replace `column.getFacetedUniqueValues()` with just `column` in dependency array
   - This will fix both the complex expression error AND the missing dependency warning (2 problems total)
2. **Category 3** - Fix React Hook exhaustive-deps warnings (~9 warnings) - medium/hard
3. **Category 1** - Fix TypeScript no-explicit-any errors case-by-case (~40 errors) - varies

---

## Recently Completed Work

### ✅ Lint Fixes - Easy Categories (Session: 2025-10-25 continued)

**Files Modified**:
1. `src/routes/campaigns/$campaignID.tsx` (line 155) - Fixed comma operator in ConfirmDialog onHide
2. `src/routes/campaigns/index.lazy.tsx` (line 196) - Fixed comma operator in ConfirmDialog onHide
3. `src/controllers/utils.ts` (line 48) - Replaced `obj.hasOwnProperty()` with `Object.hasOwn()`
4. `src/models/entity.ts` (line 92) - Replaced `arg.hasOwnProperty()` with `Object.hasOwn()`
5. `src/models/lair.ts` (line 36) - Replaced 4 instances of `arg.hasOwnProperty()` with `Object.hasOwn()`

**Result**: Reduced from 75 problems to 67 problems (8 errors fixed)

---

### ✅ Major Refactor: React Immutability Pattern (Session: 2025-10-25)

**Problem**: Encounter state management was using anti-patterns:
- Encounter methods mutated objects in place (violated React immutability)
- Manual re-render hack with `key={sectionKey}` (caused scroll jumps)
- Active entity display not updating when clicking NEXT button
- Race condition when saving (server response overwrote correct local state)

**Solution**: Complete refactor to proper React patterns

#### Phase 1: Made Encounter Class Immutable
**File**: `src/models/encounter.ts`

- Added `clone()` helper method for creating new instances
- Refactored **14 methods** to return new instances instead of mutating `this`:
  - `addEntity()`, `removeEntity()`, `recalculateEntitySuffixes()`, `tick()`
  - `clear()`, `reset()`, `randomizeInitiative()`, `setInitiativeOrder()`
  - `withName()`, `withDescription()`, `withMetadata()`, `withEntities()`, `withLair()`
  - Fixed `copy()` to capture return values

- Fixed bugs where return values were discarded:
  - `loadFromJSON()` - Now returns `encounter.setInitiativeOrder()`
  - `copy()` - Now captures `newEncounter = newEncounter.setInitiativeOrder()`

#### Phase 2: Cleaned Up Encounter Page
**File**: `src/routes/encounters/$encounterID.tsx`

- Removed `sectionKey` state and `TriggerReRender()` function (manual re-render hack)
- Removed `key={sectionKey}` from root div
- Removed all 6 `TriggerReRender()` calls throughout file
- Fixed `SetActiveEncounter()` to always call `_SetActiveEncounter(enc)` first
- Fixed `saveEncounter()` to accept encounter as first parameter
- Fixed race condition: Removed `_SetActiveEncounter(res)` from save callback (was overwriting correct local state)

#### Phase 3: Improved Scroll Behavior
- Changed `ScrollToEntity()` to use `scrollIntoView({ behavior: 'smooth' })` instead of manual scroll math
- Results in smooth scrolling animation to active entity
- No more jump to top on re-renders

#### Results
✅ **Proper React patterns** - Immutable state updates, no manual re-render hacks
✅ **NEXT button works** - Active entity display updates correctly (bold border)
✅ **Smooth scrolling** - Animates to active entity without jumping to top
✅ **No race conditions** - Clicking NEXT repeatedly works correctly
✅ **No new lint errors** - Maintained error count during refactor

**Status**: Keeping in "Recently Completed" until user confirms scroll functionality is fully tested

---

## Notes for Future Sessions

### Encounter State Management
- Encounter class now follows immutable patterns - all methods return NEW instances
- NEVER call methods without capturing return value (e.g., `encounter.tick()` alone will discard the new instance)
- Always use: `encounter = encounter.tick()` or `SetActiveEncounter(encounter.tick())`
- If adding new Encounter methods, follow the same pattern using `clone()`

### React Best Practices Applied
- Trust React's reconciliation - don't force re-renders with key changes
- Immutable updates for proper state change detection
- No stale closure issues - pass values explicitly to async callbacks

### Scroll Behavior
- Use `scrollIntoView({ behavior: 'smooth' })` for smooth animations
- Use `setTimeout(() => scroll(), 0)` to scroll after re-renders complete
- Callback refs for dynamic element lists (not useRef arrays)

### ESLint Fixes
- Config allows `_` prefix for intentionally unused variables
- Developer prefers incremental lint fixes, not all at once
- **Comma operators**: Convert to separate statements with semicolons
- **hasOwnProperty**: Use `Object.hasOwn(obj, prop)` instead of `obj.hasOwnProperty(prop)`
- **Complex dependency arrays**: Extract function calls to separate variables or just use the object they're called on

---

**Last Updated**: 2025-10-25 (end of session)
