---
name: matching-game-builder
description: Author image-pair data and scaffold/extend the image-matching (memory/pairs) minigame logic — grid layout, flip/reveal, pair detection, move counting, and scoring.
---

# matching-game-builder

Builds the content and logic for image-matching minigames (memory/pairs style).

## When invoked

Clarify:
1. Which matching game/level, and how many pairs?
2. Are all pairs identical-image matches, or "matching" concept pairs (e.g. tool → its use, character → their name)? This changes the data shape.
3. Any move/time limit, or is scoring purely based on moves taken?

## Data format

Store under `src/game/data/matching/<level-name>.ts`:

```ts
export interface MatchPair {
    id: string;
    cardA: string;      // asset key
    cardB: string;       // asset key; same as cardA for identical-image matching
}

export interface MatchLevel {
    pairs: MatchPair[];
    basePoints: number;      // points per correct match
    movePenalty?: number;    // points deducted per incorrect flip pair, if used
    timeLimitSeconds?: number;
}
```

## Steps

1. Check `src/game/data/matching/` for an existing format before introducing a new one.
2. Write the pair data per the format above, using only asset keys the user confirms exist (or flags for the `asset-pipeline` skill to add).
3. If the matching scene doesn't exist yet, use `new-scene` with type `matching` for the boilerplate — this skill owns the pair data, shuffle, flip/reveal, and match-detection logic, not the scene scaffold.
4. Shuffle logic must randomize card positions each playthrough (Fisher-Yates on the doubled pair array).
5. On level completion, report final score through the shared score registry (see `scoring-system`), not a local variable.

## Guardrails

- Always double-check the pair count produces an even grid (or handle an odd leftover explicitly) — don't leave a card without a partner.
- Don't block on a wrong guess forever — always give the player a way to flip cards back and retry within the move/time budget.
