# Season-Long Stable Fantasy (Idea Only — Not Implemented)

This document captures a season-long “Stable” fantasy mode inspired by PGA formats. It is for future consideration and is NOT part of the current MVP scope.

## Goal
Provide always-on engagement by letting users draft and manage a roster (stable) of fighters over a season, scoring whenever their fighters compete.

## Core Rules (Proposed)
- Roster: 10 active fighters + 3 bench + 1 IR slot (injury/inactive)
- Scoring: Use existing per-fight Fantasy Scoring Blueprint; PPV events retain 1.5x team multiplier
- Lineup counting (option): Count best 5 scores per event from roster to smooth divisional activity
- Ownership (MVP): Non-exclusive global player pool (no conflicts); private exclusive drafts later
- Swaps: 6 season “swap tokens” to replace a roster fighter with a free agent (before event lock)
- Emergency Sub: 1 token per season for day-of cancellation/medical issues to swap a bench fighter in
- Season Length: 6 months recommended (alternatively Jan–Dec full year). Open decision.
- Tie-breakers (Season): most wins → most finishes → highest single-event score → earliest roster lock

## Future Enhancements (Phase 2+)
- Private Leagues with snake draft (exclusive ownership)
- Waiver Wire (FAAB or rolling priority) and weekly waiver window
- Division slot requirements (e.g., min coverage across divisions)
- Trades between managers
- Incentives: streak badges, monthly mini-challenges, season awards

## Data/Tech Notes (Non-binding)
- Mode name (if implemented): `stable_roto` (to be confirmed)
- Could reuse existing `fantasy.leagues` and `fantasy.teams` with minimal additions
- Aggregation: season leaderboard sums team totals across season window; same event lock rules apply
- No immediate schema change required for the idea; details to be finalized if prioritized

## Open Questions
- Season window: 6 months vs full year?
- Count “best 5 per event” vs count all roster fighters who fight?
- Swap token count: 4, 6, or 8?
- Should Captains be allowed in this mode (default: no)?

## Status
Deferred. Do not implement until core MVP (weekly salary-cap, PPV multiplier, Captain, One-and-Done) is complete and stable. 