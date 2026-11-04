# Changelog

Record meaningful changes to Decido here so contributors and users can follow the project's progress.

Decido is currently a prototype. No historical release numbers or dates have been reconstructed. The entries below describe this documentation and branding package; they do not certify implemented app features.

## [Unreleased]

### Test hosting

- Added Sites hosting configuration and a phone testing guide.
- Added a private hosted test URL for the current mobile interface.
- Updated the transitive gRPC dependency used by Firebase to a patched release.

### Mobile layout

- Made phone layouts the default, with compact bottom navigation in both portrait and landscape.
- Added safe-area spacing for notches and home indicators and reserved the navigation's measured height.
- Improved the header, budget presets, long-text wrapping and form controls on narrow screens.
- Kept primary touch controls at least 44px high, with larger category choices and readable form text.
- Made confirmation and map dialogs scroll within the available screen height.
- Added VisualViewport handling to hide bottom navigation when a reported software keyboard would compete for space.
- Added layout checks across 12 screen sizes, 200% text, navigation height changes and simulated keyboard opening and closing.


### Fixed

- Dietary restrictions, disliked items and the entered budget now remain mandatory when choosing a suggestion.
- Skipped options no longer reappear after all matching items have been seen.
- Failed sign-in attempts no longer create local sessions that look authenticated.
- Local history and settings are separated by account; new users start with an empty history.
- Empty cloud snapshots now clear stale history, while pending local saves and removals are preserved for retry.
- Cloud sync errors appear in the interface instead of escaping background promise handlers.
- Clearing history requires confirmation and uses bounded Firestore batches.
- The description shortcut runs locally without a browser crash or an exposed private model key.
- Malformed saved data and unavailable browser storage are handled without crashing.
- Restored browser zoom, visible focus styles and usable labels for form controls.
- Corrected the dependency conflict between Vite and the directly pinned esbuild version.

### Interface

- Added visible numbered steps, clear Next and Back actions, and guest access from the welcome page.
- Replaced the swipe deck, timed tutorial, login delay and sound effects in the active interface with simple controls.
- Rewrote the active screens in plain language and labelled sample prices, dietary tags and location estimates honestly.
- Added scoped GSAP timelines and optional scroll reveals with React cleanup and reduced-motion support.
- Added regression tests and browser checks for the guided flow, history, mobile layout and failed sign-in.


### Added

- Initial README introducing Decido, its origin and its intended food, drink and dessert decision experience.
- Documentation of the initial UTAR Sungai Long focus and future ambition to support other universities.
- Decido logo combining a location pin, plate and checkmark.
- Changelog for recording future changes.

### Changed

- Updated the Decido wordmark to match the location pin's red-orange color, retaining a transparent background for use on light and dark backgrounds.

### Clarified

- The project is an early prototype developed using Google AI Studio.
- Budget, preference and nearby-discovery descriptions express the intended product experience; availability must be checked against the current build.
- Multi-university support is a future goal.

<!--
MAINTAINER NOTES

Keep pending work under Unreleased. When you publish a real release, move its
entries into a dated section and use the same version as the Git tag.
Do not list planned features as completed changes.

Copy this template for each actual release, replacing VERSION and YYYY-MM-DD:

## [VERSION] - YYYY-MM-DD

### Added
- New features or capabilities delivered in this release.

### Changed
- Changes to existing behavior.

### Fixed
- Bugs resolved.

### Removed
- Features or behavior removed.

Use only the sections that apply. For example, an initial tagged prototype
could use 0.1.0 if the maintainer chooses that version; this file does not
assert that such a release already exists.
-->


