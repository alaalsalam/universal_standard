# Project Memory

## Aurora integration for pos.yemenfrappe.com

Date: 2026-08-21

### Scope and compatibility review

- Target site: `pos.yemenfrappe.com` only.
- Runtime verified before installation: Frappe `16.31.0`, ERPNext `16.32.3`, Python `3.14.3`.
- Aurora source: `https://github.com/WaleedAboHashima/Aurora.git`, branch `version-16`, reviewed commit `dfb428e3d5d19dc40cbc8c2195ec74713c5e67dc`.
- Upstream declares `frappe >=16.0.0-dev,<17.0.0` and Python `>=3.14`.
- No additional runtime Python packages are declared. Spreadsheet Quick Look uses Frappe's existing `openpyxl` dependency; installed version was `3.1.5`.
- Aurora has no DocTypes, migrations, Workspaces, or Desktop Icons of its own. Post-install database checks found zero Workspace and zero Desktop Icon records belonging to Aurora.
- Historical note: Aurora was initially kept as a separate GPL-3.0-or-later application. This was superseded by the 2026-08-22 source consolidation recorded below.

### Installation

- Downloaded with `bench get-app --branch version-16 https://github.com/WaleedAboHashima/Aurora.git`.
- Installed only with `bench --site pos.yemenfrappe.com install-app aurora`.
- Installed app version reported by bench: `aurora 0.9.0` on `version-16`.
- Editable Python requirements for both Aurora and Universal Standard were refreshed with `uv pip install`.

### Integration architecture

- Aurora's direct `app_include_*` hooks are disabled to prevent duplicate bundles.
- Aurora's `web_include_*` hooks are disabled so login, portal, and public website pages remain untouched.
- Historical note: the initial integration delegated the boot hook to Aurora. This was replaced by `universal_standard.appearance_api.boot_session` during source consolidation.
- `universal_standard.injector.after_request` injects assets only into authenticated Desk HTML whose request path starts with `/app` or `/desk`.
- Visual load order is Universal Standard base CSS, Leany integration CSS, then Aurora CSS. Behaviour load order is Universal Standard, its theme enhancer, then Aurora.
- Manifested LTR/RTL assets are resolved through Frappe's asset map. Arabic Desk receives Aurora's RTL bundle.
- Historical note: the initial integration exposed Aurora's API through Universal Standard. The current API is owned directly by `window.UniversalStandard.appearance`.
- The panel title and command description are branded as Universal Standard.
- Universal Standard's older dynamic sidebar, icon-colour, and font-size styling is suppressed when the Aurora integration marker exists. Layout visibility and non-overlapping Universal Standard behaviour remain available.
- Aurora Quick Look is the active preview experience. The legacy Universal Standard attachment preview is not globally injected by the current hooks, so no duplicate preview controls are created.
- Fixed Aurora's segmented-control/tab thumb positioning for Frappe's Arabic RTL Desk by anchoring physical left/right coordinates before applying the transform.

### Active Aurora capabilities

- Per-user accent hue/saturation, Frappe light/dark/automatic mode, system/local/Google font selection, corner shape, density, ambient surface tint, and toast position.
- Per-user persistence through User Defaults (`aurora_theme`) plus the local browser cache and boot payload.
- Page transitions, route/request loading bar, click ripples, staggered list/workspace reveal, card sheen, number count-up, condensing page headers, back-to-top control, toast timers, save feedback, quick actions, chart theming, card styling, app-icon tinting, auto-hide dock, and gradients.
- Permission-checked Quick Look for link-field documents and files; image/PDF previews; capped CSV/XLSX/XLSM table previews through `openpyxl`.
- Chart palette generation, rounded bars, spline/region refinements, and live repaint after accent changes.
- Reduced-motion preferences remain respected.

### Deliberately inactive or limited

- Sign-in entrance is disabled and removed from the feature list because it requires Aurora's public/login bundle. This is a scope decision required to keep all public pages unaffected, not a Frappe v16 incompatibility.
- Upstream README documents four current visual limitations that were not represented as feature toggles: frozen first-column clipping in Report View, Tree View not yet restyled, occasional report-toolbar dropdown stacking, and ongoing List View spacing/alignment refinement. These surfaces remain functional.
- No other Aurora feature was disabled for Frappe v16 incompatibility.

### Files changed

Universal Standard:

- `universal_standard/hooks.py`
- `universal_standard/injector.py`
- `universal_standard/aurora_integration.py`
- `universal_standard/public/js/us_theme_enhancer.js`
- `PROJECT_MEMORY.md`

Aurora integration patch:

- `aurora/hooks.py`
- `aurora/public/js/theme/index.js`
- `aurora/public/js/theme/dock.js`
- `aurora/public/js/theme/palette.js`
- `aurora/public/js/theme/settings.js`

Pre-existing local changes preserved:

- `universal_standard/injector.py` already contained `/desk` route support and an updated asset version before this task; the Aurora work was layered onto it.
- `universal_standard/public/css/leany_integration.css` already contained an uncommitted Leany dark-mode palette. It was not overwritten or reverted.

### Deployment and verification record

- `bench build --app universal_standard`: success.
- `bench build --app aurora`: success. Final bundles include `aurora.bundle.EAFM66RW.js`, `aurora.bundle.26AYMVLV.css`, and RTL `aurora.bundle.7FFSJRGO.css`.
- Build emitted a non-fatal pre-existing asset-link warning for missing `apps/doppio/node_modules`; both build commands exited successfully.
- `bench --site pos.yemenfrappe.com migrate`: success.
- Standard migration housekeeping removed one orphan core Desktop Icon named `Frappe Framework`; no Aurora Workspace/Desktop Icon was created or deleted manually.
- Site and website caches cleared; Supervisor web, Socket.IO, scheduler, short worker, and long worker restarted and verified RUNNING.
- HTTP 200 verified for Universal Standard CSS/JS and manifested Aurora CSS/JS.
- `/api/method/ping`: HTTP 200 with `pong`.
- `bench --site pos.yemenfrappe.com doctor`: two workers online and no queued site jobs reported.
- Public `/` and `/login`: HTTP 200 with zero Universal Standard/Aurora Desk injection markers.
- Authenticated headless-browser checks on both `/app` and `/desk`: HTTP 200, `aurora-ready`, one dock, one panel, one Aurora CSS and JS bundle, correct CSS/JS order, boot preference payload present, `window.UniversalStandard.appearance` present, no conflicting Universal Standard dynamic theme styles, no horizontal overflow, and no page-level JavaScript exceptions.
- Visual screenshots were reviewed for the Arabic RTL desktop and open Appearance panel after fixing the RTL thumb overflow.
- A pre-existing request to `/undefined` and Socket.IO authorization noise appeared in the synthetic Administrator verification session. A control run with Aurora assets blocked reproduced the same messages, so they are not caused by Aurora or this integration.

## Language control and performance follow-up

Date: 2026-08-21

- Replaced the detached green floating language button with a compact native-looking Navbar control containing a globe icon and the target language code.
- The control is mounted between notifications and the user avatar on Frappe v16's Desktop Navbar, follows the normal `control-bg`, border, hover, dark-mode and radius tokens, and collapses to icon-only on narrow screens.
- Mounting uses Desk lifecycle events plus a short bounded startup retry; it does not add a permanent MutationObserver.
- Performance profiling initially showed the full Aurora effects adding roughly 300–400 ms of main-thread task time and about 90 ms of layout time during the measured startup window.
- Added balanced profile version 2. Existing and new users keep the full theme, dock, palette, progress/ripple feedback, cards, app icon tinting, charts, gradients and Quick Look, while the most expensive purely cosmetic effects default off: route transitions, staggered reveal, card sheen, count-up, condensing headers, back-to-top, toast timers, save pulse and dock auto-hide. Every effect remains available in the Motion panel.
- The profile migration is persisted once per user so later manual choices are preserved.
- Optional Aurora modules now start after the initial Desk render during browser idle time instead of competing with Frappe's critical startup work.
- MutationObservers for reveal, counters, save feedback and Desktop animation now ignore unrelated DOM mutations instead of rescanning on every added node.
- After optimization, two consistent profiled runs averaged about 1.01 s load, 0.89 s task time and 0.088 s layout time, compared with about 1.18 s load, 1.15 s task time and 0.129 s layout time in the pre-optimization Aurora runs. Network/server variance remains, but the theme is no longer adding a consistent critical-path penalty in the control comparison.

## Aurora source consolidation

Date: 2026-08-22

