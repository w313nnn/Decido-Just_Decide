# Testing Decido

Test site: https://decido-test.urbanrain4.chatgpt.site

The Site is private to its owner. Hosting access is separate from Decido's own account sign-in. Start with **Try Decido as a guest** to test the decision flow without configuring Firebase sign-in for the new domain.

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

The GitHub fixes branch remains `fix/minimal-guided-flow-2026-11-01`. Sites also keeps an exact committed source snapshot for each published version. Reuse the `project_id` in `.openai/hosting.json` when updating this Site, then publish through the Sites workflow to keep the same URL.

Before publishing a fix, run `npm run check` and the browser checks relevant to the change. For phone layout changes, run the mobile layout suite in Chromium and WebKit. See [MOBILE.md](MOBILE.md).

## Account and map setup

Firebase account sign-in may require adding `decido-test.urbanrain4.chatgpt.site` to the Firebase project's authorised domains and enabling the sign-in providers you want to test. Firestore sync also depends on the configured database and its deployed rules. Guest mode does not need that domain setup.

The published build has no Google Maps API key unless one is explicitly configured at build time. Google Maps search links still work. To enable the embedded preview, set a browser-restricted `VITE_GOOGLE_MAPS_API_KEY` in the local build environment and rebuild. Sites runtime variables do not automatically replace Vite variables already compiled into a static bundle.
