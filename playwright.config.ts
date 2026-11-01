import { defineConfig } from '@playwright/test';
const port = Number(process.env.DECIDO_TEST_PORT || 3000);
const browserName = process.env.DECIDO_TEST_BROWSER === 'webkit' ? 'webkit' : 'chromium';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  use: {
    browserName,
    baseURL: `http://127.0.0.1:${port}`,
    launchOptions: browserName === 'chromium' && process.env.DECIDO_BROWSER_PATH ? { executablePath: process.env.DECIDO_BROWSER_PATH } : {},
  },
  webServer: { command: `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`, url: `http://127.0.0.1:${port}`, reuseExistingServer: !process.env.CI },
});
