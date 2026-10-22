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
- Check `package.json` for current start, platform, build, lint, and formatting scripts. There is no configured unit-test script.

## Verification

- Run `npm run lint` for ESLint and Prettier checks.
- Run `npx tsc --noEmit` for a TypeScript check.
- For UI changes, use the platform workflow and visual checks available in the current environment.