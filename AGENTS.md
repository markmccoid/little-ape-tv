# Repository Guide

## Project Shape

- This is an Expo SDK 58, React Native, and TypeScript app using Expo Router.
- Routes and app-level layout live under `src/app/`; `~` is the alias for `src/`.
- Shared UI is under `src/components/`, state stores under `src/store/`, API/query code under `src/data/`, and shared helpers under `src/utils/`.
- Styling uses NativeWind. Follow the existing component and styling patterns in the touched area.
- Native iOS project files are under `ios/`. Dependency patches are maintained in `patches/` and applied by `patch-package` during install.

## Environment

- Expo loads local environment values from `.env`. The app expects `EXPO_PUBLIC_TMDB_API_KEY` during startup and reads `EXPO_PUBLIC_OMDB_API_KEY` for OMDb requests.
- Keep `.env` values private. Do not print, commit, or include API key values in logs or source code.
- Check `package.json` for current start, platform, build, lint, and formatting scripts.
- Show data (Saved Shows, Episode States, Tags) lives in a per-user SQLite database under `src/db/` (expo-sqlite + Drizzle); see `docs/adr/0001-sqlite-react-query-for-show-data.md`. After changing `src/db/schema.ts`, run `npm run db:generate` to add a migration under `drizzle/`.
- Domain terms are defined in `GLOSSARY.md`.

## Verification

- Run `npm run lint` for ESLint and Prettier checks.
- Run `npx tsc --noEmit` for a TypeScript check.
- Run `npm test` for Jest tests of pure data logic (run against in-memory `better-sqlite3`).
- For UI changes, use the platform workflow and visual checks available in the current environment.