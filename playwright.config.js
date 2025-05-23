const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  use: {
    // Use headless mode by default, but allow override via env variable
    headless: process.env.CI ? true : false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'on-first-retry',
    // Collect traces for failed tests
    trace: 'retain-on-failure',
  },
  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'mobile',
      use: { 
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  // Configure reporters
  reporter: [
    ['html'],
    ['list']
  ],
  // Run tests in files in parallel
  fullyParallel: true,
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  // Configure webServer
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: true, // Always reuse the server if it's running
    timeout: 120000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
}); 