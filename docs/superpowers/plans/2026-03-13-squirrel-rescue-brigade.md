# Squirrel Rescue Brigade Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a portfolio-ready landscape arcade game page for Squirrel Rescue Brigade and integrate it into the existing portfolio projects list.

**Architecture:** Keep the page as a static project detail page under `projects/` with Canvas-based gameplay, DOM-driven framing sections, and a small set of responsibility-focused vanilla JS modules attached to one shared namespace. Use a browser-run rules harness for TDD of pure logic, then wire the tested rules into the canvas session controller and HUD.

**Tech Stack:** HTML5, CSS3, Canvas API, Vanilla JavaScript, LocalStorage, existing portfolio shell assets (`script.js`, shared project card styles)

---

## Context Notes

- Source spec: `docs/superpowers/specs/2026-03-12-squirrel-rescue-arcade-design.md`
- Current workspace already has unrelated edits in `projects/live-translation/index.html` and `projects/live-translation/live-translation.js`. Do not revert or stage those files while executing this plan.
- This repository does not currently have Node, Python, or a CLI JS test runner available in the local environment. Use browser-openable harness pages for TDD of pure game rules and manual browser verification for rendering and interaction checks.

## File Structure

### Create

- `projects/squirrel-rescue/index.html`
  - Project hero, playable game shell, overlays, and portfolio explanation sections.
- `projects/squirrel-rescue/squirrel-rescue.css`
  - Page styling, HUD, responsive layout, orientation warning, and feedback animation classes.
- `projects/squirrel-rescue/squirrel-rescue.js`
  - Boot file that wires the DOM, shared namespace modules, and page lifecycle.
- `projects/squirrel-rescue/modules/config.js`
  - Constants for lane count, lives, timing windows, score values, wave cadence, and power-up durations.
- `projects/squirrel-rescue/modules/storage.js`
  - Best-score persistence with graceful fallback when storage is unavailable.
- `projects/squirrel-rescue/modules/input-controller.js`
  - Keyboard and drag input normalization into the shared 5-lane target model.
- `projects/squirrel-rescue/modules/rules-engine.js`
  - Pure state transition helpers for catch, rescue, miss, combo, wave, and power-up logic.
- `projects/squirrel-rescue/modules/entity-manager.js`
  - Runtime world state for rescue team position, active squirrel, ambulance target, and particles.
- `projects/squirrel-rescue/modules/session-controller.js`
  - Main loop, spawn cadence, pause/resume, state transitions, and glue between rules and renderer.
- `projects/squirrel-rescue/modules/renderer.js`
  - Canvas drawing and DOM HUD sync.
- `projects/squirrel-rescue/modules/wave-manager.js`
  - Wave objective rotation, cooldowns, and reward selection.
- `projects/squirrel-rescue/modules/feedback.js`
  - Sound toggle, screen shake, pop text, and visual event helpers.
- `projects/squirrel-rescue/tests/rules-harness.html`
  - Browser-openable harness page that shows pass/fail output for pure logic.
- `projects/squirrel-rescue/tests/rules-harness.js`
  - Assertion helpers and explicit rule/input/wave test cases.

### Modify

- `projects/index.html`
  - Add the new game project card and link it to the new detail page.

## Verification Conventions

- Use `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/index.html"` to open the playable page in the default browser.
- Use `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/tests/rules-harness.html"` to open the browser harness.
- A failing harness run should show at least one red failure line in the browser.
- A passing harness run should show an all-green summary such as `All tests passed`.
- Every task ends with a focused commit that stages only the files listed in that task.

## Chunk 1: Page Shell And Project Entry

### Task 1: Scaffold the project page shell

**Files:**
- Create: `projects/squirrel-rescue/index.html`
- Create: `projects/squirrel-rescue/squirrel-rescue.css`
- Create: `projects/squirrel-rescue/squirrel-rescue.js`

- [ ] **Step 1: Create the static page shell**

