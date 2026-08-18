---
name: scoring-system
description: Add or extend the shared score/progress registry so every scene type (point-and-click, quiz, matching, dialogue) reports points the same way instead of each scene tracking its own score variable.
---

# scoring-system

Owns the single source of truth for player score/progress across all scene types.

## When invoked

First check whether `src/game/systems/ScoreManager.ts` (or equivalent) already exists. If not, this skill creates it. If it exists, this skill extends it for a new use case (e.g. per-scene breakdown, achievements, a new score category).

## Design

Use Phaser's built-in `Game.registry` (a `Phaser.Data.DataManager` shared across all scenes) rather than a hand-rolled singleton or global — it's already scene-safe and Phaser-idiomatic.

Create `src/game/systems/ScoreManager.ts`:

```ts
import { Game } from 'phaser';

const SCORE_KEY = 'score';

export function initScore(game: Game) {
    if (game.registry.get(SCORE_KEY) === undefined) {
        game.registry.set(SCORE_KEY, 0);
    }
}

export function addScore(scene: Phaser.Scene, points: number) {
    const current = scene.game.registry.get(SCORE_KEY) ?? 0;
    scene.game.registry.set(SCORE_KEY, current + points);
}

export function getScore(scene: Phaser.Scene): number {
    return scene.game.registry.get(SCORE_KEY) ?? 0;
}
```

## Steps

1. If `ScoreManager.ts` doesn't exist, create it as above and call `initScore(this.game)` once in `Boot.ts`'s `create()`.
2. Every scene that awards points (quiz answers, matches found, hotspots clicked, story beats with `scoreOnEnter`) must call `addScore(this, points)` — never mutate a local `score` field that other scenes can't see.
3. If the user wants a visible score display, add a small `Phaser.GameObjects.Text` in a scene (or a shared UI overlay scene) that reads `getScore(this)` and listens for `this.game.registry.events.on('changedata-score', ...)` to update live.
4. If the user wants per-category breakdown (e.g. quiz score vs. exploration score), extend with additional keys (`SCORE_KEY_QUIZ`, etc.) rather than overloading one number — ask which categories matter before designing this.

## Guardrails

- Don't introduce a second scoring mechanism (e.g. a module-level `let score = 0`) once `ScoreManager` exists — consolidate call sites onto it instead.
- Score mutations belong in scene logic that owns the event (answer submitted, match found); this skill only owns the storage/read/write API, not gameplay rules.
