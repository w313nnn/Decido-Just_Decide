# Decido review and interface update

Reviewed against the `main` branch at commit `27db6366c3536efc7056baaaa71b9029a6bf767c`.

## Bugs fixed

| Finding | Result |
| --- | --- |
| The recommendation engine silently dropped dietary restrictions if no items matched. | All selected tags are required. A lack of matches produces a helpful empty state. |
| The engine could recommend items above the entered budget. | The budget is a hard maximum. Invalid numbers are rejected. |
| Skipping every item reset the pool and repeated rejected choices. | Skips stay excluded; the user can change their choices to start again. |
| Disliked item IDs were saved but not used. | Disliked IDs are excluded. |
| Failed email sign-ins could create a fake local account on network or provider errors. | Only Firebase authentication creates an account session. Guest access is explicit. |
| A cached account object could restore a signed-in-looking UI without Firebase authentication. | Firebase owns account identity. The old local identity cache is ignored. |
| All users shared the same local history and settings keys. | Storage is scoped to the account UID, with a separate guest namespace. The session UI remounts when identity changes. |
| New users received fabricated personal meal history. | History starts empty; sample meals are no longer inserted into personal records. |
| Empty Firestore snapshots were ignored and remote history was not used by recommendations. | Snapshots update the account's local history, including empty snapshots. |
| A failed cloud write could be lost on the next refresh. | Pending saves and removals remain in an account-scoped queue and are retried when subscribing again. |
| Background Firestore error handlers threw new errors. | Errors appear as a retryable sync notice. |
| Clear-history batches could exceed Firestore's write limit. | Deletion uses batches of 450 and reports failures. |
| The description parser referenced `process` in the browser and supported exposing a private model key. | The shortcut runs locally and requires review before requesting a suggestion. |
| Substring matching mistook words such as “steak” for “tea”. | Word boundaries and basic negation handling reduce incorrect matches. |
| Place fallbacks were labelled verified and cached before the Places library loaded. | Optional previews are labelled approximate; cache entries distinguish library availability and distant search results are rejected. |
| Browser zoom was disabled and primary controls lacked useful labels. | Zoom works, form labels are connected, steps move keyboard focus, and dialogs use native focus containment and Escape handling. |
| Vite's optional esbuild peer dependency conflicted with the direct esbuild pin. | Removed the unused direct pin and added an npm lockfile. |

## Interface choices

The active screens use one warm accent, neutral surfaces, larger text and visible controls. The three decision steps keep their numbers and names visible on mobile. The result offers Save, Show another option and Change my choices. History deletion requires confirmation, and spending is labelled an estimate based on saved prices.

Guest mode is available before sign-in. Forced login animations, sound effects, card tilting, infinite button shine and the timed swipe tutorial are no longer in the active flow. Existing prototype components that are not imported by the active screens remain in the source for reference.

## GSAP and wording

`AnimatedPanel` registers the React hook, ScrollTrigger and ScrollToPlugin once. It scopes targets to each panel, uses timelines with local defaults, collects targets with `gsap.utils.toArray`, reads positions before creating scroll animations, and reverts on dependency changes and unmount. Only transform and visibility/opacity animate. Already-visible content animates immediately so a shortened page does not leave its empty state hidden. Reduced-motion users get visible static content. Step navigation uses a short optional scroll adjustment and keyboard focus.

The framework skill's lifecycle and selector-scoping principles apply through React's `useGSAP`; this app does not need Vue or Svelte. No drag, pinning or scroll takeover is added to the decision flow. These choices follow the supplied skills and the official [React guidance](https://gsap.com/resources/React/), [matchMedia documentation](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/) and [ScrollToPlugin documentation](https://gsap.com/docs/v3/Plugins/ScrollToPlugin/).

Active interface copy was edited using the humanizer skill: short instructions, familiar button labels and specific error messages. Claims about verified eateries, halal certification, actual spending and live location were removed where the implementation does not support them.

## Validation

- Type check: `npm run lint`.
- Regression suite: `npm test` covers budget limits, mandatory dietary tags, exhausted pools, dislikes, account isolation, malformed storage, pending history merges and parser errors.
- Production bundle: `npm run build`.
- Browser suite: `npm run test:browser` covers the numbered guest flow, no-match recovery, saving, confirmation, clearing and reloading history; mobile width, reduced motion, focus movement, dietary settings and a mocked rejected sign-in.

## Checks still needed before public use

- Test successful sign-in, sign-out across tabs, account switching and multi-device Firestore sync against a test Firebase project. Automated browser tests do not use real accounts or write to the production database.
- Exercise offline cloud writes, denied writes, reconnects and histories larger than 450 records against the Firebase emulator or a staging database. The pending-merge logic has local regression coverage; these integrations still need live validation.
- Confirm Google Maps API restrictions, billing and place matches with a configured staging key. The default browser tests run without a Maps key; the optional map dialog is not a verified venue lookup.
- Validate every shop, price and dietary label. The bundled sample list is not evidence of opening hours, menu availability, allergens or certification.
- Old shared local history is retained under its original key but not assigned automatically to an account because its owner cannot be established.
- Local browser storage is not encrypted and is shared by people using the same browser profile. Do not treat guest mode as a private account.
- Firestore rules were reviewed for ownership checks but were not changed or deployed in this update. Server-side configuration and rules need their own integration tests before launch.