```html
<main class="rescue-page">
  <section class="rescue-hero">
    <h1>Squirrel Rescue Brigade</h1>
    <p>Catch each squirrel three times and load it into the ambulance before the fifth miss.</p>
  </section>
  <section class="rescue-stage-section">
    <div class="hud"><span id="scoreValue">0</span><span id="livesValue">5</span><span id="waveValue">Warm Up</span></div>
    <canvas id="rescueCanvas" width="960" height="540"></canvas>
    <div class="overlay active" id="introOverlay"><button id="startRunBtn" type="button">Start Rescue</button></div>
    <div class="overlay" id="gameOverOverlay"><button id="retryBtn" type="button">Play Again</button></div>
  </section>
  <section class="rescue-notes">
    <h2>Portfolio Positioning</h2>
    <p>Explain the arcade reinterpretation, control design, and polish goals below the game.</p>
  </section>
</main>
<script src="../../script.js"></script>
<script src="./modules/config.js"></script>
<script src="./squirrel-rescue.js"></script>
```

- [ ] **Step 2: Open the page shell and verify the structure**

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/index.html"`
Expected: the browser shows a hero section, an empty game frame, and no missing-file browser warnings.

- [ ] **Step 3: Add the base layout and landscape-first styling**

```css
.rescue-page { min-height: 100vh; }
.rescue-stage-section { display: grid; gap: 24px; }
.hud { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); }
.orientation-guard { display: none; }
@media (orientation: portrait) and (max-width: 900px) {
  .orientation-guard { display: flex; }
}
```

- [ ] **Step 4: Refresh and verify landscape and narrow-width behavior**

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/index.html"`
Expected: the main page still reads well on desktop width, and the orientation guard is ready to display on portrait-sized layouts.

- [ ] **Step 5: Commit the shell scaffold**

```bash
git -c safe.directory=C:/Workspace/ksj-pf add projects/squirrel-rescue/index.html projects/squirrel-rescue/squirrel-rescue.css projects/squirrel-rescue/squirrel-rescue.js
git -c safe.directory=C:/Workspace/ksj-pf commit -m "feat: scaffold squirrel rescue project page"
```

### Task 2: Add the project entry to the portfolio list

**Files:**
- Modify: `projects/index.html`

- [ ] **Step 1: Add the new project card near the other arcade/demo work**

```html
<div class="project-card glass-card">
  <div class="project-content">
    <div class="project-header">
      <span class="project-category">Game / Arcade</span>
      <div class="project-links">
        <a href="squirrel-rescue/index.html" target="_blank" class="project-link" title="Live Demo"><span class="sr-only">Open demo</span><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"></svg></a>
      </div>
    </div>
    <h3 class="project-title">Squirrel Rescue Brigade <span class="badge">Canvas Arcade</span></h3>
    <p class="project-desc">A modern cartoon reinterpretation of a classic rescue loop for mobile and desktop.</p>
  </div>
</div>
```

- [ ] **Step 2: Verify the project is discoverable from the list page**

Run: `Start-Process "C:/Workspace/ksj-pf/projects/index.html"`
Expected: the new card appears, the copy is readable, and the demo link points to `projects/squirrel-rescue/index.html`.

- [ ] **Step 3: Commit the portfolio entry**

```bash
git -c safe.directory=C:/Workspace/ksj-pf add projects/index.html
git -c safe.directory=C:/Workspace/ksj-pf commit -m "feat: add squirrel rescue project card"
```

### Task 3: Create the rules harness and base game namespace

**Files:**
- Create: `projects/squirrel-rescue/modules/config.js`
- Create: `projects/squirrel-rescue/modules/storage.js`
- Create: `projects/squirrel-rescue/modules/rules-engine.js`
- Create: `projects/squirrel-rescue/tests/rules-harness.html`
- Create: `projects/squirrel-rescue/tests/rules-harness.js`
- Modify: `projects/squirrel-rescue/index.html`
- Modify: `projects/squirrel-rescue/squirrel-rescue.js`

- [ ] **Step 1: Write the first failing browser-harness assertions**

```js
assertEqual(window.SquirrelRescueRules.createRunState().lives, 5, "run starts with 5 lives");
assertEqual(window.SquirrelRescueRules.resolveMiss({ lives: 5, combo: 3 }).lives, 4, "miss drops one life");
assertEqual(window.SquirrelRescueRules.resolveMiss({ lives: 5, combo: 3 }).combo, 1, "miss resets combo");
```

