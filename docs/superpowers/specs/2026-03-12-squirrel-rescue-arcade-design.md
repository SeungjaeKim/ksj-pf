# Squirrel Rescue Arcade Design

Date: 2026-03-12
Status: Approved for planning
Working title: Squirrel Rescue Brigade

## 1. Product Summary

This project is a portfolio-ready arcade game inspired by classic rescue games, but reinterpreted as a bright cartoon mobile-friendly experience. A burning building sits on the left side of the screen. Squirrels fall from the building, and the player controls a two-animal rescue team holding a trampoline near the bottom of the playfield. The player must catch each squirrel multiple times and guide it across the screen until it lands safely in the ambulance on the right.

The experience should feel immediately readable, playful, and polished in a short session. It needs to work as a portfolio project that demonstrates game design thinking, input design across devices, real-time rendering, and production-minded UI packaging in one self-contained demo page.

## 2. Goals

### Primary goals

- Deliver a landscape-first arcade game that feels good on both mobile and desktop.
- Preserve the simple rescue fantasy of a classic trampoline rescue loop while presenting an original theme, layout, and visual style.
- Make the project strong as a portfolio piece, not just as a playable prototype.
- Keep the first release scoped enough to finish with high polish.

### Non-goals for the first release

- No backend, accounts, cloud saves, or multiplayer.
- No large progression meta, shop, unlock tree, or character upgrades.
- No multiple buildings or radically different stages.
- No deep narrative layer beyond light flavor and presentation.

## 3. Experience Principles

- Fast to understand: the player should know what to do within a few seconds.
- High feedback: every catch, bounce, miss, combo, and rescue should feel visible and satisfying.
- Friendly tone: bright cartoon art and cute reactions instead of harsh failure presentation.
- Short-session strong: even one 60 to 120 second run should feel complete enough for portfolio reviewers.
- Clear fairness: input, lanes, hit windows, and failure rules must always feel learnable and consistent.

## 4. Core Game Loop

The game runs as an endless arcade session with light wave objectives layered on top.

1. A squirrel drops from the left building.
2. The player moves the rescue team and trampoline to catch it.
3. Each successful catch advances that squirrel one rescue stage farther to the right.
4. After the final successful bounce, the squirrel lands in the ambulance and counts as rescued.
5. The game immediately introduces the next squirrel, with difficulty gradually increasing over time.
6. Short wave goals appear during play and grant bonus rewards or temporary power-ups when completed.
7. Missing a squirrel costs one life.
8. The run ends when all 5 lives are lost.

### Rescue progression per squirrel

Standard squirrels require 3 successful catches:

- Catch 1: building drop to first bounce.
- Catch 2: middle-air continuation toward the ambulance side.
- Catch 3: final bounce into the ambulance.

If the player misses the squirrel at any step, that squirrel is lost, one life is removed, combo is broken, and a new squirrel enters after a short reset beat.

## 5. Platforms And Controls

The game is landscape-first.

### Mobile

- The player drags the rescue team horizontally.
- Motion should feel smooth and direct under the finger.
- Logic should still resolve against a fixed set of catch zones so the game remains fair and readable.

### Desktop

- Left and right arrow keys move the rescue team one lane at a time.
- Each key press shifts to the adjacent catch lane.
- This preserves arcade clarity and gives desktop players precise movement.

### Shared control rule

Use 5 catch lanes across the lower playfield. The visual movement can interpolate smoothly, but the actual rescue logic uses those stable catch lanes. This allows mobile to feel fluid while desktop remains discrete and predictable.

## 6. Screen Layout

The layout is built around a single wide playfield:

- Left: burning building and squirrel spawn points.
- Center: bounce path and active rescue space.
- Right: ambulance intake zone and rescue endpoint.
- Bottom: the rescue team and trampoline.
- Top HUD: score, rescued count, remaining lives, active wave goal, and active power-up timer.

The project page should use the same portfolio pattern as other featured projects in this repository:

