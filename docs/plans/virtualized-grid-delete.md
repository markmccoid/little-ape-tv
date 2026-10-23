# Plan: virtualized home grid with instant, animated delete

Status: proposed (not started). Chosen approach: **keep a virtualized list + custom exit animation**.

## Problem (measured 2026-10-22, 45-show filtered list, iOS simulator)

Timings after tapping OK in the delete confirmation:

| Step                                                              | Time          |
| ----------------------------------------------------------------- | ------------- |
| Optimistic cache update (`removeShow` → `setQueriesData`)         | +7 ms         |
| SQLite delete                                                     | +3 ms         |
| Invalidate `dbKeys.all`                                           | +47 ms        |
| Urgent render (header count)                                      | +118 ms       |
| **Deferred grid render (`useDeferredValue` in `ShowsContainer`)** | **+1,187 ms** |

The data layer is fast; the grid is the cost. `ShowsContainer` uses a 2-column `Animated.FlatList`
(`numColumns={2}`). With `numColumns`, VirtualizedList keys each _row_ by the items in it, so
removing one show shifts every later show into a different row and **every rendered row is
unmounted and remounted** (each with a nested horizontal `Animated.FlatList`, Moti views, images).
That remount is also why no exit animation plays.

Constraints found:

- Reanimated `Animated.FlatList` `itemLayoutAnimation` only works with a single column.
- `@legendapp/list` 1.0.0-beta.52 (already a dependency) supports `numColumns`, per-item
  `keyExtractor`, `recycleItems`, but has no layout-animation API.

## Goal

1. Deleting a show removes it from the grid within one frame of the confirmation (no ~1 s wait).
2. The deleted card plays an exit animation (fade/scale/slide) before it leaves.
3. Stays virtualized so libraries of thousands of shows still open fast.
4. Accepted trade-off: the remaining cards **jump** to their new positions (no slide).

## Approach

### 1. Swap the grid to Legend List with per-item keys

- `ShowsContainer.tsx`: replace `Animated.FlatList` with `AnimatedLegendList` from
  `@legendapp/list/reanimated` (needed because the header search uses `useAnimatedScrollHandler`
  / `scrollY`).
- `numColumns={2}`, `keyExtractor={(item) => item.id}`, `estimatedItemSize={IMG_HEIGHT + 26}`,
  `columnWrapperStyle` for the gap, `recycleItems={false}` at first (cards hold local state:
  the horizontal card pager index, `localPoster`). Revisit recycling later with
  `useRecyclingState` if memory matters.
- Port `onScroll={scrollHandler}`, `contentContainerStyle`, `keyboardDismissMode`, the
  `listStyle` animated padding, and the empty state.
- `AnimatedShowItem`'s scroll-driven fade/scale uses `index` to compute `itemPositionY`;
  keep passing `index` from `renderItem` (Legend List provides it).
- Remove `useDeferredValue` from `ShowsContainer` once the grid no longer remounts; re-check
  name-search typing smoothness after.

Verify with the same timing method (see "Measuring" below): deferred/urgent render after
delete should drop from ~1.2 s to well under 100 ms, because only the removed card unmounts.

### 2. Custom exit animation, then optimistic removal

Animate first, remove second, so the card is still mounted while it animates:

- Add a "removing" state per card: a module-level `removingShowIds$` (Legend observable) or a
  React Query-free `Set` in a small store, e.g. `src/store/store-removing.ts`.
- `DeleteShowButton` (list version, `src/components/shows/savedshows/DeleteShowButton.tsx`):
  after confirmation, mark the id as removing instead of calling `removeShow` immediately.
- `AnimatedShowItem`: when its id is removing, run a Reanimated animation on a shared value
  (e.g. `withTiming` opacity 1→0 + scale 1→0.8, ~220 ms) and in the completion callback
  `runOnJS(removeShow)(showId)`.
- `removeShow` (`src/data/actions.savedShows.ts`) stays as is: optimistic `setQueriesData`
  on `dbKeys.showLists()`, then `deleteShow`, `refreshQueries()`, `reTagSearch()`.
- Clear the id from the removing set after `removeShow`.
- Keep the detail-screen delete (`src/components/common/headerButtons/DeleteShowButton.tsx`)
  calling `removeShow` directly (it navigates away).

Optional polish (only if the jump looks bad): animate neighbour cards by giving each card a
short `entering={FadeIn.duration(150)}` so cards moving into a new slot fade rather than snap.
With `recycleItems={false}`, moved cards keep their component, so check this doesn't re-fire.

### 3. Edge cases

- Deleting while a name search with `ignoreOtherFilters` is active: list may become empty —
  empty state must still render.
- Rapid double delete: ignore taps on a card already in the removing set.
- Search tab results (`reTagSearch`) update after `removeShow`; no change needed.
- Unmount mid-animation (navigating away): call `removeShow` in the card's cleanup if the id
  is still in the removing set, so the delete is never lost.

## Measuring

The app does not attach to the argent JS debugger on this simulator (a different dev-client
app owns the CDP target), so timing was captured by temporarily writing marks into the app's
SQLite `app_meta` table (`key = 'perf'`) and reading them with `sqlite3` from the simulator's
`Documents/SQLite/001.db`. Mark: button press, confirmation, after each `removeShow` step,
and in `useEffect`s on the urgent and deferred list arrays in `ShowsContainer`. Remove the
instrumentation afterwards.

To test a delete without losing data: snapshot the show's rows first
(`.mode insert <table>` for `shows`, `show_tags`, `show_genres`, `show_watch_providers`,
`season_summaries`, `episode_states`, `notification_history`), delete in the app, then replay
the inserts with `PRAGMA foreign_keys=ON` and restart the app.

## Done when

- Delete on the home grid: card animates out and is gone within ~250 ms of confirming.
- No remount of other cards (verify with timing or React profiler).
- Scrolling, the pull-down name search, swiping a card to its second page, and the empty
  state all work as before.
- `npm test`, `npx tsc --noEmit`, `npm run lint` show no new errors.
