<p align="center">
  <img src="assets/decido-logo.png" alt="Decido — location pin with a plate and checkmark" width="560" />
</p>

<h1 align="center">Decido</h1>
<p align="center"><strong>Less time deciding. More time eating.</strong></p>
<p align="center">A university-focused prototype for finding your next food, drink or dessert nearby.</p>

## Why Decido?

**“What should we eat?”**

Decido started with a question my friends and I kept asking. Choosing somewhere to eat can take longer than it should, especially when everyone has a different budget or preference.

The idea is simple: tell Decido what you feel like having and how much you want to spend, then let it help you narrow down nearby options.

## Project status

**Decido is an early prototype, developed using Google AI Studio.** The initial focus is the student community at **UTAR Sungai Long**.

This repository documents a project in development. The experience below describes the intended product direction; it is not a guarantee that every feature is implemented or available in the current build. Coverage, recommendation quality and the underlying place information still need validation.

## The intended experience

1. **Pick a category:** food, drinks or desserts.
2. **Set your budget:** choose a price range that works for you.
3. **Share your preferences:** narrow the choices to suit what you feel like having.
4. **Find nearby options:** discover places around the campus area.
5. **Make a decision:** spend less time going back and forth over where to go.

For example, a student looking for a budget-friendly lunch near UTAR Sungai Long could use Decido to narrow the options based on their spending limit and food preferences.

## Start with one campus. Learn, then expand.

The first goal is to build a useful experience for UTAR Sungai Long students and improve it through real feedback. If that foundation works well, the longer-term ambition is to bring Decido to other universities.

Multi-university coverage is a future goal, not a current availability claim.

## Development priorities

- Validate the core decision flow around UTAR Sungai Long.
- Refine how budgets and food preferences shape suggestions.
- Check the relevance and accuracy of nearby place information.
- Learn from student feedback and improve the experience.
- Explore support for additional universities once the initial experience is reliable.

These are development directions rather than committed release dates.

## Designed for phones

Decido's layout starts with phone screens. The numbered flow, large touch controls and bottom navigation adapt to small and large displays, portrait and landscape. Text can wrap and grow without forcing a fixed screen height. Notches and home indicators get safe-area spacing, and the page reserves the measured height of the bottom navigation.

On browsers that report keyboard changes through VisualViewport, navigation moves out of the way while typing. Form fields use readable text sizes, and browser zoom remains available. Tablets and desktop screens keep a centred layout.

The layout checks cover 12 viewport sizes, from 320×480 to 1280×800, plus enlarged text, navigation resizing and a simulated keyboard. Emulator checks do not replace hands-on testing on physical phones.

## Test site

The hosted test site is at https://decido-test.urbanrain4.chatgpt.site and is private to its owner. Start with **Try Decido as a guest**. See [the testing guide](docs/TESTING.md) for phone checks, bug reports and publishing updates.

## Running the project

Use Node.js 22.12 or newer and npm. Install the pinned dependency tree:

```sh
npm ci
npm run dev
```

Open the local address printed in the terminal (normally http://localhost:3000).

Guest mode, the numbered decision flow and the description shortcut work without a Gemini key. The shortcut recognises simple words locally and asks you to review the result. Suggestions come from the bundled Sungai Long sample list; they are not a live search around your device.

To enable the optional map preview, copy `.env.example` to `.env.local`, set `VITE_GOOGLE_MAPS_API_KEY` to your browser-restricted Google Maps key, and restart the development server. Without a key, suggestions still have Google Maps search links. Never put private Gemini or service-account keys in browser environment variables.

Account sign-in and cloud history use the Firebase project in `firebase-applet-config.json`. To use your own project, replace that configuration, enable the required sign-in providers, allow your deployment domain, and deploy the repository's Firestore rules to the configured database. A failed sign-in does not create an account session; guest mode is a separate choice.

History and settings are separated by account in this browser. Guest data stays on this device. Account history syncs to Firestore; settings remain local to the browser and account. Unsynced saves and removals are kept locally for retry. Browser storage is not encrypted, so use your own device for personal history. Old shared prototype storage is left untouched but is not automatically assigned to an account.

```sh
npm run lint
npm test
npm run build
npm run test:browser
```

The browser checks use Playwright. Run `npx playwright install chromium` once, or set `DECIDO_BROWSER_PATH` to an installed Chrome/Edge executable. Browser tests start the local development server automatically. Set `DECIDO_TEST_PORT` to use another port. To check the WebKit engine, run `npx playwright install webkit`, then set `DECIDO_TEST_BROWSER=webkit` before running the browser suite.

See [the review notes](docs/REVIEW.md) for the fixes, validation and remaining checks before a public launch.

## Feedback and contributions

Feedback from students is especially useful. If Issues are enabled in this repository, share:

- What you were trying to find and the campus or area involved.
- Your approximate budget and relevant preferences.
- What happened and what would have made the decision easier.

For a bug report, include steps to reproduce it and screenshots where helpful. Remove personal information and credentials before posting. For a substantial contribution, discuss the proposed change with the maintainer first.

## Version history

See [CHANGELOG.md](CHANGELOG.md) for recorded changes. While the project is still evolving, pending changes belong under **Unreleased** until an actual release is tagged.

## Brand assets

The Decido logo is in [`assets/decido-logo.png`](assets/decido-logo.png). Its location pin represents nearby discovery, the plate represents food, and the checkmark represents reaching a decision.

Decido is an independent student project. Mentioning UTAR Sungai Long identifies the initial campus focus and does not imply university endorsement or affiliation.

## Permissions and licensing

Decido is a personal portfolio project shared for viewing and reference. No general open-source license is granted for the author's original contributions.

Except where permitted by applicable law, GitHub’s terms, or an applicable existing license, please obtain the author's permission before reusing, modifying or redistributing those contributions.

Third-party code and dependencies remain subject to their respective licenses.

