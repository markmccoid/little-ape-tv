# Little Ape TV

A personal TV show tracker: the user saves shows from TMDB and tracks what they have watched, downloaded, and liked.

## Shows

**Saved Show**:
A TMDB show the user has added to their library, along with their personal data about it.
_Avoid_: Stored show, local show

**Favorite Show**:
A Saved Show the user has marked as a favorite; remembers when it was favorited.

**User Rating**:
The user's own score for a Saved Show, on a scale set in settings.
_Avoid_: Rating (ambiguous with TMDB rating)

**Tag**:
A user-defined, ordered label that can be attached to any number of Saved Shows.
_Avoid_: User tag, label

**Genre**:
A TMDB-supplied category on a show; not editable by the user.

## Episodes

**Episode State**:
The user's flags on a single episode of a Saved Show: watched, downloaded, favorited.
_Avoid_: Show attributes, episode attributes

**Favorite Episode**:
An episode the user has flagged as a favorite.
_Avoid_: Favorited (rating)

**Season Summary**:
Cached totals for a season or a whole show (episodes, watched, downloaded, favorited) derived from Episode States and TMDB episode counts.

**All Watched**:
A Saved Show whose every episode outside season 0 (specials) is watched.

**Next Download Episode**:
The first episode after the last downloaded one, with its air date; drives "Next DL Date" sorting.

## Filtering

**Filter Criteria**:
The active include/exclude conditions and sort applied to the library list.

**Saved Filter**:
A named, reusable Filter Criteria plus sort.

**Pinned Filter**:
A Saved Filter shown in the sidebar for quick access.
_Avoid_: Favorite filter

**Watch Provider**:
A streaming service (from TMDB) where a show is available.
_Avoid_: Stream provider, streaming provider