- Intro hero section explaining the concept and project positioning.
- Immediately playable game area in the middle of the page.
- Supporting sections below that explain the design logic, MVP scope, and future expansion.
- A linked project card entry from `projects/index.html` so the game is discoverable from the main portfolio list.

## 7. Art Direction And Feedback

The visual tone is bright, cute, and cartoon-forward.

### Art direction

- Warm fire palette on the left balanced by cheerful rescue colors on characters and UI.
- Exaggerated squash-and-stretch animation on trampoline catches.
- Cute responder characters with readable silhouettes.
- Original presentation that avoids directly copying classic game art or branding.

### Feedback rules

- Catch: bounce stretch, spark trail, upbeat sound cue, quick team reaction.
- Final rescue: ambulance door reaction, brighter burst, score pop, stronger audio cue.
- Miss: soft failure treatment with smoke, surprise reaction, and life loss indicator.
- Wave complete: banner pulse, bonus score burst, and power-up activation highlight.

## 8. Scoring, Lives, And Difficulty

### Lives

- The player starts each run with 5 lives.
- Every missed squirrel removes 1 life.
- The run ends immediately at 0 lives.

### Scoring

- Main score comes from successfully loading a squirrel into the ambulance.
- Consecutive successful rescues increase a combo multiplier.
- Misses break combo.
- Wave completion grants bonus points.

The scoring emphasis should stay on successful full rescues, not on farming partial catches.

### Difficulty ramp

Difficulty rises gradually through:

- Faster spawn pacing.
- Slightly less forgiving timing windows.
- More demanding bounce spacing between rescue stages.
- More frequent wave goals.

The first release should avoid random unfair spikes. Difficulty must feel authored and readable.

## 9. Wave Goals

The game is not stage-based, but it uses short objective bursts to create pacing changes.

Examples:

- Rescue 5 squirrels in 20 seconds.
- Rescue 3 squirrels in a row without a miss.
- Finish 4 rescues while a power-up is active.

Only one wave goal should be active at a time. A new goal can appear after a short cooldown, roughly every 20 to 30 seconds of successful play. Wave goals should be optional bonuses, not hard failure gates. Failing a wave does not cost lives by itself. Success grants score bonuses and may trigger a temporary power-up.

## 10. Power-Ups

The first release uses a small power-up set to add variety without overcomplicating the rules.

### Power-up set

- Wide Trampoline: expands the effective catch width for a short duration.
- Easy Load: enlarges the final ambulance intake window.
- Slow Motion: briefly slows the global game speed.

### Power-up rules

- Only one power-up can be active at a time in the first release.
- Power-ups are granted as rewards from wave completion or strong rescue streaks.
- Power-ups auto-activate when awarded.
- Duration should stay short so they create a rhythm change rather than a second system to manage.

## 11. Game States And Flow

The page should support these high-level states:

- Intro: project framing, controls, start button, and immediate call to play.
- Playing: active run with HUD and live game canvas.
- Paused: triggered by focus loss or manual pause.
- Game over: final score, rescued total, best score, and quick replay.

### Supporting UX rules

- On phones held vertically, show a rotate-to-landscape prompt instead of a broken layout.
- Losing browser focus should auto-pause.
- Restart should be fast and available from both pause and game-over states.

## 12. Technical Architecture

The implementation should remain lightweight and fit the existing static portfolio site, but the game logic should be broken into clear units.

### Delivery shape

- A dedicated project page under `projects/squirrel-rescue/`.
- HTML for the portfolio framing and HUD shell.
- Canvas for active gameplay rendering.
- Vanilla JavaScript with a small module split instead of one oversized script.
- Local storage for best score only.

### Proposed unit boundaries

#### Boot and page shell

Purpose: initialize the project page, wire buttons, show project framing, and connect the DOM HUD to the game session.

Depends on: input adapter, game session controller, HUD renderer.

#### Input adapter

Purpose: normalize mobile drag and desktop keyboard input into a shared target lane model.

Input: pointer events, keyboard events, resize or orientation changes.

Output: current intended lane or movement target.

#### Game session controller

