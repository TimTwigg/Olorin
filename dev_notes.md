# Development Notes for Olorin

This document contains key architectural decisions, design guidelines, and migration notes for the Olorin TTRPG campaign management application.

## Project Overview
Olorin is a tabletop RPG (TTRPG) campaign management tool built with:
- React + TypeScript
- TanStack Router for routing
- SuperTokens for authentication
- PrimeReact for UI components
- Tailwind CSS for styling (migrating from SCSS)

## Important Files
- [CLAUDE.md](CLAUDE.md) - Instructions for Claude Code instances
- [claude_todos.md](claude_todos.md) - Claude's open/incomplete tasks (updated at end of each session)
- [todo.md](todo.md) - Developer's personal todo list

## Table of Contents
- [Active Migration: SCSS → Tailwind + PrimeReact](#active-migration-scss--tailwind--primereact)
- [CSS Variables Theme System](#css-variables-theme-system)
- [Theme System Architecture (Light/Dark Mode)](#theme-system-architecture-lightdark-mode)
- [Page Redesigns Completed](#page-redesigns-completed)
- [Design Patterns & Best Practices](#design-patterns--best-practices)
- [Router & Navigation](#router--navigation)
- [State Management](#state-management)
- [Authentication](#authentication)
- [API Integration](#api-integration)
- [Performance & Loading](#performance--loading)
- [Design Philosophy](#design-philosophy)
- [Environment & Build](#environment--build)
- [Common Issues & Troubleshooting](#common-issues--troubleshooting)
- [Future Considerations](#future-considerations)
- [Quick Reference](#quick-reference)

## Active Migration: SCSS → Tailwind + PrimeReact

### Guidelines
1. **DO NOT delete SCSS files** - Comment out styles instead
2. **Comment pattern**: Add explanatory comments when commenting out SCSS

   ```scss
   // Commented out on [date] - now using [Tailwind/PrimeReact Theme] for [specific purpose]
   // [original code]
   ```

3. **Eventually remove ~90% of SCSS** - Long-term goal
4. **Use Tailwind + PrimeReact themes** instead of custom SCSS classes

## CSS Variables Theme System

### Architecture
The app uses a **CSS variables-based theming system** that allows users to select different color schemes while maintaining light/dark mode preferences independently.

### Color Scheme Options
1. **Gandalf the Grey** (default) - Slate grey with warm amber accents
2. **Gandalf the White** - Pure whites with brilliant gold accents
3. **Valinor** - Ethereal blue-purples with silver accents
4. **Mithrandir** - Deep midnight blues with starlight silver accents

### Implementation

**CSS Variables** (`src/styles/themes.css`):
- Defines `--color-primary-*` and `--color-accent-*` variables for each scheme
- Each scheme is scoped by `[data-color-scheme="scheme-name"]` selector
- Variables use RGB values to support Tailwind's alpha channel syntax

**Tailwind Config** (`tailwind.config.js`):
- `primary-*` classes map to `--color-primary-*` variables
- `accent-*` classes map to `--color-accent-*` variables
- Format: `rgb(var(--color-primary-500) / <alpha-value>)`

**User Options Model** (`src/models/userOptions.ts`):
- Added `ColorScheme` type for easy maintenance
- Type: `"gandalf-grey" | "gandalf-white" | "valinor" | "mithrandir"`
- Adding new schemes only requires updating this type and the CSS file

**Theme Hook** (`src/hooks/useTheme.ts`):
- Sets `data-color-scheme` attribute on document root
- Handles both light/dark mode AND color scheme
- Re-runs when `context.userOptions.theme` or `context.userOptions.colorScheme` changes

**Root Loader** (`src/routes/__root.tsx`):
- Loads both theme and colorScheme from user metadata
- IMPORTANT: Must `await loadContextData(context)` to ensure context.loaded is set
- Temporary controls in navbar for testing (theme toggle + color scheme dropdown)

### Color Usage Pattern

```tsx
// Old hardcoded approach (don't use):
className="text-red-600 bg-amber-500"

// New CSS variables approach (use this):
className="text-primary-600 bg-accent-500"
```

### Benefits
- Easy to add new color schemes (just CSS + type update)
- Users can switch schemes in real-time
- Maintains separation between light/dark mode and color palette
- All accent colors update automatically across entire app

## Theme System Architecture (Light/Dark Mode)

### Implementation
- **Storage**: User theme preference stored in SuperTokens user metadata
- **Options**: "light" | "dark" | "system"
- **Hook**: `src/hooks/useTheme.ts` - centralized theme management
- **Loading**: Theme loaded from metadata in root route loader (`src/routes/__root.tsx`)

### How It Works
1. Root loader fetches metadata and sets `context.userOptions.theme` and `context.userOptions.colorScheme`
2. Root component calls `useTheme()` hook (applied globally)
3. Hook updates:
   - PrimeReact theme CSS file (bootstrap4-light-blue or bootstrap4-dark-blue)
   - Tailwind dark mode via `dark` class on `<html>` element
   - Color scheme via `data-color-scheme` attribute on `<html>` element
4. Profile page allows users to change both theme and color scheme preferences

### Important Notes
- **Only call `useTheme()` in root component** - Not in individual pages (causes conflicts)
- **Use TanStack Router `Link` component** - Not `window.location.href` (prevents context loss)
- **Dependencies**: Hook re-runs when `context.loaded`, `context.userOptions.theme`, or `context.userOptions.colorScheme` changes

## Page Redesigns Completed

### Navigation Bar (`src/routes/__root.tsx`)
- Modern horizontal layout with logo, nav links, and user menu
- Height: `h-20` (80px)
- Compass icon + "Olorin" branding with accent colors
- Hover states on all links
- Full dark mode support
- User dropdown menu with Profile and Sign Out options
- Uses Headless UI Menu component with `data-[focus]` for hover states
- TEMP: Theme toggle button and color scheme dropdown for testing

### Home Page (`src/routes/index.lazy.tsx`)
**Dual Mode Design:**
- **Landing Page** (logged out): Hero section with gradient, feature cards, CTAs
- **Dashboard** (logged in): Quick stats, recent campaigns, quick action sidebar

**Loading Strategy:**
- Shows landing page immediately (no blocking)
- Checks authentication in background
- Switches to dashboard when auth confirmed
- Dashboard loads with inline spinners (not full-page blocking)
- This prevents context loading from blocking initial page render

### Library Pages
**Landing Page** (`src/routes/library/index.lazy.tsx`):
- Card-based layout with clickable sections
- Icons for each section (Custom Stat Blocks, Official Stat Blocks, etc.)
- "Coming Soon" badges for unimplemented sections
- URL-based routing (not state-based)

**Stat Block Pages** (`src/routes/library/custom-statblocks.lazy.tsx`, `official-statblocks.lazy.tsx`):
- Separate routes for better navigation and browser history
- Uses `StatBlockList` component with filtering

**StatBlockList Component** (`src/components/statBlockList.tsx`):
- Search by name
- Filter by Type, Source
- CR filter: **Numeric range** with min/max inputs (not dropdown)
- Pagination (50 items per page)
- Loading states with skeletons
- Font size: Added `text-base` and padding `p-3` for readability

### Profile Page (`src/routes/profile.lazy.tsx`)
- Modern card-based design
- Two main cards: Account Information and Appearance
- PrimeReact components: `Card`, `InputText`, `Dropdown`, `Button`, `Divider`
- Theme selector with icons (Sun/Moon/Desktop)
- **Color scheme selector** with descriptions for all four Middle-earth inspired schemes
- Theme preview section showing current selection
- Icon alignment: Uses `leading-none` and `my-0` for proper vertical alignment
- Input padding: `p-3` on InputText for comfortable spacing
- Uses `accent-*` colors for save button

## Design Patterns & Best Practices

### Typography
- Base font size: 16px (applied via inline style on page containers)
- Heading hierarchy: `text-4xl` (page titles), `text-2xl` (section titles), `text-xl` (card titles)
- Icons and text alignment: Use `leading-none` and `my-0` to prevent misalignment

### Layout
- Max width containers: `max-w-4xl` (profile), `max-w-6xl` (library landing, home landing), `max-w-7xl` (nav bar, dashboard)
- Vertical padding: `py-8` for page content
- Card spacing: `mb-6` between cards
- Internal spacing: `space-y-4` for form elements

### Colors (Using CSS Variables)
- **Primary colors**: Use `primary-*` classes (maps to theme's main color)
- **Accent colors**: Use `accent-*` classes (maps to theme's accent color)
- **Neutral colors**: Use `gray-*` for backgrounds, borders, text
- **Semantic colors**: Use `blue-*`, `green-*`, `purple-*` for stats/badges (don't theme these)

**Common Mappings:**
- Backgrounds: `bg-gray-50` (light), `bg-gray-900` (dark)
- Cards: `bg-white` (light), `bg-gray-800` (dark)
- Primary text: `text-gray-900` (light), `text-white` (dark)
- Secondary text: `text-gray-600` (light), `text-gray-400` (dark)
- Accents: `text-accent-500`, `bg-accent-600`, `hover:bg-accent-700`
- Gradients: `from-primary-700 to-primary-900`

### Dark Mode
- Always include `dark:` variants for all color classes
- Border colors: `border-gray-200 dark:border-gray-700`
- Hover states: `hover:bg-gray-100 dark:hover:bg-gray-700`
- Accent hover: `hover:text-accent-600 dark:hover:text-accent-400`

### Components
- **Buttons**: Use PrimeReact `Button` component with accent color scheme (`bg-accent-600 hover:bg-accent-700`)
- **Forms**: PrimeReact `InputText`, `Dropdown` with consistent padding
- **Cards**: PrimeReact `Card` with border and background classes
- **Dropdowns**: Use `optionLabel` and `optionValue` props, custom templates for icons
- **Menus**: Headless UI with `data-[focus]` for hover states (not deprecated `active` prop)

## Router & Navigation

### TanStack Router
- Use `Link` component for navigation (not `window.location.href`)
- Lazy-loaded routes with `createLazyFileRoute`
- Context available via `useRouteContext({ from: "__root__" })`
- **Root loader must await** `loadContextData(context)` to set `context.loaded = true`

### Route Structure

```text
/                           - Home (landing or dashboard based on auth)
/profile                    - User profile settings
/library                    - Library landing page
/library/custom-statblocks  - Custom stat blocks list
/library/official-statblocks - Official stat blocks list
/campaigns                  - Campaigns list
/encounters                 - Encounters list
/support                    - Support page
```

## State Management

### Context (ModelContext)

```typescript
{
    loaded: boolean;  // MUST be true before dashboard renders
    userOptions: UserOptions;  // includes theme and colorScheme
    conditions: Condition[];
    creatureTypes: string[];
    creatureSizes: string[];
    campaigns: CampaignOverview[];
    technicalConfig: {
        cacheSizes: {
            statblocks: number;
        };
    };
}
```

### User Options

```typescript
{
    defaultColumns: number;
    theme: "light" | "dark" | "system";
    colorScheme: ColorScheme;  // "gandalf-grey" | "gandalf-white" | "valinor" | "mithrandir"
}
```

## Authentication

### SuperTokens Integration
- Session management with `SessionAuth` wrapper
- User metadata storage (display name, theme, colorScheme)
- API methods: `getMetadata()`, `setMetadata()`, `getDisplayName()`

### Profile Navigation
- Changed from `window.location.href` to `Link` component
- Prevents full page reload and context loss
- Maintains theme state across navigation

## API Integration

### Architecture
- **API Client**: `src/controllers/api.ts` - handles all backend communication
- **Caching**: `src/controllers/api_cache.ts` - manages API response caching
- Cache configuration in `context.technicalConfig.cacheSizes`

### Best Practices
- Use the centralized API controller for all backend requests
- Leverage caching for frequently accessed data (e.g., stat blocks)
- Handle loading and error states consistently across components
- API calls should be made in route loaders or component effects, not in render

## Performance & Loading

### Context Loading Strategy
- Root loader **awaits** `loadContextData()` to populate context
- Individual pages can start rendering before context is fully loaded
- Dashboard shows inline loading states (spinners in cards) rather than blocking entire page
- Authentication check is fast and doesn't block landing page render

### Best Practices
- Show UI skeleton/structure immediately
- Add inline loading spinners for data-dependent sections
- Don't block entire page waiting for context unless absolutely necessary
- Check `context.loaded` before accessing context data in components

## Design Philosophy

### User Experience
- Clean, modern interface
- Consistent spacing and visual hierarchy
- Readable text sizes (no tiny text)
- Clear hover states and interactions
- Professional look without emojis (unless explicitly requested)
- Fast initial page load (show content immediately, load data in background)

### Code Quality
- Prefer Tailwind classes over custom CSS
- Use CSS variables (`primary-*`, `accent-*`) instead of hardcoded colors
- Use semantic HTML and ARIA labels where appropriate
- Comment architectural decisions in code
- Keep components focused and reusable
- Type safety with ColorScheme type for easy maintenance

## Environment & Build

### Development Commands
- **Development server**: `npm run dev` (typically handled by user)
- **Build**: `npm run build` (typically handled by user)
- **Linting**: `npm run lint` (run after making code changes)

### Environment Variables
- Environment variables should be documented here as they are added
- Use `.env.template` as a reference for required variables

### Important Notes
- Claude should not run `npm run dev` or `npm run build` unless explicitly requested
- Always run `npm run lint` after making code changes to catch issues
- No automated testing is currently set up

## Common Issues & Troubleshooting

### Context Not Loading
**Symptoms**: Dashboard shows loading spinners indefinitely, context data is undefined
**Solutions**:
- Ensure root loader awaits `loadContextData(context)` in `src/routes/__root.tsx`
- Check that `context.loaded` is true before accessing context data in components
- Verify API endpoints are responding correctly

### Theme Not Applying
**Symptoms**: Colors don't change when switching themes or color schemes
**Solutions**:
- Verify `useTheme()` is only called in root component (not individual pages)
- Check that CSS variables are defined in `src/styles/themes.css`
- Ensure `data-color-scheme` attribute is set on `<html>` element
- Verify PrimeReact theme CSS file is being loaded

### Navigation Issues
**Symptoms**: Context lost during navigation, full page reload on navigation
**Solutions**:
- Use TanStack Router `Link` component, not `window.location.href`
- Ensure routes are properly configured in router
- Check that `Link` components have correct `to` prop

### Styling Issues
**Symptoms**: Dark mode not working, custom styles not applying
**Solutions**:
- Ensure `dark` class is on `<html>` element for dark mode
- Check that Tailwind classes include `dark:` variants
- Verify CSS variables are being used (`primary-*`, `accent-*`) instead of hardcoded colors
- Review SCSS migration guidelines - ensure old SCSS isn't conflicting

### API/Caching Issues
**Symptoms**: Stale data, failed requests
**Solutions**:
- Check `src/controllers/api.ts` for error handling
- Review cache configuration in `context.technicalConfig.cacheSizes`
- Verify backend API is running and accessible

## Future Considerations

1. **Complete SCSS removal**: Continue commenting out and replacing SCSS with Tailwind
2. **Remove temporary theme controls**: Remove navbar theme toggle and color scheme dropdown before production
3. **Accessibility**: Add ARIA labels and keyboard navigation where needed
4. **Mobile responsiveness**: Test and optimize for smaller screens
5. **Active link highlighting**: Add visual indication of current page in nav bar
6. **Additional color schemes**: Easy to add more Middle-earth inspired themes
7. **Testing strategy**: Consider adding unit tests, integration tests, or E2E tests
8. **Error boundaries**: Implement React error boundaries for better error handling
9. **Performance monitoring**: Consider adding performance tracking for API calls and renders

## Quick Reference

### Common Patterns

**Page Container:**

```tsx
<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8" style={{ fontSize: "16px" }}>
    <div className="max-w-4xl mx-auto px-4">
        {/* Content */}
    </div>
</div>
```

**Card:**

```tsx
<Card className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
    {/* Card content */}
</Card>
```

**Button with Accent Color:**

```tsx
<Button
    label="Save"
    icon="pi pi-check"
    onClick={handleClick}
    className="bg-accent-600 hover:bg-accent-700 text-white border-accent-600"
/>
```

**Link (Navigation):**

```tsx
<Link to="/path" className="text-gray-700 dark:text-gray-300 hover:text-accent-600 dark:hover:text-accent-400">
    Link Text
</Link>
```

**Themed Icon:**

```tsx
<i className="pi pi-compass text-accent-500 dark:text-accent-400"></i>
```

**Gradient with Theme Colors:**

```tsx
<div className="bg-gradient-to-br from-primary-700 to-primary-900 dark:from-primary-800 dark:to-primary-950">
    {/* Hero content */}
</div>
```

### Adding a New Color Scheme

1. Add CSS variables to `src/styles/themes.css`:

    ```css
    [data-color-scheme="new-theme"] {
        --color-primary-500: R G B;
        --color-accent-500: R G B;
        /* ... other shades */
    }
    ```

2. Update type in `src/models/userOptions.ts`:

    ```typescript
    export type ColorScheme = "gandalf-grey" | "gandalf-white" | "valinor" | "mithrandir" | "new-theme";
    ```

3. Add option to profile dropdown (and temp navbar dropdown if still present)

4. Done! All `primary-*` and `accent-*` classes will automatically work with the new scheme.

---

**Last Updated:** 22 October 2025 (Session: Documentation improvements - added TOC, API integration, troubleshooting, and environment sections) <br>
**Status:** Active development - CSS variables theming system complete, ongoing SCSS → Tailwind migration