- [ ] **Step 2: Open the harness and confirm it fails before implementation**

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/tests/rules-harness.html"`
Expected: the browser shows failures because `window.SquirrelRescueRules` is not fully implemented yet.

- [ ] **Step 3: Implement the minimal shared namespace, config, storage, and rules helpers, then load them from the page and harness**

```js
window.SquirrelRescue = window.SquirrelRescue || {};
window.SquirrelRescueConfig = { laneCount: 5, startingLives: 5 };
window.SquirrelRescueRules = {
  createRunState() {
    return { lives: window.SquirrelRescueConfig.startingLives, combo: 1, score: 0, rescueStage: 0 };
  },
  resolveMiss(state) {
    return { ...state, lives: Math.max(0, state.lives - 1), combo: 1, rescueStage: 0 };
  }
};
```

- [ ] **Step 4: Reload the harness and verify the first tests pass**

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/tests/rules-harness.html"`
Expected: the browser shows `All tests passed` for the initial state and miss logic.

- [ ] **Step 5: Commit the harness baseline**

```bash
git -c safe.directory=C:/Workspace/ksj-pf add projects/squirrel-rescue/index.html projects/squirrel-rescue/modules/config.js projects/squirrel-rescue/modules/storage.js projects/squirrel-rescue/modules/rules-engine.js projects/squirrel-rescue/tests/rules-harness.html projects/squirrel-rescue/tests/rules-harness.js projects/squirrel-rescue/squirrel-rescue.js
git -c safe.directory=C:/Workspace/ksj-pf commit -m "feat: add squirrel rescue rules harness"
```

## Chunk 2: Core Play Loop

### Task 4: Add the 5-lane input model

**Files:**
- Create: `projects/squirrel-rescue/modules/input-controller.js`
- Modify: `projects/squirrel-rescue/index.html`
- Modify: `projects/squirrel-rescue/modules/config.js`
- Modify: `projects/squirrel-rescue/tests/rules-harness.html`
- Modify: `projects/squirrel-rescue/tests/rules-harness.js`
- Modify: `projects/squirrel-rescue/squirrel-rescue.js`

- [ ] **Step 1: Add failing tests for lane clamping and keyboard movement**

```js
assertEqual(window.SquirrelRescueInput.moveLaneByStep(2, 1, 5), 3, "right arrow moves one lane");
assertEqual(window.SquirrelRescueInput.moveLaneByStep(0, -1, 5), 0, "lane clamps at zero");
assertEqual(window.SquirrelRescueInput.pointerToLane(0.92, 5), 4, "pointer maps to final lane");
```

- [ ] **Step 2: Open the harness and confirm the new input tests fail**

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/tests/rules-harness.html"`
Expected: the new lane tests fail because `window.SquirrelRescueInput` is missing.

- [ ] **Step 3: Implement the input controller and load it from both the page and the harness**

```js
window.SquirrelRescueInput = {
  moveLaneByStep(currentLane, delta, laneCount) {
    return Math.max(0, Math.min(laneCount - 1, currentLane + delta));
  },
  pointerToLane(normalizedX, laneCount) {
    return Math.max(0, Math.min(laneCount - 1, Math.round(normalizedX * (laneCount - 1))));
  }
};
```

- [ ] **Step 4: Verify both the harness and the page-level movement placeholder**

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/tests/rules-harness.html"`
Expected: the lane tests pass.

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/index.html"`
Expected: left/right keys move the rescue marker one lane at a time and drag input updates the target lane smoothly.

- [ ] **Step 5: Commit the input model**

```bash
git -c safe.directory=C:/Workspace/ksj-pf add projects/squirrel-rescue/index.html projects/squirrel-rescue/modules/input-controller.js projects/squirrel-rescue/modules/config.js projects/squirrel-rescue/tests/rules-harness.html projects/squirrel-rescue/tests/rules-harness.js projects/squirrel-rescue/squirrel-rescue.js
git -c safe.directory=C:/Workspace/ksj-pf commit -m "feat: add squirrel rescue lane controls"
```

### Task 5: Implement rescue progression, miss handling, and run state

