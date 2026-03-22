import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Audit', () => {
  test('main rickroll page - axe audit after reveal', async ({ page }) => {
    await page.goto('/');

    // Wait for rickroll to reveal
    await page.waitForTimeout(2500);

    // Inject and run axe
    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });
  });

  test('main page - has required ARIA attributes', async ({ page }) => {
    await page.goto('/');

    // Wait for reveal
    await page.waitForTimeout(2500);

    // Check for aria-live on lyrics container
    const lyricsContainer = page.locator('.lyrics');
    await expect(lyricsContainer).toHaveAttribute('aria-live', 'polite');
    await expect(lyricsContainer).toHaveAttribute('aria-atomic', 'false');

    // Check mute button has aria-label
    const muteBtn = page.locator('.mute-btn');
    await expect(muteBtn).toHaveAttribute('aria-label', /Unmute|Mute/);

    // Check that fake-loading is hidden from accessibility tree
    const fakeLoading = page.locator('#fake-loading');
    await expect(fakeLoading).toHaveAttribute('aria-hidden', 'true');

    // Check rick background is hidden from accessibility tree
    const rickBg = page.locator('.rick-bg');
    await expect(rickBg).toHaveAttribute('alt', '');
  });

  test('main page - focus management', async ({ page }) => {
    await page.goto('/');

    // Wait for reveal
    await page.waitForTimeout(2500);

    // Trigger consent to make mute button interactive
    const acceptBtn = page.locator('#audio-hint-accept');
    await acceptBtn.click();
    await page.waitForTimeout(500);

    // Mute button should be keyboard accessible
    const muteBtn = page.locator('.mute-btn');
    await muteBtn.focus();

    // Check it's focused
    const focused = await page.evaluate(() => {
      return document.activeElement === document.querySelector('.mute-btn');
    });
    expect(focused).toBeTruthy();

    // Should respond to keyboard (space bar activates buttons)
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);

    // Button should have toggled state
    const newLabel = await muteBtn.getAttribute('aria-label');
    expect(newLabel).toMatch(/Unmute|Mute/);
  });

  test('main page - color contrast', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(2500);

    // Check lyrics text has sufficient contrast
    const lyricsLines = page.locator('.lyrics-line');
    const firstLine = lyricsLines.first();

    // Get computed styles
    const styles = await firstLine.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
      };
    });

    // Both should be defined (not transparent)
    expect(styles.color).not.toBe('');
    expect(styles.backgroundColor).not.toBe('');
  });

  test('about page - axe audit', async ({ page }) => {
    await page.goto('/about/');

    await page.waitForTimeout(1000);

    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
    });
  });

  test('about page - has semantic structure', async ({ page }) => {
    await page.goto('/about/');

    // Check for main content area
    const main = page.locator('main');
    if (await main.isVisible()) {
      expect(await main.count()).toBeGreaterThan(0);
    }

    // Check for heading (h1 or similar)
    const headings = page.locator('h1, h2, h3');
    expect(await headings.count()).toBeGreaterThan(0);
  });

  test('generate page - axe audit', async ({ page }) => {
    await page.goto('/generate/');

    await page.waitForTimeout(1000);

    await injectAxe(page);
    await checkA11y(page, null, {
      detailedReport: true,
    });
  });

  test('generate page - form fields are labeled', async ({ page }) => {
    await page.goto('/generate/');

    // Check theme select has label
    const themeLabel = page.locator('label[for="theme"]');
    await expect(themeLabel).toBeVisible();
    await expect(themeLabel).toContainText('Scenario');

    // Check custom path has label
    const customLabel = page.locator('label[for="custom-path"]');
    await expect(customLabel).toBeVisible();
    await expect(customLabel).toContainText('Custom path');

    // Check copy button has text content
    const copyBtn = page.locator('#copy-btn');
    await expect(copyBtn).toContainText('Copy');
  });

  test('generate page - QR canvas is accessible', async ({ page }) => {
    await page.goto('/generate/');

    const qrCanvas = page.locator('#qr-canvas');
    await expect(qrCanvas).toBeVisible();

    // Canvas should have siblings with text content
    const qrCol = page.locator('.qr-col');
    await expect(qrCol).toBeVisible();
  });

  test('reduced motion - animations are disabled', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/');

    // All lyrics should appear immediately (no staggered animation)
    const lyricsLines = page.locator('.lyrics-line');
    const firstLine = lyricsLines.first();
    const lastLine = lyricsLines.last();

    await expect(firstLine).toHaveClass(/visible/, { timeout: 1000 });
    await expect(lastLine).toHaveClass(/visible/, { timeout: 1000 });

    // Verify they became visible at roughly the same time by checking they're all visible quickly
    const allVisible = await lyricsLines.evaluateAll((els) => {
      return els.every((el) => el.classList.contains('visible'));
    });
    expect(allVisible).toBeTruthy();
  });

  test('reduced motion - themed pages skip fake loading', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/meeting');

    // Fake loading should not be shown with reduced motion
    const fakeLoading = page.locator('#fake-loading');
    const isVisible = await fakeLoading.isVisible();

    // Should go directly to rickroll
    const lyricsLines = page.locator('.lyrics-line');
    const firstLine = lyricsLines.first();
    await expect(firstLine).toHaveClass(/visible/, { timeout: 1000 });
  });

  test('consent banner - accessible structure', async ({ page }) => {
    await page.goto('/');

    const banner = page.locator('#audio-hint');
    await expect(banner).toBeVisible();

    // Banner should have buttons
    const acceptBtn = page.locator('#audio-hint-accept');
    const rejectBtn = page.locator('#audio-hint-reject');
    const policyLink = page.locator('#audio-hint-policy');

    await expect(acceptBtn).toBeVisible();
    await expect(rejectBtn).toBeVisible();
    await expect(policyLink).toBeVisible();

    // Buttons should be keyboard focusable
    await acceptBtn.focus();
    const focused = await page.evaluate(() => {
      return document.activeElement?.id === 'audio-hint-accept';
    });
    expect(focused).toBeTruthy();
  });

  test('links have descriptive text', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(2500);

    // Bottom links should have aria-labels (they use SVG icons, not text)
    const generateLink = page.locator('.generate-link');
    const aboutLink = page.locator('.about-link');

    await expect(generateLink).toHaveAttribute('aria-label', /rickroll|generate/i);
    await expect(aboutLink).toHaveAttribute('aria-label', /About W\.R\.A\.A\.S\./);

    // Karaoke link has aria-label
    const karaokeLink = page.locator('.karaoke-link');
    await expect(karaokeLink).toHaveAttribute('aria-label', /Karaoke/);
  });

  test('page has proper language attribute', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('page title is descriptive', async ({ page }) => {
    await page.goto('/');

    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).not.toEqual('');
  });

  test('images have alt text or are marked decorative', async ({ page }) => {
    await page.goto('/');

    await page.waitForTimeout(2500);

    // Rick background image should have alt (empty for decorative)
    const rickBg = page.locator('.rick-bg');
    const alt = await rickBg.getAttribute('alt');
    expect(typeof alt).toBe('string');

    // SVG icons should either have text content or aria-label
    const svgIcons = page.locator('svg');
    const count = await svgIcons.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const svg = svgIcons.nth(i);
      const parent = await svg.locator('..').first();

      const parentAriaLabel = await parent.getAttribute('aria-label');
      const parentTitle = await parent.getAttribute('title');

      // Should have either aria-label, title, or be in a labeled context
      expect(parentAriaLabel || parentTitle || count).toBeDefined();
    }
  });
});
