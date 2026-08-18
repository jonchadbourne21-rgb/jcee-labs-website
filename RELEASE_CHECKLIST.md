# JCEE Labs Release Checklist

This checklist is a required release gate for changes that can affect the public site. It keeps automated layout safeguards in the same workflow as TypeScript, unit tests, and the production build.

## Required automated gate

Run the following command from the repository root before publishing:

```bash
pnpm release:check
```

The command performs the TypeScript check, complete Vitest suite, production build, and headless device-profile smoke checks. The browser checks start an isolated production server and enforce all of the following at both target widths:

| Profile | Viewport | Required checks |
|---|---:|---|
| iPhone Safari profile | 390 × 844 | `scrollWidth === innerWidth`, no body overflow, a 40px-or-larger menu control, in-bounds curlicue stage, touch emulation, no runtime errors |
| Android Chrome profile | 412 × 915 | `scrollWidth === innerWidth`, no body overflow, a 40px-or-larger menu control, in-bounds curlicue stage, touch emulation, no runtime errors |

Use a profile-specific command while developing a targeted fix:

```bash
pnpm smoke:mobile:iphone
pnpm smoke:mobile:android
```

> The smoke checks are deterministic browser device-profile emulations. They are a release gate, but they do not replace a final physical-device check on iPhone Safari and Android Chrome for major visual or interaction changes.

## Physical-device confirmation

For a release that changes navigation, mobile layout, animations, gestures, typography, or browser APIs, confirm these flows on a real iPhone and Android device before public announcement:

1. Open the homepage and scroll through the JCEE Labs, VOW, Research, curlicue, QCS, Charter, and Mirrored sections.
2. Open and close the mobile navigation; verify all navigation links and the theme control remain accessible.
3. Confirm the VOW synthetic failure interaction, recovery state, and replay control.
4. Confirm there is no sideways page scroll or clipped content.
5. Confirm reduced-motion behavior when the device accessibility preference is enabled.

## Environment requirement

The headless checks use Chromium. In environments where `chromium` is not on the command path, set `CHROMIUM_BIN` to the Chromium or Chrome executable before running the commands.
