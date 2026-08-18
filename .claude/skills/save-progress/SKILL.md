---
name: save-progress
description: Add or extend localStorage-based save/resume for the interactive story — current scene, story beat, score, and completed minigames — so players can leave and come back.
---

# save-progress

Persists player progress across sessions so the interactive story can be resumed rather than restarted.

## When invoked

Check whether `src/game/systems/SaveManager.ts` already exists. If not, create it. If it exists, extend it for a new field the user wants persisted (e.g. a new scene's completion flag, a new story chapter's current beat id).

## Design

```ts
export interface SaveData {
    currentScene: string;
    storyBeatId?: string;
    score: number;
    completedMinigames: string[];
}

const SAVE_KEY = 'clarke-chronicles-save';

export function saveProgress(data: SaveData) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

export function loadProgress(): SaveData | null {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) as SaveData : null;
}

export function clearProgress() {
    localStorage.removeItem(SAVE_KEY);
}
```

## Steps

1. Create `SaveManager.ts` as above if missing, extending `SaveData` with whatever fields the user needs tracked (keep it flat and JSON-serializable — no class instances or Phaser objects).
2. Call `saveProgress(...)` at natural checkpoints: on scene transition, on story beat change, on minigame completion — not on every frame or input event.
3. On boot (in `Boot.ts` or `MainMenu.ts`), check `loadProgress()`; if a save exists, offer a "Continue" option that restores `currentScene`/`storyBeatId` and re-applies `score` into the score registry (see `scoring-system` skill) via `addScore`, and a "New Game" option that calls `clearProgress()`.
4. Coordinate with `scoring-system`: `SaveManager` persists the score value but must not become a second source of truth — always read current score from the registry when saving, and write it back into the registry (not a local variable) when loading.

## Guardrails

- Never store secrets, PII, or anything beyond gameplay state in `localStorage`.
- Keep `SaveData` backward-compatible when adding fields — make new fields optional so old saves don't break `loadProgress()`.
