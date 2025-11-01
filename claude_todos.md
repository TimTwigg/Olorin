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

*(No active tasks - all lint errors resolved!)*

---

## Recently Completed Work

### ✅ Dashboard Theme Integration (Session: 2025-11-01)

**Objective**: Make theme switching much more visible on the dashboard

**Changes Made**:
1. **Background**: Changed from generic `bg-gray-50/gray-900` to `bg-primary-50/primary-950`
2. **Header**: Added accent-colored icon and primary text colors
3. **Stat Cards**: Complete redesign with vibrant gradients:
   - Active Campaigns: Primary to accent gradient (`from-primary-600 to-accent-500`)
   - Total Encounters: Primary gradient (`from-primary-600 to-primary-700`)
   - Custom Stat Blocks: Accent to primary gradient (`from-accent-400 to-primary-600`)
   - All cards now use white text with glassmorphism icon backgrounds
   - Left and right cards both shift colors for visual interest
4. **Campaign List Card**:
   - Card background uses `bg-white/primary-900` with primary borders
   - Individual campaigns use `bg-primary-50/primary-800` with accent hover states
   - Added accent-colored section icon and chevron icons
5. **Quick Actions Sidebar**:
   - Gradient background (`from-primary-600 to-primary-700`)
   - Added bolt icon to header in accent color
   - Buttons use glassmorphism with accent hover states
   - All text now white for better contrast

**Result**: Theme changes are now immediately obvious when switching between color schemes!

**Files Modified**: `src/routes/index.lazy.tsx`

---

### ✅ All Lint Errors Fixed! (Session: 2025-11-01)

**Final Status**: **0 problems (0 errors, 0 warnings)** ✨

All remaining `@typescript-eslint/no-explicit-any` errors were resolved by properly typing the API layer and related code. The codebase now passes linting completely!

**Key changes**:
- Fixed all type annotations in `src/controllers/api.ts` and `src/controllers/api_cache.ts`
- Improved cache key generation to include URL parameter (prevents cache collision issues)
- Removed debug console.log statement

**Total progress**: From 75 problems → 0 problems

---

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

**Last Updated**: 2025-11-01 (end of session - dashboard theme integration complete)
