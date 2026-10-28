# Repository Guidelines

## Project Structure & Module Organization
This repository is a Vite + React + TypeScript frontend for the Prodeko infoscreen.
- `src/`: application code (`App.tsx` entry UI, feature components like `Menu.tsx`, `Rotator.tsx`, and shared types in `types.ts`).
- `public/`: static assets (logos, images) copied as-is to the build.
- Root config: `vite.config.ts`, `tsconfig.json`, `tailwind.config.js`, `biome.json`, and `Dockerfile.prod`.
- Output: production build is generated into `dist/`.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start the Vite dev server with API proxies defined in `vite.config.ts`.
- `npm run build`: run TypeScript checks and create a production build.
  - Requires `VITE_KILTISKAMERA_ON_AIR_PASSWORD` to be set during build.
  - Example: `export VITE_KILTISKAMERA_ON_AIR_PASSWORD=... && npm run build`
- `npm run preview`: serve the built app locally from `dist/`.
- `docker build -f Dockerfile.prod .`: build the production image (Nginx serving static files).

## Coding Style & Naming Conventions
- Use TypeScript with strict compiler settings (`tsconfig.json`).
- Use functional React components and hooks.
- Naming:
  - Components/files: `PascalCase` (for example `McKinseyLogo.tsx`).
  - Hooks: `useSomething` (for example `useClock`).
  - Shared types/interfaces: keep in `src/types.ts` unless feature-specific.
- Linting/formatting is handled by Biome (`biome.json`).
  - Example check: `npx @biomejs/biome check src`

## Testing Guidelines
There is currently no automated test suite in this repository.
- Before opening a PR, run `npm run build` and verify key screens manually via `npm run dev`.
- Validate data-dependent views (menus, tiedote, camera status) and responsive layout behavior.
- If you introduce tests, colocate them with source files using `*.test.ts(x)` naming.

## Commit & Pull Request Guidelines
- Follow existing history style: short, imperative commit messages (for example `Fix import`, `Add Prodeko events slide`).
- Keep commits focused to one logical change.
- PRs should include:
  - what changed and why,
  - any config/env changes,
  - screenshots for visible UI updates,
  - linked issue/task when applicable.

## Security & Configuration Tips
- Never commit secrets. Keep `VITE_KILTISKAMERA_ON_AIR_PASSWORD` in environment variables only.
- Review proxy targets in `vite.config.ts` carefully when changing API integrations.
