import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test('rickroll reveal sequence - initial state', async ({ page }) => {
    await page.goto('/');

    // Wait for initial reveal to start
    await page.waitForTimeout(800);

    // Take screenshot at early stage
    await expect(page).toHaveScreenshot('rickroll-initial-reveal.png', {
      mask: [page.locator('script'), page.locator('link')],
    });
  });

  test('rickroll reveal sequence - lyrics fully visible', async ({ page }) => {
    await page.goto('/');

    // Wait for all lyrics to be revealed (initial: 600ms + 6 lines * 300ms = 2400ms total)
    await page.waitForTimeout(2500);

    // Take screenshot when all lyrics are visible
    await expect(page).toHaveScreenshot('rickroll-lyrics-visible.png', {
      mask: [page.locator('script'), page.locator('link')],
    });
  });

  test('rickroll reveal sequence - mute button visible', async ({ page }) => {
    await page.goto('/');

    // Wait for mute button to appear (after lyrics are revealed)
    const muteBtn = page.locator('.mute-btn');
    await expect(muteBtn).toHaveClass(/visible/, { timeout: 3000 });

    await expect(page).toHaveScreenshot('rickroll-with-mute-button.png', {
      mask: [page.locator('script'), page.locator('link')],
    });
  });

  test('mute button unmuted state (default)', async ({ page }) => {
    await page.goto('/');

    const muteBtn = page.locator('.mute-btn');
    await expect(muteBtn).toHaveClass(/visible/, { timeout: 3000 });

    // Take screenshot of unmuted icon
    await expect(muteBtn).toHaveScreenshot('mute-button-unmuted.png');
  });

  test('mute button muted state (after click)', async ({ page }) => {
    await page.goto('/');

    const muteBtn = page.locator('.mute-btn');
    await expect(muteBtn).toHaveClass(/visible/, { timeout: 3000 });

    // Accept consent first
    const acceptBtn = page.locator('#audio-hint-accept');
    await acceptBtn.click();
    await page.waitForTimeout(500);

    // Click mute button to change state
    await muteBtn.click();
    await page.waitForTimeout(300);

    // Take screenshot of muted icon
    await expect(muteBtn).toHaveScreenshot('mute-button-muted.png');
  });

  test('consent banner layout', async ({ page }) => {
    await page.goto('/');

    // Wait for consent banner
    const banner = page.locator('#audio-hint');
    await expect(banner).toBeVisible({ timeout: 2000 });

    await expect(banner).toHaveScreenshot('consent-banner.png');
  });

  test('fake loading screen - meeting theme', async ({ page }) => {
    await page.goto('/meeting');

    // Wait for loading screen to be visible
    const fakeLoading = page.locator('#fake-loading');
    await expect(fakeLoading).toHaveClass(/visible/);

    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('loading-screen-meeting.png', {
      mask: [page.locator('script'), page.locator('link')],
    });
  });

  test('fake loading screen - document theme', async ({ page }) => {
    await page.goto('/document');

    const fakeLoading = page.locator('#fake-loading');
    await expect(fakeLoading).toHaveClass(/visible/);

    await page.waitForTimeout(500);

    await expect(page).toHaveScreenshot('loading-screen-document.png', {
      mask: [page.locator('script'), page.locator('link')],
    });
  });

  test('lyrics appear with proper styling', async ({ page }) => {
    await page.goto('/');

    // Wait for all lyrics to render
    await page.waitForTimeout(2500);

    const lyricsContainer = page.locator('.lyrics');
    await expect(lyricsContainer).toHaveScreenshot('lyrics-container.png');
  });

  test('page layout - full page screenshot', async ({ page }) => {
    await page.goto('/');

    // Wait for reveal to complete
    await page.waitForTimeout(2500);

    await expect(page).toHaveScreenshot('full-page-rickroll.png', {
      fullPage: true,
      mask: [page.locator('script'), page.locator('link'), page.locator('img[src*="giphy"]')],
    });
  });

  test('generate page layout', async ({ page }) => {
    await page.goto('/generate/');

    // Wait for page to load and consent banner to appear
    await page.waitForTimeout(1000);

    // Hide the animated lyrics that spawn on generate page
    await page.evaluate(() => {
      const lyrics = document.querySelectorAll('a[href="/"]');
      lyrics.forEach((l) => {
        if (l.style.position === 'fixed') {
          l.style.display = 'none';
        }
      });
    });

    await expect(page).toHaveScreenshot('generate-page.png', {
      mask: [page.locator('script'), page.locator('link')],
    });
  });

  test('about page layout', async ({ page }) => {
    await page.goto('/about/');

    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot('about-page.png', {
      mask: [page.locator('script'), page.locator('link')],
    });
  });

  test('visual regression with prefers-reduced-motion', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/');

    // All lyrics should appear immediately
    const lyricsLines = page.locator('.lyrics-line');
    const firstLine = lyricsLines.first();
    await expect(firstLine).toHaveClass(/visible/, { timeout: 500 });

    await expect(page).toHaveScreenshot('rickroll-reduced-motion.png', {
      mask: [page.locator('script'), page.locator('link')],
    });
  });

  test('bottom links are visible', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(2500);

    const bottomLinks = page.locator('.bottom-links');
    await expect(bottomLinks).toBeVisible();

    // Check individual links
    const generateLink = page.locator('.generate-link');
    const aboutLink = page.locator('.about-link');
    const karaokeLink = page.locator('.karaoke-link');

    await expect(generateLink).toBeVisible();
    await expect(aboutLink).toBeVisible();
    await expect(karaokeLink).toBeVisible();

    await expect(bottomLinks).toHaveScreenshot('bottom-links.png');
  });

  test('responsive layout - mobile width', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.waitForTimeout(2500);

    await expect(page).toHaveScreenshot('rickroll-mobile.png', {
      mask: [page.locator('script'), page.locator('link')],
    });
  });

  test('responsive layout - tablet width', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await page.waitForTimeout(2500);

    await expect(page).toHaveScreenshot('rickroll-tablet.png', {
      mask: [page.locator('script'), page.locator('link')],
    });
  });
});
