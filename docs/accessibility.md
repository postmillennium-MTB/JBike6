# Accessibility and usability record

A UX review of the live app against the priorities of the UI/UX Pro Max checklist (accessibility and touch first, then layout, type and color), followed by fixes. The numbers come from measuring the rendered page in Chromium with `tests/browser/ux-scan.js`, not from reading the code.

## Results, before and after
| Check | Before | After |
| --- | --- | --- |
| Text elements under 12 px (rendered) | 135 to 139 per screen | 0 on every tab, phone and desktop |
| Text declarations under 12 px in the source | 221 | 0 (a test fails if one returns) |
| Text colors below 4.5:1 contrast | green 4.04, red 4.17, ochre 3.41 as text, plus about a dozen old slate greys as low as 1.54 | every rendered text style passes, on paper, panel and well |
| Controls under 44 x 44 px on a phone (Overview tab) | 72 of 78 | 0 (checkboxes are 24 px but sit in a 44 px tap row) |
| Page scrolls sideways on a phone | Control lab tab (460 px wide) | no tab |
| Chart that relies on color alone | root-locus plot, lean and steer chart | hollow ring against filled dot; solid line against dashed line |
| Data canvases without a text alternative | geometry (label only), rear view, lean and steer, control response | all four have a role, a label and a live description |
| Phone header | "Model profile" label overlapped the unit buttons | rows size to their content |

## What changed
- **Text floor:** every size below 12 px was raised to 12 px, in CSS, inline styles and canvas text, and subscripts use `max(12px, .75em)`.
- **Contrast:** three text-only shades (`--stable-text`, `--signal-text`, `--ochre-text`) chosen to pass 4.5:1 on the darkest background that holds text. The bright colors stay for fills, dots and lines. Hard-coded old slate greys became `--muted`, a leftover rule from the dark-banner era was fixed, and the decorative `|` separator is hidden from assistive technology.
- **Touch:** a block at the end of `instrument-ui.css` gives every control a 44 px minimum at phone width or on any touch screen. Desktop mouse use is unchanged. The Control lab matrices stack and scroll inside their own box on a phone.
- **Charts:** a second cue besides color on both data charts, with matching legends. The reading guide under the plot describes rings and dots.
- **Descriptions:** `canvas-descriptions.js` builds plain sentences from the live numbers. A crashed run is described only up to the crash, because the linear model's angles after a crash mean nothing.

## How it is kept
- `tests/accessibility.test.js` (28 tests): the 12 px floor in every source file, contrast of every text token on all three backgrounds, the touch-target rules, and both chart cues, the last two by running the real drawing code against a recording canvas. Each was checked by breaking the rule and confirming a failure.
- `tests/canvas-descriptions.test.js` (7 tests): the wording of every description.
- `tests/browser/ux-scan.js`: the rendered check described above. It is not part of `node --test` because it needs Playwright.

## Not covered
- A real screen reader on a real device. The descriptions exist and are wired up, but they were read as text, not heard.
- Firefox focus ring on the wheel-size sliders, and Safari generally.
- Performance.
- Desktop controls stay under 44 px on purpose, since the rule is for touch.
- The 3D views stay inaccessible by nature. They are optional toggles, and the 2D views are the default.
