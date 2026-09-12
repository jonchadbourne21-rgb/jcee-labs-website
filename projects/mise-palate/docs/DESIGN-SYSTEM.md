# Mise — UX/UI Design System

**Author:** Manus AI  
**Version:** 1.0

## 1. Design direction

Mise should feel like a composed chef who has already noticed the important detail. The system uses **warm materiality, editorial food photography, professional kitchen precision, and restrained typography**. It deliberately avoids neon AI gradients, playful game language, recipe-blog clutter, and generic dashboard chrome.

The visual motif is a dark green-black working surface set against warm paper and cream. Copper-orange marks the action or sensory change. Muted sage communicates confidence, safety, and a resolved state. Photography carries appetite and craft; diagrams carry geometry and truth.

## 2. Tokens

| Role | Token | Value | Usage |
|---|---|---|---|
| Canvas | `--canvas` | `#f4f0e7` | Main warm paper background |
| Ink | `--ink` | `#172017` | Navigation, primary text, Cook Mode shell |
| Cream | `--cream` | `#fffaf0` | Cards and high-contrast content surfaces |
| Copper | `--copper` | `#f1a15f` | Primary action, progress, sensory increase |
| Copper deep | `--copper-deep` | `#9f4728` | Labels and accessible accent text |
| Sage | `--sage` | `#8ea38b` | Safety, confidence, successful learning |
| Sage deep | `--sage-deep` | `#34513a` | Safety and confirmation text |
| Muted ink | `--muted-ink` | `#6f7167` | Secondary copy |

Corners are deliberately generous: 16 pixels for controls, 24 pixels for cards, and 32 pixels for hero or immersive panels. Shadows are broad and quiet, never glossy. Borders use low-opacity ink to preserve the tactile paper effect.

## 3. Typography

| Type role | Typeface | Intent |
|---|---|---|
| Display | Instrument Serif | Editorial craft, appetite, confidence |
| Interface | DM Sans | Clear mobile controls and compact explanations |
| Data | DM Mono | Timers, percentages, versions, measurements |

Display headings use tight leading and slightly negative tracking. Interface copy uses normal sentence case. Uppercase labels are limited to small high-signal eyebrows such as **Taste Forecast**, **Fixed safety layer**, or **Why it matters**.

## 4. Navigation

Desktop uses a quiet sticky header with the Mise wordmark, four primary routes, and a small positioning statement. Mobile uses a fixed bottom bar with **Home / Cook / Saved / Me**. Cook Mode is immersive and removes the general navigation to reduce accidental exits and visual competition.

Every secondary route has a visible escape path. The recipe view returns to memory, discovery returns home or to the previous stage, Cook Mode has an explicit close button, and empty states direct the user to the next useful action.

## 5. Component system

| Component | Behavior |
|---|---|
| `surface` | Warm translucent card, 24-pixel radius, subtle shadow and border |
| Primary button | Dark ink outside Cook Mode; copper on dark immersive surfaces; 48–64 pixel height |
| Mode switcher | Three-way pill with dark selected state and no empty values |
| Confidence chip | Sage at high confidence; copper at low confidence; exact percentage visible |
| Sensory bars | Copper fill with plain-language labels and numeric values |
| Forecast delta | Sage for increases, copper-deep for decreases; signed bounded number |
| Recipe card | Editorial image, version and provenance label, title, outcome explanation, time |
| Cook step | One dominant instruction plus reason, look/smell/feel cues, failure and recovery |
| Safety card | Sage tint, shield icon, authoritative source link |
| Knife guide | Geometry-only bars or cubes with exact target dimensions and no hand/blade imagery |
| Empty state | One sentence of context, one next action, no decorative dead end |

## 6. Core screens

The home screen centers the camera action over ingredient photography. It reveals the Palate Twin and recent recipe memory beneath rather than crowding the first viewport. Onboarding uses one decision per screen with two or three large answer surfaces. Discovery separates capture, confirmation, and direction choice. Recipe detail alternates explanation and structure. Cook Mode presents one step, three sensory cues, one recovery path, and one next action.

The Palate Twin screen makes the model inspectable. It shows current sensory values, direct controls, historical signals, data deletion, and a multi-palate demonstration. The Chef Knowledge screen exposes review status, structured content, sources, and owner-only editing.

## 7. Loading, empty, and error states

Loading copy is domain-specific: **Setting the kitchen**, **Reading the counter**, **Building your directions**, and **Preparing your station**. Empty recipe memory explains that the first cooked dish creates the first useful object. Empty Cook Mode sends the user to discovery. Provider failure does not produce a blank view; safe fallbacks remain labeled.

Errors appear as plain-language toasts or inline cards. An unclear image is not framed as an error. It is a normal confirmation state with confidence and an explicit request for correction.

## 8. Motion and accessibility

Interactions use 150–220 millisecond ease-out transitions and a 0.97 active scale. Entrance motion is limited to first-load sections and is removed when the user prefers reduced motion. Buttons and Cook Mode controls meet large-touch-target requirements. Focus rings remain enabled through the component system. The app uses semantic headings, button labels, alt text for meaningful photography, and text equivalents for every visual sensory signal.

Food photography never carries critical text by itself. Gradient overlays preserve contrast. Safety and uncertainty never rely on color alone; labels and percentages are always present.

## 9. Responsive behavior

The design begins at 320 pixels and uses a 390 × 844 verification target. Cards remain single column until 640 pixels. Recipe and home heroes split only on large screens. The bottom navigation sits inside the safe visual area and main content reserves sufficient bottom padding. Long titles, recipe instructions, and knowledge JSON wrap without horizontal scrolling.

## References

[1]: https://www.w3.org/WAI/WCAG22/quickref/ "Web Content Accessibility Guidelines 2.2 Quick Reference"
