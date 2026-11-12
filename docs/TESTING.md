# Testing Decido

Latest private preview: https://decido-preview.fancyjade4.chatgpt.site

Hosting access is restricted. Once admitted, Decido's account sign-in is optional. Start with **Try Decido as a guest**. The older public demo at https://decido-test.urbanrain4.chatgpt.site does not contain the latest changes.

## First test on your phone

1. Open the test site in your phone browser.
2. Choose **Try Decido as a guest**.
3. Pick Food, Drink or Dessert, enter a budget, and choose a craving.
4. Try another suggestion, then save a choice.
5. Check History and Spending, and try changing your budgets or dietary preferences in Settings.
6. Rotate the phone and check that buttons remain reachable. Try opening the keyboard and using larger text in your browser settings.

Suggestions use the bundled sample list. Saving a choice does not order anything. Guest history stays in that browser; another phone or browser starts with its own guest history.

## When you find a bug

Record these details in a GitHub issue or the development chat:

- What you tapped, in order.
- What you expected and what happened instead.
- Phone model, browser and whether the phone was in portrait or landscape.
- A screenshot, if it helps explain the problem.

Use this short format:

```text
Screen:
Steps:
Expected:
Actual:
Phone and browser:
```

## Making and testing changes

Run `npm ci` once, then `npm run dev` for a local development preview. Local changes reload while that development server runs. The hosted URL changes only when a new version is published; pushing to the GitHub fixes branch alone does not publish a Sites version automatically.

The current GitHub update branch is `feat/illustrations-loaders-firebase-2026-11-12`. Sites keeps a committed source snapshot for each published version. The private preview uses a separate hosting project from the older public demo; verify the destination before publishing.

Before publishing a fix, run `npm run check` and the browser checks relevant to the change. For phone layout changes, run the mobile layout suite in Chromium and WebKit. See [MOBILE.md](MOBILE.md).

## Account and map setup

The dedicated Firebase project is `decido-e81d4`, with the `(default)` Firestore database in Singapore. Google sign-in is enabled and `decido-preview.fancyjade4.chatgpt.site` is authorised. Account-only rules have been deployed. Other sign-in providers need separate setup.

To deploy rule changes from an authenticated Firebase CLI session, run `npx firebase-tools deploy --only firestore:rules --project decido-e81d4`.

Cross-device validation is still pending: sign in with Google, save a choice, then sign in with the same Google account on another device and check History. Test deleting a choice too. Guest history should remain separate in each browser. Firebase administrators can access synced records; the rules protect against other app users, not project administrators.

The published build has no Google Maps API key unless one is explicitly configured at build time. Google Maps search links still work. To enable the embedded preview, set a browser-restricted `VITE_GOOGLE_MAPS_API_KEY` in the local build environment and rebuild. Sites runtime variables do not automatically replace Vite variables already compiled into a static bundle.
