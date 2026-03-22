import { test, expect } from '@playwright/test';

const themes = [
  {
    path: '/meeting',
    name: 'meeting',
    loadingText: 'Redirecting to your meeting...',
    fakeDelay: 2000,
  },
  {
    path: '/document',
    name: 'document',
    loadingText: 'Opening shared document...',
    fakeDelay: 2500,
  },
  {
    path: '/password-reset',
    name: 'password-reset',
    loadingText: 'Verifying your identity...',
    fakeDelay: 2000,
  },
  {
    path: '/invoice',
    name: 'invoice',
    loadingText: 'Loading invoice #48291...',
    fakeDelay: 2200,
  },
  {
    path: '/survey',
    name: 'survey',
    loadingText: 'Loading survey...',
    fakeDelay: 1800,
  },
  {
    path: '/clickbait',
    name: 'clickbait',
    loadingText: 'Loading exclusive content...',
    fakeDelay: 2500,
  },
  // karaoke and about are standalone pages with their own layouts,
  // they don't use the shared fake-loading overlay from index.html
];

test.describe('Theme Scenarios', () => {
  themes.forEach((theme) => {
    test(`${theme.name}: shows fake loading screen with correct text`, async ({ page }) => {
      await page.goto(theme.path);

      // Check that fake loading overlay appears
      const fakeLoading = page.locator('#fake-loading');
      await expect(fakeLoading).toBeVisible();

      // Check that the loading text matches
      const loadingText = page.locator('#fake-loading-text');
      await expect(loadingText).toContainText(theme.loadingText);

      // Check that the loading actions appear (progress bar + skip button)
      const actions = page.locator('#fake-loading-actions');
      await expect(actions).toBeVisible();
      const skipBtn = page.locator('.skip-btn');
      await expect(skipBtn).toBeVisible();
    });

    test(`${theme.name}: reveals rickroll after loading screen`, async ({ page }) => {
      await page.goto(theme.path);

      // Wait for fake loading to disappear
      const fakeLoading = page.locator('#fake-loading');
      await expect(fakeLoading).toHaveClass(/visible/);

      // Wait for the loading screen to complete (add buffer for timing variance)
      await page.waitForTimeout(theme.fakeDelay + 1000);

      // Check that rickroll lyrics become visible
      const lyricsLines = page.locator('.lyrics-line');
      const firstLine = lyricsLines.first();

      // Wait for lyrics to be visible (they appear one by one)
      await expect(firstLine).toHaveClass(/visible/, { timeout: 5000 });

      // Verify specific lyrics are present
      await expect(firstLine).toContainText('Never gonna give you up');
    });

    test(`${theme.name}: shows consent banner after rickroll reveal`, async ({ page }) => {
      await page.goto(theme.path);

      // Wait for the theme to load and fake loading to complete
      const fakeLoading = page.locator('#fake-loading');
      await page.waitForTimeout(theme.fakeDelay + 2000);

      // Check for consent banner (audio-hint)
      const consentBanner = page.locator('#audio-hint');
      await expect(consentBanner).toBeVisible({ timeout: 3000 });

      // Verify banner contains expected text
      await expect(consentBanner).toContainText('We value your privacy');

      // Check for accept and reject buttons
      const acceptBtn = page.locator('#audio-hint-accept');
      const rejectBtn = page.locator('#audio-hint-reject');
      await expect(acceptBtn).toBeVisible();
      await expect(rejectBtn).toBeVisible();
    });
  });

  test('base URL (no theme): shows rickroll directly without fake loading', async ({ page }) => {
    await page.goto('/');

    // Fake loading should NOT be visible on base URL
    const fakeLoading = page.locator('#fake-loading');
    await expect(fakeLoading).not.toHaveClass(/visible/);

    // Lyrics should be visible quickly without waiting for fake delay
    const lyricsLines = page.locator('.lyrics-line');
    const firstLine = lyricsLines.first();
    await expect(firstLine).toHaveClass(/visible/, { timeout: 2000 });

    // Verify consent banner appears
    const consentBanner = page.locator('#audio-hint');
    await expect(consentBanner).toBeVisible({ timeout: 2000 });
  });

  test('skip button triggers multiple fake delays when clicked', async ({ page }) => {
    await page.goto('/meeting');

    // Wait for skip button to appear
    const skipBtn = page.locator('.skip-btn');
    await expect(skipBtn).toBeVisible();

    // Click the skip button and verify it changes behavior
    const loadingText = page.locator('#fake-loading-text');
    const initialText = await loadingText.textContent();

    await skipBtn.click();
    await page.waitForTimeout(500);

    // Text should change to one of the "optimizing" messages
    const newText = await loadingText.textContent();
    expect(newText).not.toEqual(initialText);
    expect(newText).toMatch(/Optimizing|Almost there|Recalibrating|moment longer/);
  });

  test('progress bar animates during fake loading', async ({ page }) => {
    await page.goto('/invoice');

    // Wait for progress bar to appear
    const progressBar = page.locator('#fake-progress-bar');
    await expect(progressBar).toBeVisible();

    // Get initial width (should be 0 or small)
    const initialWidth = await progressBar.evaluate((el) =>
      window.getComputedStyle(el).width
    );

    // Wait a bit for animation
    await page.waitForTimeout(1000);

    // Get new width (should have progressed)
    const newWidth = await progressBar.evaluate((el) =>
      window.getComputedStyle(el).width
    );

    // Width should have increased (parsing pixel values)
    const initial = parseFloat(initialWidth);
    const newVal = parseFloat(newWidth);
    expect(newVal).toBeGreaterThan(initial);
  });
});
