---
name: playwright-test
description: Drive and inspect the running Clarke Chronicles game with Playwright (Chromium) — start/reuse the Vite dev server, script scene navigation and clicks, read live game state via window.game, and take screenshots. Use whenever a task needs to verify a change actually works in the game, not just that it compiles.
---

# playwright-test

Lets an agent test the game the way a player would — load it in a real
browser, click through scenes, and inspect state — without ever running a
production build. The Vite dev server has HMR, so once it's running, code
edits show up on the next `page.goto()`/`page.reload()` with no rebuild step.

## When invoked

Use this any time you need to confirm a change works in-game: a new scene
transitions correctly, a quiz/matching interaction fires the right callback,
score updates, an asset loads, layout looks right, etc. Don't rely on
TypeScript compiling or the dev server returning 200 as proof the feature
works — actually drive it.

## One-time setup (skip if already done)

- `window.game` must be exposed in dev mode. Check `src/game/main.ts` for:
  ```ts
  if (import.meta.env.DEV) {
      (window as any).game = game;
  }
  ```
  If missing, add it right after `const game = new Game({ ...config, parent });`
  and before the `return game;`.
- Playwright must be installed: check for `@playwright/test` in
  `package.json` devDependencies. If absent:
  ```
  npm i -D @playwright/test
  npx playwright install chromium
  ```

## Steps

1. **Ensure the dev server is running** on port 8080 (see `vite/config.dev.mjs`
   for the port). Check with a quick request:
   ```
   curl -s -o /dev/null -w "%{http_code}" http://localhost:8080
   ```
   If it's not a `200`, start it in the background and leave it running —
   do not stop it after the test, other tasks reuse it:
   ```
   npm run dev-nolog
   ```
2. **Write a small script** under `scripts/` (or reuse/extend
   `scripts/smoke-test.mjs` if it already covers your case) that:
   - Imports `chromium` from `@playwright/test`.
   - Launches, opens a page, `goto('http://localhost:8080')`.
   - Waits for the scene(s) under test (poll `window.game.scene.getScenes(true)`
     rather than a fixed timeout where practical).
   - Drives interaction via real input — `page.mouse.click(x, y)` on canvas
     coordinates, or `page.keyboard.press(...)` — since Phaser renders to
     `<canvas>` and has no DOM to query for game objects.
   - Reads back state through `window.game` via `page.evaluate(...)`, e.g.
     `window.game.scene.getScenes(true).map(s => s.scene.key)`, or registry
     values (`window.game.registry.get('score')`) if the scoring-system skill
     is in use.
   - Takes a screenshot (`page.screenshot({ path: ... })`) when a visual
     check is useful.
   - Always `await browser.close()`.
3. **Run it from the project root** (`node scripts/<name>.mjs`) — Playwright
   is resolved via `node_modules`, so running from outside the project
   directory (e.g. a temp scratch dir) will fail with `ERR_MODULE_NOT_FOUND`.
4. Report what the script actually observed (scenes active, state values,
   screenshot path) — not just that it ran without throwing.

## Guardrails

- Never delete or leave the dev server stopped for the user — it's meant to
  stay up across tasks. Only stop it if the user asks or it's clearly stuck.
- Don't gate the exposure of `window.game` behind anything that could ship
  to production — it must stay inside `import.meta.env.DEV`.
- Prefer polling/waiting on real state (`getScenes(true)`, a specific object
  existing) over arbitrary `waitForTimeout` sleeps, which are flaky.
- Canvas-rendered games have no DOM game objects to query — don't try
  `page.locator()` on in-game elements; use coordinate clicks/keyboard input
  and `window.game` state instead.
- Clean up one-off screenshots/scripts written purely for a single ad-hoc
  check; keep reusable ones (like `scripts/smoke-test.mjs`) in `scripts/`.