**Files:**
- Create: `projects/squirrel-rescue/modules/entity-manager.js`
- Create: `projects/squirrel-rescue/modules/session-controller.js`
- Modify: `projects/squirrel-rescue/index.html`
- Modify: `projects/squirrel-rescue/modules/rules-engine.js`
- Modify: `projects/squirrel-rescue/tests/rules-harness.js`
- Modify: `projects/squirrel-rescue/squirrel-rescue.js`

- [ ] **Step 1: Add failing tests for the 3-catch rescue sequence**

```js
const run = window.SquirrelRescueRules.createRunState();
const afterCatch1 = window.SquirrelRescueRules.resolveCatch(run);
const afterCatch2 = window.SquirrelRescueRules.resolveCatch(afterCatch1);
const afterCatch3 = window.SquirrelRescueRules.resolveCatch(afterCatch2);
assertEqual(afterCatch1.rescueStage, 1, "first catch moves to stage 1");
assertEqual(afterCatch2.rescueStage, 2, "second catch moves to stage 2");
assertEqual(afterCatch3.rescueStage, 0, "third catch resets stage after rescue");
assertEqual(afterCatch3.rescuedCount, 1, "third catch increments rescued count");
```

- [ ] **Step 2: Open the harness and verify the rescue tests fail first**

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/tests/rules-harness.html"`
Expected: the browser shows failures for rescue progression and rescued count.

- [ ] **Step 3: Implement the minimal rules and session loop glue, then load the new runtime scripts from the page**

```js
resolveCatch(state) {
  const nextStage = state.rescueStage + 1;
  if (nextStage >= 3) {
    return {
      ...state,
      rescueStage: 0,
      rescuedCount: state.rescuedCount + 1,
      combo: state.combo + 1,
      score: state.score + (100 * state.combo)
    };
  }
  return { ...state, rescueStage: nextStage };
}
```

- [ ] **Step 4: Verify the harness and a playable page loop**

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/tests/rules-harness.html"`
Expected: rescue progression tests pass.

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/index.html"`
Expected: a falling squirrel advances across three catches, missed squirrels remove one life, and the game reaches game over after the fifth miss.

- [ ] **Step 5: Commit the core run-state implementation**

```bash
git -c safe.directory=C:/Workspace/ksj-pf add projects/squirrel-rescue/index.html projects/squirrel-rescue/modules/entity-manager.js projects/squirrel-rescue/modules/session-controller.js projects/squirrel-rescue/modules/rules-engine.js projects/squirrel-rescue/tests/rules-harness.js projects/squirrel-rescue/squirrel-rescue.js
git -c safe.directory=C:/Workspace/ksj-pf commit -m "feat: implement squirrel rescue core loop"
```

### Task 6: Render the world and sync the HUD

**Files:**
- Create: `projects/squirrel-rescue/modules/renderer.js`
- Modify: `projects/squirrel-rescue/index.html`
- Modify: `projects/squirrel-rescue/squirrel-rescue.css`
- Modify: `projects/squirrel-rescue/modules/session-controller.js`
- Modify: `projects/squirrel-rescue/tests/rules-harness.js`
- Modify: `projects/squirrel-rescue/squirrel-rescue.js`

- [ ] **Step 1: Add a failing smoke test for HUD snapshot helpers**

```js
const snapshot = window.SquirrelRescueRules.buildHudSnapshot({ score: 240, lives: 3, rescuedCount: 2, combo: 4 });
assertEqual(snapshot.scoreLabel, "240", "HUD score label formats value");
assertEqual(snapshot.livesLabel, "3", "HUD lives label formats value");
```

- [ ] **Step 2: Confirm the HUD helper tests fail before implementation**

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/tests/rules-harness.html"`
Expected: the browser shows failures because `buildHudSnapshot` is not defined yet.

- [ ] **Step 3: Implement the renderer and HUD presenter**

```js
window.SquirrelRescueRules.buildHudSnapshot = function buildHudSnapshot(state) {
  return {
    scoreLabel: String(state.score),
    livesLabel: String(state.lives),
    rescuedLabel: String(state.rescuedCount),
    comboLabel: `x${state.combo}`
  };
};
```

- [ ] **Step 4: Verify the game is visually readable**

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/tests/rules-harness.html"`
Expected: the HUD helper smoke tests pass.

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/index.html"`
Expected: the building, bounce arcs, ambulance lane, HUD values, intro overlay, and game-over overlay all render cleanly.

