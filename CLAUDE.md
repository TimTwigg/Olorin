# Instructions for Claude

## Key Project Documents
- [dev_notes.md](dev_notes.md) - Architecture, design patterns, and migration guidelines
- [claude_todos.md](claude_todos.md) - Claude's open tasks and incomplete work (YOUR todo list)
- [todo.md](todo.md) - Developer's personal todo list (DO NOT MODIFY without permission)
- [README.md](README.md) - Project setup and overview

## General Guidelines
- Read the [dev notes](dev_notes.md) before starting work
- Suggest improvements to this CLAUDE.md document and the dev_notes.md document if applicable
- If you lack context for a question or task that is not covered in the dev_notes.md document, suggest adding a section or note to include that context for future.

## Tech Stack Overview
- React + TypeScript
- TanStack Router (use Link component, not window.location)
- SuperTokens for authentication
- PrimeReact for UI components
- Tailwind CSS (migrating from SCSS - see dev_notes.md for guidelines)

## Code Style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')
- Use TypeScript for all new code
- Follow existing patterns for CSS: prefer Tailwind + PrimeReact over custom CSS
- Use CSS variables (primary-*, accent-*) instead of hardcoded color values
- See [dev_notes.md](dev_notes.md) for detailed design patterns and quick reference

## Workflow
- Ask questions before making decisions
- Create high-level plan and todo list for code changes, present for approval before implementing
- Run linting after changes: `npm run lint`
- Update [dev notes](dev_notes.md) when applicable (general principles, not changelog)
- **IMPORTANT - Update [claude_todos.md](claude_todos.md) proactively**:
    - Update IMMEDIATELY after completing a set of related tasks (don't wait for user to remind you)
    - Only track YOUR incomplete tasks (not user's todos)
    - Remove completed items
    - Keep notes brief but informative
    - If all tasks complete, clear the file and note "No open tasks"
    - This is YOUR responsibility - the user should never have to remind you to update it

## Important Notes
- Developer typically handles `npm run dev` and `npm run build` - do not run these unless explicitly asked
- API integration is handled in [src/controllers/api.ts](src/controllers/api.ts) and caching in [src/controllers/api_cache.ts](src/controllers/api_cache.ts)
