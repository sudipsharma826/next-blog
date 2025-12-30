# Next Blog Monorepo

This project is a monorepo containing a full-stack blog application with the following structure:

## Structure

- **backend/**: NestJS API server for handling blog logic and data.
- **frontend/**: Next.js app for the blog's user interface.
- **packages/shared/types/**: Shared TypeScript types for backend and frontend.
- **packages/shared/utils/**: Shared utility functions for backend and frontend.

## Features

- Monorepo managed with workspaces for easy dependency management.
- ESLint and Prettier configured for consistent code style across all packages.
- TypeScript used throughout for type safety.
- Backend: NestJS, ready for REST API development.
- Frontend: Next.js, ready for SSR and static site generation.
- Shared code: Types and utilities for DRY development.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```
2. Lint all workspaces:
   ```
   npm run lint --workspaces
   ```
3. Check formatting:
   ```
   npx prettier --check frontend backend packages
   npx prettier --write frontend backend packages ( if some issue in there )
   ```
4. Run the application
 ```
 npm run dev ( To run frontend and backend concurrently)
 npm run dev:frontend ( to run frontend only)
 npm run dev:backend( To run backend only)
## Notes
- Each package has its own ESLint and Prettier config for flexibility.
- Make sure to use branches for new features or deployments.

---
