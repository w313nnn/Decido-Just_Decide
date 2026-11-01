# Phone layout

Decido is designed for phone use first. The layout adapts to the available space instead of using a fixed device model or screen height.

## Changes

- Bottom navigation is the default. Wide, short landscape screens keep a compact version; larger, taller screens use centred desktop navigation.
- The header separates the campus label from the logo on narrow screens. The Leave or Sign out control keeps a visible label and a touch target at least 44px high.
- Primary controls are at least 48px high. Category and craving choices have larger touch areas, and budget presets reflow as space or text size changes.
- The document uses `viewport-fit=cover`. Header, page gutters and bottom navigation respect the device's safe-area insets.
- A border-box ResizeObserver measures the whole navigation, including its padding. The page reserves that height so users can scroll every control above the bar. Browsers without ResizeObserver fall back to measuring on window resize.
- The VisualViewport hook detects a substantially reduced visible area while a text field is focused. It hides the bottom navigation while that reported keyboard is open and restores it afterward. Pinch zoom remains available and is not treated as a keyboard.
- Confirmation and map dialogs scroll within the available viewport. Long headings, place names and button labels can wrap. Form controls use at least 16px text at the default browser text size.

The implementation follows [WebKit's safe-area guidance](https://webkit.org/blog/7929/designing-websites-for-iphone-x/), the [VisualViewport API](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport) and [Chrome's explanation of keyboard viewport behaviour](https://developer.chrome.com/blog/viewport-resize-behavior). Browsers that resize the layout viewport for a keyboard retain native scrolling even when there is no visual-viewport height difference to detect.

## Layout checks

`tests/browser/mobile-layout.spec.ts` exercises the active screens at these CSS viewport sizes:

| Width × height | Layout |
| --- | --- |
| 320 × 480 | Small phone |
| 320 × 568 | Compact phone |
| 360 × 640 | Compact Android-sized screen |
| 375 × 667 | Older iPhone-sized screen |
| 390 × 844 | Modern iPhone-sized screen |
| 412 × 915 | Large Android-sized screen |
| 430 × 932 | Large iPhone-sized screen |
| 600 × 960 | Foldable inner-screen size |
| 844 × 390 | Phone landscape |
| 915 × 412 | Large phone landscape |
| 768 × 1024 | Tablet |
| 1280 × 800 | Desktop |

For each size, checks cover horizontal overflow, navigation touch targets, reachable decision buttons, result saving, history, confirmation bounds, spending and settings. Additional checks cover 200% text at 320px width, a simulated keyboard resize and navigation padding changes.

Run the suite with `npm run test:browser`. It supports Chromium by default and WebKit through `DECIDO_TEST_BROWSER=webkit`. `DECIDO_TEST_PORT` selects the local server port, and `DECIDO_BROWSER_PATH` can point to an installed Chrome or Edge executable. Install WebKit with `npx playwright install webkit` before selecting that engine.

These are browser-engine and viewport tests, not physical-device certification. Real iOS and Android checks are still needed for actual notches, keyboards, browser toolbars, accessibility settings and vendor browsers. No finite device matrix establishes compatibility with every phone.
