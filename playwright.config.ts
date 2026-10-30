import { defineConfig, devices } from '@playwright/test'
import { loadEnvConfig } from '@next/env'

/**
 * End-to-end journeys: a visitor finding a container and reaching checkout,
 * as a guest and as a registered customer. See tests/e2e/README.md.
 *
 *   npm run test:e2e              build, start, run everything
 *   npm run test:e2e -- --ui      watch it happen
 *
 * Loads .env.local the way Next does, so the tests read E2E_USER and
 * E2E_PASSWORD from the same untracked file as the app's own secrets.
 */
loadEnvConfig(process.cwd())

// Port 3000 on purpose: NEXT_PUBLIC_BASE_URL in .env.local points there, and
// the nav's absolute links are built from it. On any other port, clicking
// "Buy" would leave the server under test for a different one.
const PORT = 3000

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 150_000,
  expect: { timeout: 25_000 },

  // One at a time. Every run shares the real backend and a single test
  // account, so two journeys in parallel would fight over the same cart.
  fullyParallel: false,
  workers: 1,
  retries: 0,

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // The phone layout runs only the journeys tagged @mobile.
    { name: 'mobile', use: { ...devices['Pixel 7'] }, grep: /@mobile/ },
  ],

  // A production build, not `next dev`: that is what customers get, and dev
  // mode surfaces warnings a real visitor never sees. An already-running
  // server on the port is reused — handy while iterating on a test.
  webServer: {
    command: 'npm run build && npm run start',
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 600_000,
  },
})