Purpose: own the main run state, game loop timing, pause and restart flow, and state transitions between intro, playing, paused, and game over.

Depends on: rules engine, entity manager, renderer, audio feedback.

#### Entity manager

Purpose: track the rescue team, active squirrel, ambulance zone, particles, and temporary power-up state.

Input: state updates from the game session controller.

Output: world snapshot for rendering and rule evaluation.

#### Rules engine

Purpose: evaluate catches, misses, stage advancement, life loss, combo progression, wave completion, and power-up rewards.

Input: normalized positions, timing windows, active squirrel stage, active objectives.

Output: state mutations and gameplay events such as `catch`, `rescue`, `miss`, `waveComplete`, and `powerUpActivated`.

#### Renderer and HUD presenter

Purpose: draw the world to canvas and update score, lives, wave text, and state overlays in the DOM.

Input: world snapshot and gameplay events.

Output: visible frame and UI feedback.

#### Audio and feedback layer

Purpose: play small reactive sound cues and trigger screen shake, pop text, and particle bursts.

Input: gameplay events from the rules engine and session controller.

Output: audiovisual feedback only. This unit must not own game rules.

## 13. Data Flow

The runtime flow should stay simple:

1. Input adapter captures player intent.
2. Game session controller advances the frame.
3. Entity manager updates positions and active entities.
4. Rules engine evaluates catches, misses, rescue completion, and wave status.
5. Renderer and HUD presenter draw the updated state.
6. Audio and feedback layer reacts to emitted gameplay events.
7. Best score is saved locally when a run ends with a new record.

This separation keeps input, rules, rendering, and page UI independently understandable and easier to plan.

## 14. Error Handling And Resilience

The first release should handle likely portfolio demo failures gracefully.

- If sprite or decorative assets fail to load, the game still runs with simple shape-based rendering.
- If local storage fails, the game still runs without persistent best score.
- If the screen is too small or portrait-oriented, the player sees a clear rotation prompt.
- If the page loses focus, the run pauses instead of silently continuing.
- If audio cannot initialize, gameplay continues without blocking the session.

## 15. Testing And Verification Scope

The project does not need heavy automation for the first release, but it does need a strong manual verification checklist.

### Critical test scenarios

- Mobile drag moves the rescue team reliably without accidental jitter.
- Desktop arrow keys move exactly one lane per input.
- A squirrel requires 3 successful catches to be counted as rescued.
- Missing a squirrel removes exactly 1 life and resets combo.
- Runs end exactly when the fifth miss happens.
- Wave goals trigger correctly and do not punish failure with hidden life loss.
- Each power-up activates, displays, expires, and restores normal rules correctly.
- Pause, resume, restart, and game-over flows work consistently.
- Portrait phones show the rotation prompt.
- Best score persists across reloads when storage is available.

## 16. Portfolio Positioning

This project should present itself as more than "a small web game."

It demonstrates:

- Reinterpretation of a classic arcade mechanic into an original portfolio-ready concept.
- Multi-input UX design across mobile drag and desktop lane controls.
- Real-time canvas gameplay with DOM-based product framing.
- Game feel work through animation, feedback, pacing, and readable rules.
- Product thinking through intro copy, replay flow, and explanatory sections below the demo.

The page should make it easy for recruiters or reviewers to understand both how the game plays and what design decisions were intentional.

## 17. MVP Scope For Planning

The implementation plan should target this first release scope:

- One playable rescue map layout.
- One standard squirrel type.
- Three power-ups.
- Endless run structure with lightweight wave goals.
- Five-life failure rule.
- Mobile and desktop input support.
- Score, combo, best score, and game-over summary.
- Portfolio framing sections on the same page.

Anything beyond that belongs to post-MVP expansion, not the initial plan.

## 18. Post-MVP Expansion Ideas

These ideas are intentionally out of scope for the first plan, but they fit the concept later:

- Additional animal variants with distinct bounce behavior.
- New ambulance styles or weather variants.
- Daily challenge objectives.
- Achievement board or replay highlights.
- Extra map themes beyond the burning building scene.

