# Visual QA Notes

## Mobile managed preview, 390 × 844

The authenticated home view rendered the full branded shell, generated ingredient image, camera-first hero, Palate Twin summary, and fixed four-tab navigation. The primary control correctly changed to **Calibrate my palate** for the fresh test identity. Text remained legible over the hero image, touch controls were large, and the bottom navigation did not overlap the main call to action.

The first-run onboarding route rendered the intended dark immersive state, progress indicator, two large food-choice controls, enabled/disabled continuation behavior, and a visible back action. The information hierarchy remained intact at phone width.

The text-discovery route rendered its mode switcher, ingredient text area, full-width action, and bottom navigation without horizontal clipping. The route visibly states that uncertainty requires confirmation.

## Initial capture limitation

The first status screenshot rendered the warm canvas and loading state (“Setting the kitchen…”), confirming that the client bundle and visual tokens loaded. It occurred before authentication resolved and was not used as evidence of the signed-in product. A separate My Browser navigation timed out because that browser and the managed sandbox preview are isolated; managed preview captures were used for visual verification instead.

## Final mobile release capture

A second 390 × 844 capture after route splitting verified that lazy-loaded routes render successfully. The home retained the camera-first hierarchy and fixed navigation. The Palate Twin screen rendered the profile identity, explanatory copy, sensory bars, and correct active navigation state. The Chef Knowledge screen rendered its trust boundary, horizontal filters, owner-edit indicator, and knowledge cards without clipping. No final mobile capture showed a blank route, broken asset, overlapping primary action, or horizontal layout failure.

## Food Lens, nutrition goals, and semantic memory release

Final managed 390 × 844 captures verified the Food Lens capture screen and five-tab mobile navigation without horizontal clipping. The capture card, optional context field, sample-meal action, camera target, and selected Lens state remain visible above the fold. The Me route renders the Palate Twin heading, identity card, sensory map, and selected Me state without collision; nutrition targets and daily progress continue below the fold in the same responsive single-column layout.

A stateful browser navigation reached the Manus OAuth screen because that browser session no longer had an authenticated preview session. No login credentials were entered. Functional authenticated verification therefore used the managed screenshot renderer plus the database-backed tRPC integration harness, which exercised the actual protected procedures and live AI path.