- [ ] **Step 5: Commit the renderer and HUD work**

```bash
git -c safe.directory=C:/Workspace/ksj-pf add projects/squirrel-rescue/modules/renderer.js projects/squirrel-rescue/index.html projects/squirrel-rescue/squirrel-rescue.css projects/squirrel-rescue/modules/session-controller.js projects/squirrel-rescue/tests/rules-harness.js projects/squirrel-rescue/squirrel-rescue.js
git -c safe.directory=C:/Workspace/ksj-pf commit -m "feat: render squirrel rescue playfield"
```

## Chunk 3: Systems, Feedback, And Ship Readiness

### Task 7: Add wave goals and power-up rewards

**Files:**
- Create: `projects/squirrel-rescue/modules/wave-manager.js`
- Modify: `projects/squirrel-rescue/modules/config.js`
- Modify: `projects/squirrel-rescue/modules/rules-engine.js`
- Modify: `projects/squirrel-rescue/modules/session-controller.js`
- Modify: `projects/squirrel-rescue/tests/rules-harness.html`
- Modify: `projects/squirrel-rescue/tests/rules-harness.js`
- Modify: `projects/squirrel-rescue/index.html`

- [ ] **Step 1: Write failing tests for one-active-wave and timed power-up expiry**

```js
const waveState = window.SquirrelRescueRules.createWaveState();
const activated = window.SquirrelRescueRules.activatePowerUp({ ...waveState }, "wide-trampoline", 8000);
const expired = window.SquirrelRescueRules.tickPowerUp({ ...activated, powerUpRemainingMs: 0 }, 16);
assertEqual(activated.activePowerUp, "wide-trampoline", "power-up activates immediately");
assertEqual(expired.activePowerUp, null, "expired power-up clears itself");
```

- [ ] **Step 2: Open the harness and verify the new wave tests fail**

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/tests/rules-harness.html"`
Expected: wave and power-up assertions fail because the helpers do not exist yet.

- [ ] **Step 3: Implement wave rotation and reward activation, then load the wave manager in the page and harness**

```js
window.SquirrelRescueRules.createWaveState = function createWaveState() {
  return { activeWave: null, waveCooldownMs: 0, activePowerUp: null, powerUpRemainingMs: 0 };
};
```

- [ ] **Step 4: Verify waves and rewards in the browser**

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/tests/rules-harness.html"`
Expected: wave and power-up tests pass.

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/index.html"`
Expected: only one wave goal appears at a time, successful waves trigger one active power-up, and the timer expires back to normal rules.

- [ ] **Step 5: Commit the systems layer**

```bash
git -c safe.directory=C:/Workspace/ksj-pf add projects/squirrel-rescue/modules/wave-manager.js projects/squirrel-rescue/modules/config.js projects/squirrel-rescue/modules/rules-engine.js projects/squirrel-rescue/modules/session-controller.js projects/squirrel-rescue/tests/rules-harness.html projects/squirrel-rescue/tests/rules-harness.js projects/squirrel-rescue/index.html
git -c safe.directory=C:/Workspace/ksj-pf commit -m "feat: add squirrel rescue waves and power-ups"
```

### Task 8: Add persistence, pause safety, orientation handling, and feedback polish

**Files:**
- Create: `projects/squirrel-rescue/modules/feedback.js`
- Modify: `projects/squirrel-rescue/modules/storage.js`
- Modify: `projects/squirrel-rescue/modules/session-controller.js`
- Modify: `projects/squirrel-rescue/modules/renderer.js`
- Modify: `projects/squirrel-rescue/squirrel-rescue.css`
- Modify: `projects/squirrel-rescue/index.html`
- Modify: `projects/squirrel-rescue/tests/rules-harness.js`

- [ ] **Step 1: Add failing tests for storage fallback**

```js
const fallback = window.SquirrelRescueStorage.readBestScore(() => { throw new Error("storage blocked"); });
assertEqual(fallback.bestScore, 0, "storage fallback returns zero best score");
```

- [ ] **Step 2: Open the harness and confirm the fallback test fails first**

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/tests/rules-harness.html"`
Expected: the browser shows a storage fallback failure because the helper is not implemented yet.

