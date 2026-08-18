---
name: new-scene
description: Scaffold a new Phaser scene for Clarke Chronicles (point-and-click, quiz, matching, dialogue/story-beat, or plain), register it in main.ts, and stub its Preloader asset entries.
---

# new-scene

Scaffolds a new scene file under `src/game/scenes/`, registers it with the game, and prepares asset loading for it.

## When invoked

Ask the user (if not already stated):
1. Scene name (PascalCase, e.g. `Kitchen`, `RiverPuzzle`).
2. Scene type: `point-and-click`, `quiz`, `matching`, `dialogue` (story beat), or `plain`.
3. Where in the scene flow it belongs (which scene should transition into it, and which scene it transitions to next).

## Steps

1. Read `src/game/main.ts` to see the current `scene: [...]` array and import list.
2. Create `src/game/scenes/<Name>.ts` extending `Phaser.Scene`, using the template for the chosen type (see below). Match this project's existing style: `import { Scene } from 'phaser';`, constructor calling `super('<Name>')`, no default-export.
3. Add the import and insert the class into the `scene: [...]` array in `main.ts` at the correct position in the flow (not just appended — respect the transition order the user described).
4. In `create()`, wire `this.scene.start('<NextScene>')` at the appropriate trigger (click, correct/incorrect answer, all pairs matched, dialogue end).
5. Add a `preload()` stub that loads placeholder assets under `this.load.setPath('assets')`, with a `// TODO: replace with real art/audio` comment — do not invent asset filenames that don't exist in `public/assets/`.
6. Report the file created, the `main.ts` diff, and the asset keys the user still needs to add.

## Type templates

- **point-and-click**: background image + an array of hotspot zones (`this.add.zone(...).setInteractive()`), each firing a callback (dialogue, scoring, or scene transition). Cursor should change to pointer on hover.
- **quiz**: expects a data file (see the `quiz-builder` skill) with `{ question, choices, correctIndex, points }`; renders question text + choice buttons; on answer, updates score via the scoring registry (see `scoring-system` skill) and advances to next question or scene.
- **matching**: expects a data file (see `matching-game-builder` skill) with image pairs; lays out a grid of cards, flip-on-click, checks pairs, tracks moves/time, reports score on completion.
- **dialogue**: expects a story data file (see `story-writer` skill); renders a portrait/background, a text box, and choice buttons when the current beat has branches; advances through beats and can end by transitioning to another scene.
- **plain**: bare scene matching the existing `Game.ts` shape — camera, background, one interactive element.

## Guardrails

- Never delete or reorder existing scenes in `main.ts` beyond what's needed to insert the new one.
- Don't fabricate asset files — only reference keys the user confirms exist or explicitly asks you to stub.
- Keep scenes focused on presentation/flow; put reusable game data and scoring logic in the shared systems (`scoring-system`, `save-progress`), not duplicated per scene.
