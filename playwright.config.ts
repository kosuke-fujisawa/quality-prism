import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright設定ファイル
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* 並列実行時の失敗テスト数 */
  fullyParallel: true,
  /* CI環境での設定 */
  forbidOnly: !!process.env.CI,
  /* 失敗時のリトライ回数 */
  retries: process.env.CI ? 2 : 0,
  /* 並列実行ワーカー数 */
  workers: process.env.CI ? 1 : undefined,
  /* レポート設定 */
  reporter: 'html',
  /* 全テストの共通設定 */
  use: {
    /* ベースURL */
    baseURL: 'http://127.0.0.1:3000',
    /* 失敗時にスクリーンショットを撮影 */
    screenshot: 'only-on-failure',
    /* 失敗時にビデオを録画 */
    video: 'retain-on-failure',
    /* トレース設定 */
    trace: 'on-first-retry',
  },

  /* 各ブラウザでのテスト設定 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    /* モバイルブラウザテスト */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* 開発サーバーの設定 */
  webServer: {
    command: 'npm run dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
  },
});
