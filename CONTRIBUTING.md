# Contributing to PocketCal

Thanks for your interest in contributing! This guide explains how to get the project running locally, the development workflow, and how to submit changes.

## Techhnical Libraries Overview
Libraries and Tech Stack notes 
- **Stack**: React + TypeScript + Vite
- **State**: Zustand (`src/store.ts`)
- **Linting**: ESLint (TypeScript + React Hooks rules)
- **Build/Serve**: Vite
- **Deploy**: Netlify (static site + optional serverless functions under `netlify/functions/`)

## Prerequisites
Software tools you will need, please use their onw setup websites / how to for install and base  configuation.
- **Node.js**: v18+ is recommended (Vite 6 requires modern Node). Check with `node -v`.
- **npm**: v9+ recommended (repo uses `package-lock.json`).

## Getting Started
1. Fork and clone the repo.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   Vite prints a local URL (typically http://localhost:5173). Open it in your browser.

## Project Structure
- `src/main.tsx`: App bootstrap
- `src/App.tsx`: Root UI
- `src/components/`: Reusable UI components
- `src/store.ts`: Zustand store and actions
- `public/`: Static assets and PWA manifest
- `netlify/functions/`: Netlify serverless functions (e.g. `validate-license.js`)
- `eslint.config.js`: ESLint config
- `vite.config.ts`: Vite config

## Development Tips
- **TypeScript**: Prefer explicit types for public component props and store selectors.
- **State (Zustand)**: Keep selectors small, avoid unnecessary re-renders. Derive data via selectors when possible.
- **Components**: Keep components focused; compose small pieces from `src/components/`.
- **Styling**: The project uses plain CSS files (e.g., `src/App.css`, `src/index.css`).
- **Accessibility**: Use semantic HTML, keyboard navigability, and proper ARIA attributes. Test focus states.

## Linting & Quality
- Run ESLint:
  ```bash
  npm run lint
  ```
- ESLint enforces React Hooks rules and Vite/React refresh compatibility.
- Please fix lint warnings where practical.

## Building & Previewing
- Create a production build:
  ```bash
  npm run build
  ```
- Preview the production build locally:
  ```bash
  npm run preview
  ```

## Tests
There are currently no automated tests in the repository. If you add tests in a PR, include instructions in the PR description.

## Adding Dependencies
- Prefer small, well-maintained libraries.
- Avoid heavy dependencies for simple utilities.
- If adding a dependency, explain why in the PR description.

## Git Workflow
- **Branching**: Create a feature branch from `main` (e.g., `feat/color-picker`, `fix/date-range-bug`).
- **Commits**: Descriptive messages. Conventional Commits are welcome (e.g., `feat: add share link copy button`).
- **Sync**: Rebase or merge `main` as needed to keep your branch up to date.

## Submitting a Pull Request
1. Ensure the app runs locally and builds:
   - `npm run lint`
   - `npm run build`
2. Open a PR against `main` with:
   - A clear description of changes and motivation.
   - Screenshots/GIFs for UI changes.
   - Notes on any new deps or tradeoffs.
3. Be responsive to review feedback. Small, focused PRs get merged faster.

## Deployment Notes
- The project is deployed on Netlify. You do not need to deploy for a PR; maintainers will handle production deploys.
- PRs from forks may trigger Netlify preview deploys depending on repository settings.
- Serverless code (if any) lives in `netlify/functions/`.

## Issue Reports & Feature Requests
- Search existing issues first.
- When filing a new issue, include steps to reproduce, expected vs. actual behavior, and environment details (browser, OS).

## License
By contributing, you agree that your contributions will be licensed under the project’s MIT License (see `LICENSE`).

## Questions
Open an issue or start a discussion on the PR. Thanks for helping improve PocketCal!
