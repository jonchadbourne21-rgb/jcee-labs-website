# WorldLab visual assets

Rust owns the hero's 3D geometry, its static SVG projection, and the shared public theme. React and Canvas 2D display the generated mesh and handle the camera, touch/keyboard input, visibility, and motion preferences. This is an asset pipeline, not a migration of the application server to Rust or a WebAssembly runtime.

The sculpture is an original JCEE WorldLab composition: a titanium J, three elliptical orbital frames, and green nodes. It is decorative, not a simulation or a display of live execution evidence.

## Regenerate

Install a stable Rust toolchain, then run from the repository root:

```sh
pnpm visuals:generate
pnpm visuals:check
```

There are no Rust dependencies. The checked-in outputs are:

- `client/src/generated/worldlab-mesh.json` — indexed vertices, normals, quads, and material IDs.
- `client/public/brand/worldlab-sculpture.svg` — the same geometry projected as a static fallback.
- `client/src/worldlab-cohesion.css` — generated palette and shared public page styling.

Edit `src/main.rs` for geometry and palette values, or `src/theme.css.in` for shared layout and styles. Commit regenerated assets with their sources. `--check` fails if an output differs; CI also checks finite coordinates, normalized normals, valid indices, material coverage, and a fixed face budget. Rust build files stay under `node_modules/.cache/worldlab-rust` so production source verification stays strict.

## Browser behavior

The camera starts facing the J. Slow, bounded motion preserves the silhouette. Drag or arrow keys rotate the model; Reset restores the initial camera. Pause, reduced-motion preferences, offscreen suspension, tab visibility, density limits, and cleanup are preserved. The SVG is available if a drawing context cannot be created. The production site consumes checked-in assets, so the existing publisher does not need Rust installed.

## Verification

`pnpm release:check` includes real touch/mouse/keyboard navigation. The regression sequence blurs the focused link to the document during touch activation, which must not dismiss the menu before the link activates. Escape returns focus to the toggle; outside taps preserve the clicked control's behavior. A known keyboard focus destination outside the menu closes it without stealing focus.

`node scripts/worldlab-surface-check.mjs` covers all registered public routes at three widths. Admin screens are outside the public theme. Existing publication text, research boundaries, and service form behavior remain authoritative.
