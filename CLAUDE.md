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
    - **Add tasks as you start working on them** - Don't wait until completion
    - **Update progress during the session** - Mark progress as you go, not just at the end
    - **Move completed work to "Recently Completed" section** - Keep details for context
    - **Ask before final removal** - When you think an issue is fully resolved, ask the user to confirm before removing it entirely
    - **Only track YOUR incomplete tasks** - Not the user's personal todos
    - **Keep notes brief but informative** - Include enough detail for future sessions
    - **Organize as needed** - Structure sections and categorize in whatever way works best
    - **This is YOUR responsibility** - The user should never have to remind you to update it

## Important Notes
- Developer typically handles `npm run dev` and `npm run build` - do not run these unless explicitly asked
- API integration is handled in [src/controllers/api.ts](src/controllers/api.ts) and caching in [src/controllers/api_cache.ts](src/controllers/api_cache.ts)