- [ ] **Step 3: Implement storage guards and UX resilience hooks**

```js
window.SquirrelRescueStorage = {
  readBestScore(reader = () => window.localStorage.getItem("squirrel-rescue-best")) {
    try {
      return JSON.parse(reader()) || { bestScore: 0 };
    } catch {
      return { bestScore: 0 };
    }
  }
};
```

- [ ] **Step 4: Verify resilience and feedback behavior in the page**

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/tests/rules-harness.html"`
Expected: storage fallback passes.

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/index.html"`
Expected: blur pauses the run, portrait view shows the rotation prompt, sound can be toggled, best score survives refresh when storage is available, and the page still works if storage is blocked.

- [ ] **Step 5: Commit the resilience pass**

```bash
git -c safe.directory=C:/Workspace/ksj-pf add projects/squirrel-rescue/modules/feedback.js projects/squirrel-rescue/modules/storage.js projects/squirrel-rescue/modules/session-controller.js projects/squirrel-rescue/modules/renderer.js projects/squirrel-rescue/squirrel-rescue.css projects/squirrel-rescue/index.html projects/squirrel-rescue/tests/rules-harness.js
git -c safe.directory=C:/Workspace/ksj-pf commit -m "feat: polish squirrel rescue feedback and resilience"
```

### Task 9: Final regression and portfolio ship pass

**Files:**
- Modify: `projects/index.html`
- Modify: `projects/squirrel-rescue/index.html`
- Modify: `projects/squirrel-rescue/squirrel-rescue.css`
- Modify: `projects/squirrel-rescue/squirrel-rescue.js`
- Modify: `projects/squirrel-rescue/modules/config.js` if regression shows tuning issues
- Modify: `projects/squirrel-rescue/modules/storage.js` if persistence fails
- Modify: `projects/squirrel-rescue/modules/input-controller.js` if lane input fails
- Modify: `projects/squirrel-rescue/modules/rules-engine.js` if rescue, combo, wave, or power-up logic fails
- Modify: `projects/squirrel-rescue/modules/entity-manager.js` if world state ownership fails
- Modify: `projects/squirrel-rescue/modules/session-controller.js` if pause, restart, or spawn timing fails
- Modify: `projects/squirrel-rescue/modules/renderer.js` if canvas or HUD rendering fails
- Modify: `projects/squirrel-rescue/modules/wave-manager.js` if objective cadence fails
- Modify: `projects/squirrel-rescue/modules/feedback.js` if sound, shake, or pop feedback fails

- [ ] **Step 1: Run the full manual regression checklist from the spec**

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/tests/rules-harness.html"`
Expected: all harness checks are green.

Run: `Start-Process "C:/Workspace/ksj-pf/projects/squirrel-rescue/index.html"`
Expected: desktop controls, drag controls, three-catch rescues, five-life game over, wave rewards, pause, restart, and best-score persistence all work.

- [ ] **Step 2: Verify the portfolio entry opens the game page cleanly**

Run: `Start-Process "C:/Workspace/ksj-pf/projects/index.html"`
Expected: the card copy is polished and the new demo link opens the correct project page.

- [ ] **Step 3: Apply only the minimal fixes in the file that owns each failed behavior**

```text
If lane movement fails, update projects/squirrel-rescue/modules/input-controller.js.
If rescue math, combo, or lives fail, update projects/squirrel-rescue/modules/rules-engine.js.
If pause, restart, or spawn cadence fails, update projects/squirrel-rescue/modules/session-controller.js.
If HUD or canvas drawing fails, update projects/squirrel-rescue/modules/renderer.js.
If project-card copy or link fails, update projects/index.html.
```

- [ ] **Step 4: Review the final diff before shipping**

Run: `git -c safe.directory=C:/Workspace/ksj-pf status --short`
Expected: only the new squirrel-rescue files and the intentional `projects/index.html` update appear, alongside the pre-existing unrelated live-translation edits that must stay untouched.

- [ ] **Step 5: Commit the ship-ready pass**

```bash
git -c safe.directory=C:/Workspace/ksj-pf add projects/index.html projects/squirrel-rescue
git -c safe.directory=C:/Workspace/ksj-pf commit -m "feat: ship squirrel rescue arcade portfolio demo"
```




