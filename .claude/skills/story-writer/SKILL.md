---
name: story-writer
description: Author or edit branching interactive-story content (dialogue beats, choices, narration audio cues) as data files consumed by a Phaser dialogue/story scene, without hand-coding narrative in TypeScript.
---

# story-writer

Manages the narrative content for Clarke Chronicles as data, separate from scene code, so story edits don't require touching TypeScript.

## When invoked

Determine whether the user wants to:
- **Create** a new story sequence/chapter, or
- **Edit** an existing one (add a beat, add a branch, change dialogue text, add a narration audio cue).

## Data format

Store story data under `src/game/data/story/<chapter-or-scene-name>.ts` (or `.json`, matching whatever the codebase already uses once one file exists — check for precedent first) as an array of beats:

```ts
export interface StoryBeat {
    id: string;
    speaker?: string;          // character name shown in the text box, omit for narration
    text: string;
    audio?: string;            // asset key for narrated voice-over line, played via this.sound
    background?: string;       // asset key, only set when it changes from the previous beat
    portrait?: string;         // asset key for speaker portrait
    choices?: { label: string; next: string }[]; // omit for linear beats
    next?: string;             // id of next beat when there are no choices
    scoreOnEnter?: number;     // optional points awarded when this beat is reached
    onComplete?: { scene: string }; // present only on terminal beats, transitions out
}
```

## Steps

1. Check `src/game/data/story/` for existing files to match established conventions (naming, whether `.ts` or `.json`, field names already in use). If none exist, create the directory and the first file using the format above.
2. Write/edit beats as requested. Every beat except terminal ones needs either `next` or `choices` — never leave a dead end unless it's intentional (flag it if so).
3. Validate the beat graph: every `next` and `choices[].next` id must resolve to a real beat id in the file. Call out any dangling references.
4. If audio narration is referenced, list the asset keys used so they can be checked against `public/assets/` (or handed to the `asset-pipeline` skill).
5. If this is the first story file in the project, also stub a generic `StoryScene` (or point the user to `new-scene` with type `dialogue`) that reads a beat array and renders it — don't duplicate that scaffolding logic here.

## Guardrails

- Keep narrative content data-only — no game logic, scoring rules, or scene-transition mechanics embedded as prose; those belong in the beat's typed fields.
- Don't overwrite existing beats' ids when editing — other beats may reference them via `next`/`choices`.
- Flag (don't silently fix) any branch that never rejoins the main path or never terminates.
