---
name: asset-pipeline
description: Bring new art (cartoon-style backgrounds/sprites) and audio (narration/SFX) into public/assets with consistent naming, and register the load calls in the right Preloader/Boot scene.
---

# asset-pipeline

Standardizes how new art and audio get into the game so asset keys stay predictable across scenes and data files.

## When invoked

Determine: what's being added (image, spritesheet, audio narration line, SFX, music), for which scene/story beat, and whether it's needed before the Preloader bar shows (→ `Boot.ts`) or after (→ `Preloader.ts`, the common case).

## Conventions

- Place files under `public/assets/`, organized by kind: `public/assets/images/`, `public/assets/audio/`, `public/assets/spritesheets/` — check existing structure first and follow it if subfolders already exist; don't invent a new layout if one is established.
- Asset keys (the string used in `this.load.image('key', ...)`) are kebab-case and describe content, not the scene: `kitchen-bg`, `narrator-intro-01`, `card-apple`. Scene-specific prefixes are fine when a key would otherwise collide.
- Audio: narration lines get one file per line (matches the `story-writer` beat-level `audio` field), not one long combined track — this keeps beats independently replayable/skippable.

## Steps

1. Confirm the asset file already exists at the target path (or ask the user to provide/drop it there) — never fabricate placeholder binary assets.
2. Add the `this.load.image(...)` / `this.load.audio(...)` / `this.load.spritesheet(...)` call in `Preloader.ts`'s `preload()` (or `Boot.ts` if it must load before the progress bar renders), using `this.load.setPath('assets')` relative paths consistent with existing calls.
3. If the asset is referenced from a data file (story beat, quiz question, matching pair), confirm the key matches exactly what's registered in Preloader — mismatched keys fail silently at runtime with a console warning only.
4. Report every new asset key added and where it's loaded, so data-authoring skills (`story-writer`, `quiz-builder`, `matching-game-builder`) can reference them correctly.

## Guardrails

- Don't load large assets in `Boot.ts` — it has no progress bar; keep it to the logo/background needed to render the Preloader itself.
- Don't duplicate an asset under two different keys — search existing `this.load.*` calls first to avoid re-registering.