- Aurora was fully consolidated into `universal_standard`; the separate `aurora` app is no longer installed on `pos.yemenfrappe.com` and its bench source was removed after verification.
- Desk source modules now live under `universal_standard/public/js/appearance/` and `universal_standard/public/scss/appearance/`. Their built and injected Desk bundles are `us_appearance.bundle.js` and `us_appearance.bundle.scss`.
- The non-injected public/login source bundle was retained as `us_appearance_web.bundle.*`; it is deliberately not loaded on public pages, retaining the Desk-only scope.
- Server endpoints were moved to `universal_standard.appearance_api`. Quick Look now calls those endpoints directly; no browser or Python runtime import references the removed app.
- Per-user preferences were migrated from `aurora_theme` / `aurora:settings` to `universal_standard_appearance` / `universal_standard:appearance`. Legacy values are read only as a safe fallback and are copied during migration without overwriting newer Universal Standard preferences.
- The browser API is now `window.UniversalStandard.appearance`; the legacy `window.aurora` API is absent. The injected CSS/JS use only `/assets/universal_standard/dist/.../us_appearance.bundle...` paths.
- Aurora is GPL-3.0-or-later. The transferred source remains attributed, its licence text is retained in `LICENSES/AURORA-GPL-3.0.txt`, and `THIRD_PARTY_NOTICES.md`, README, and app licence metadata record the resulting GPL-3.0-or-later status of Universal Standard.
- Final verification after removal: build and migrate succeeded; `ping` returned HTTP 200; `bench doctor` reported two online workers; authenticated `/app` and `/desk` checks found one Appearance dock/panel, valid preference boot payload, no Aurora asset/API load, no page JavaScript exception, no dynamic-style collision, and no horizontal overflow.
- `bench uninstall-app aurora` created its normal site backup and removed Aurora's module definition. Its generic cleanup reported Desktop Icon/Workspace Sidebar cleanup, but Aurora had no app-owned Workspaces or Desktop Icons, and none were manually created or deleted.

## Appearance hexadecimal accent input

Date: 2026-08-22

- Added a validated hexadecimal colour field beside `Custom hue` in the Appearance panel, including a live colour swatch.
- Entering a six-digit value such as `#0A8754` updates hue, saturation, and lightness precisely; moving the hue slider immediately recalculates the displayed hexadecimal value.
- The optional accent lightness value is persisted only when a hexadecimal colour is supplied. Existing users keep the previous light/dark defaults when they continue using the hue slider.
- Browser verification confirmed exact `#0A8754` round-tripping, valid recomputation after slider movement, and no page-level JavaScript exception. The Administrator test preference was restored after testing.

## Appearance panel overlay correction

Date: 2026-08-22

- Corrected the `vivid` ambient overlay stacking level. It previously sat above every Desk layer and faded the Appearance panel; it now remains beneath Appearance, Dock, Quick Look, and dialog controls.
- Anchored the floating Dock and Appearance panel physically to the right on RTL Desk as well as LTR Desk, avoiding the CSS RTL transform moving them to the opposite edge.
- Rebuilt and visually verified the Arabic RTL Desk: the panel is fully styled, readable, right-aligned, and no page-level JavaScript exception was emitted.

## Accent gradient choice

Date: 2026-08-22

- Added an explicit `نمط اللون` control beside `Custom hue`: `متدرج` preserves the Aurora two-tone accent treatment and `لون موحّد` removes the companion hue.
- The solid option is connected to the existing per-user `gradients` preference and flattens all Aurora accent/soft-gradient tokens to the entered Hex colour family. It is intentionally kept out of the Motion effects list because it is a colour decision, not an animation.
- Rebuilt the Universal Standard assets, cleared the site cache, restarted the web services, and verified the new control in authenticated `/app`: switching produces `data-aurora-gradients="0"` with a single-colour accent token, then restores the two-tone token with `"1"`. No page-level JavaScript exception occurred and the compiled CSS returned HTTP 200.

## Saved-accent prepaint

Date: 2026-08-22

- Fixed the violet accent flash on Desk refresh. The CSS bundle used to paint its default violet token in the document head before the end-of-page appearance JavaScript could hydrate the account preference.
- The Desk injector now emits a numeric, per-user prepaint style immediately after the Appearance CSS. It carries only validated hue, saturation, optional lightness, and the flat-gradient token when selected; no user-provided text is inserted into HTML.
- The rendered authenticated Desk response was verified to contain the saved `#064E3B` HSL equivalent (`155.52`, `86.207%`, `28.431%`) and its selected flat-accent tokens before the desk scripts load.
