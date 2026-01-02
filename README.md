# Next Blog Monorepo

This project is a monorepo containing a full-stack blog application with the following structure:

## Project Structure

- **backend/**: NestJS API server for handling blog logic and data
- **frontend/**: Next.js app for the blog's user interface
- **packages/shared/types/**: Shared TypeScript types for backend and frontend
- **packages/shared/utils/**: Shared utility functions for backend and frontend

## Features

- Monorepo managed with workspaces for easy dependency management
- ESLint and Prettier configured for consistent code style across all packages
- TypeScript used throughout for type safety
- Backend: NestJS, ready for REST API development
- Frontend: Next.js, ready for SSR and static site generation
- Shared code: Types and utilities for DRY development

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```
2. **Lint all workspaces:**
   ```sh
   npm run lint --workspaces
   ```
3. **Check formatting:**
   ```sh
   npx prettier --check frontend backend packages
   npx prettier --write frontend backend packages # (if issues are found)
   ```
4. **Run the application:**
   ```sh
   npm run dev            # Run frontend and backend concurrently
   npm run dev:frontend   # Run frontend only
   npm run dev:backend    # Run backend only
   ```

## Notes

- Each package has its own ESLint and Prettier config for flexibility
- Use branches for new features or deployments

## Documentation

- [Authentication Documentation](docs/auth.md)
