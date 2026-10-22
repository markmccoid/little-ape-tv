# SQLite + React Query own show data; Legend State keeps settings and UI state

Saved Shows, Episode States, Season Summaries, Tags, and per-show notification history live in a per-user SQLite database (`expo-sqlite` + Drizzle) and are read through React Query hooks; writes go through mutation functions that update SQLite and then update or invalidate the affected query keys. Legend State + MMKV remains only for settings, Filter Criteria, Saved Filters, and search. We moved off Legend/MMKV for show data because the whole library was one JSON blob rewritten on every episode tap, and filtering/sorting ran in JS over every show on every render; SQLite gives indexed filtering and row-level writes as the library grows to thousands of shows.

## Considered Options

- **Keep Legend State as an in-memory mirror of SQLite** (e.g. Legend's SQLite persist plugin): rejected because it keeps the entire library in memory and in the render-subscription graph, which is the problem we were solving.
- **Ship phase-by-phase with both stores kept in sync**: rejected; the app has a single user, so a dual-write period costs more than a single cut-over release.

## Consequences

- Two state systems coexist on purpose. Do not put show data back into Legend observables.
- Background tasks open the SQLite file directly and never touch React Query; the app refetches show queries when it returns to the foreground.
- Season Summary columns are a cache: they need TMDB episode counts, so they are recomputed when season data is fetched rather than derived purely in SQL.
