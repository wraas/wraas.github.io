import { test, expect } from '@playwright/test';

test.describe('Link Generator (/generate/) Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/generate/');
    // Wait for page to fully load
    await page.waitForTimeout(500);
  });

  test('scenario selection updates preview text', async ({ page }) => {
    const themeSelect = page.locator('#theme');
    const previewTitle = page.locator('#preview-title');
    const previewDesc = page.locator('#preview-desc');

    // Initial state - no theme
    let titleText = await previewTitle.textContent();
    expect(titleText).toEqual('Important Notice — Action Required');

    // Select meeting theme
    await themeSelect.selectOption('meeting');
    await page.waitForTimeout(300);

    titleText = await previewTitle.textContent();
    expect(titleText).toEqual("You've been invited to a meeting");

    // Select document theme
    await themeSelect.selectOption('document');
    await page.waitForTimeout(300);

    titleText = await previewTitle.textContent();
    expect(titleText).toEqual('Shared Document — Review Required');
  });

  test('scenario selection updates pun text', async ({ page }) => {
    const themeSelect = page.locator('#theme');
    const previewPun = page.locator('#preview-pun');

    // Select meeting theme
    await themeSelect.selectOption('meeting');
    await page.waitForTimeout(300);

    const punText = await previewPun.textContent();
    expect(punText).toContain("This meeting could've been an email");
  });

  test('custom path input generates correct URL', async ({ page }) => {
    const customPath = page.locator('#custom-path');
    const outputUrl = page.locator('#output-url');

    // Type custom path
    await customPath.fill('quarterly-review');

    // Check output URL
    const urlText = await outputUrl.textContent();
    expect(urlText).toContain('quarterly-review');
    expect(urlText).toContain(page.url().split('/generate')[0]); // Should contain base URL
  });

  test('custom path with theme keyword triggers theme preview', async ({ page }) => {
    const customPath = page.locator('#custom-path');
    const previewTitle = page.locator('#preview-title');

    // Type custom path with "meeting" keyword
    await customPath.fill('team-meeting-q1');

    // Preview should show meeting theme
    const titleText = await previewTitle.textContent();
    expect(titleText).toEqual("You've been invited to a meeting");
  });

  test('copy button copies URL to clipboard', async ({ page, context }) => {
    const copyBtn = page.locator('#copy-btn');
    const outputUrl = page.locator('#output-url');

    // Get the URL text
    const urlText = await outputUrl.textContent();

    // Grant clipboard permission
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Click copy button
    await copyBtn.click();

    // Check clipboard content
    const clipboardText = await page.evaluate(async () => {
      return await navigator.clipboard.readText();
    });

    expect(clipboardText).toEqual(urlText);
  });

  test('copy button shows feedback', async ({ page }) => {
    const copyBtn = page.locator('#copy-btn');

    // Initial state
    let btnText = await copyBtn.textContent();
    expect(btnText).toEqual('Copy');
    expect(copyBtn).not.toHaveClass(/copied/);

    // Click copy button
    await copyBtn.click();
    await page.waitForTimeout(300);

    // Should show "Copied!"
    btnText = await copyBtn.textContent();
    expect(btnText).toEqual('Copied!');
    await expect(copyBtn).toHaveClass(/copied/);

    // Wait for feedback to disappear
    await page.waitForTimeout(2000);

    btnText = await copyBtn.textContent();
    expect(btnText).toEqual('Copy');
    expect(copyBtn).not.toHaveClass(/copied/);
  });

  test('QR code canvas is rendered non-empty', async ({ page }) => {
    const qrCanvas = page.locator('#qr-canvas');

    // Canvas should be visible
    await expect(qrCanvas).toBeVisible();

    // Canvas should have width and height
    const width = await qrCanvas.getAttribute('width');
    const height = await qrCanvas.getAttribute('height');

    expect(Number(width)).toBeGreaterThan(0);
    expect(Number(height)).toBeGreaterThan(0);

    // Canvas should have pixel data (not empty)
    const hasData = await qrCanvas.evaluate((canvas) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // Check if any pixel is not white/transparent (white is 255,255,255)
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
          return true; // Found non-white pixel
        }
      }
      return false;
    });

    expect(hasData).toBeTruthy('QR code should have rendered data');
  });

  test('QR code updates when URL changes', async ({ page }) => {
    const qrCanvas = page.locator('#qr-canvas');

    // Get initial QR data
    const initialData = await qrCanvas.evaluate((canvas) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return JSON.stringify(imageData.data.slice(0, 100)); // First 100 bytes
    });

    // Change custom path
    const customPath = page.locator('#custom-path');
    await customPath.fill('different-path');
    await page.waitForTimeout(300);

    // Get new QR data
    const newData = await qrCanvas.evaluate((canvas) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return JSON.stringify(imageData.data.slice(0, 100));
    });

    // QR codes should be different
    expect(newData).not.toEqual(initialData);
  });

  test('suggestion chips appear when theme is selected', async ({ page }) => {
    const themeSelect = page.locator('#theme');
    const suggestionsDiv = page.locator('#suggestions');
    const chipsDiv = page.locator('#suggestion-chips');

    // Initially hidden
    await expect(suggestionsDiv).not.toBeVisible();

    // Select meeting theme
    await themeSelect.selectOption('meeting');
    await page.waitForTimeout(300);

    // Suggestions should appear
    await expect(suggestionsDiv).toBeVisible();

    // Should have chips
    const chips = page.locator('.suggestion-chip');
    expect(await chips.count()).toBeGreaterThan(0);

    // Check chip content
    const firstChip = chips.first();
    const chipText = await firstChip.textContent();
    expect(chipText?.length || 0).toBeGreaterThan(0);
  });

  test('clicking suggestion chip fills custom path input', async ({ page }) => {
    const themeSelect = page.locator('#theme');
    const customPath = page.locator('#custom-path');

    // Select meeting theme to show suggestions
    await themeSelect.selectOption('meeting');
    await page.waitForTimeout(300);

    // Get first suggestion chip
    const firstChip = page.locator('.suggestion-chip').first();
    const chipText = await firstChip.textContent();

    // Click the chip
    await firstChip.click();
    await page.waitForTimeout(300);

    // Custom path should be filled with chip text
    const inputValue = await customPath.inputValue();
    expect(inputValue).toEqual(chipText);
  });

  test('all theme options show correct suggestions', async ({ page }) => {
    const themeSelect = page.locator('#theme');

    const themes = [
      'meeting',
      'document',
      'password-reset',
      'invoice',
      'survey',
      'clickbait',
      'karaoke',
    ];

    for (const theme of themes) {
      await themeSelect.selectOption(theme);
      await page.waitForTimeout(300);

      // Suggestions should appear
      const suggestionsDiv = page.locator('#suggestions');
      await expect(suggestionsDiv).toBeVisible();

      // Should have at least one chip
      const chips = page.locator('.suggestion-chip');
      expect(await chips.count()).toBeGreaterThanOrEqual(1);
    }
  });

  test('theme select and custom path work together', async ({ page }) => {
    const themeSelect = page.locator('#theme');
    const customPath = page.locator('#custom-path');
    const previewTitle = page.locator('#preview-title');
    const outputUrl = page.locator('#output-url');

    // Select meeting theme
    await themeSelect.selectOption('meeting');
    await page.waitForTimeout(300);

    // Add custom path that contains "document"
    await customPath.fill('urgent-document-review');

    // Preview should switch to document theme (custom keyword takes precedence)
    const titleText = await previewTitle.textContent();
    expect(titleText).toEqual('Shared Document — Review Required');

    // URL should contain custom path
    const urlText = await outputUrl.textContent();
    expect(urlText).toContain('urgent-document-review');
  });

  test('QR download button works', async ({ page }) => {
    const qrDownload = page.locator('#qr-download');

    // Button should be visible
    await expect(qrDownload).toBeVisible();
    await expect(qrDownload).toContainText('Save as PNG');

    // Set up download promise
    const downloadPromise = page.waitForEvent('download');

    // Click download button
    await qrDownload.click();

    // Wait for download
    const download = await downloadPromise;

    // Check filename
    expect(download.suggestedFilename()).toBe('rickroll-qr.png');
  });

  test('output URL updates when switching between themes', async ({ page }) => {
    const themeSelect = page.locator('#theme');
    const outputUrl = page.locator('#output-url');

    // Select meeting theme
    await themeSelect.selectOption('meeting');
    await page.waitForTimeout(300);

    let urlText = await outputUrl.textContent();
    expect(urlText).toContain('meeting');

    // Switch to document
    await themeSelect.selectOption('document');
    await page.waitForTimeout(300);

    urlText = await outputUrl.textContent();
    expect(urlText).toContain('document');
  });

  test('preview domain shows current host', async ({ page }) => {
    const previewDomain = page.locator('#preview-domain');

    // Should display the current host
    const domainText = await previewDomain.textContent();
    expect(domainText).toContain('localhost');
  });

  test('custom path sanitizes input', async ({ page }) => {
    const customPath = page.locator('#custom-path');
    const outputUrl = page.locator('#output-url');

    // Type path with special characters
    await customPath.fill('test@#$%path!with/special');

    // URL should be sanitized (only alphanumeric, hyphens, underscores allowed)
    const urlText = await outputUrl.textContent();

    // Should not contain the special characters
    expect(urlText).not.toContain('@');
    expect(urlText).not.toContain('#');
    expect(urlText).not.toContain('!');
  });

  test('direct rickroll option (no theme) generates base URL', async ({ page }) => {
    const themeSelect = page.locator('#theme');
    const customPath = page.locator('#custom-path');
    const outputUrl = page.locator('#output-url');
    const baseURL = page.url().split('/generate')[0];

    // Ensure no theme is selected
    await themeSelect.selectOption('');
    await page.waitForTimeout(300);

    // Clear custom path
    await customPath.fill('');

    // URL should be base URL
    let urlText = await outputUrl.textContent();
    expect(urlText).toEqual(baseURL + '/');

    // Add custom path
    await customPath.fill('my-rickroll');

    // URL should have custom path
    urlText = await outputUrl.textContent();
    expect(urlText).toEqual(baseURL + '/my-rickroll');
  });

  test('preview card shows all expected fields', async ({ page }) => {
    const previewTitle = page.locator('#preview-title');
    const previewDesc = page.locator('#preview-desc');
    const previewPun = page.locator('#preview-pun');
    const previewDomain = page.locator('#preview-domain');

    // All fields should be present and visible
    await expect(previewTitle).toBeVisible();
    await expect(previewDesc).toBeVisible();
    await expect(previewPun).toBeVisible();
    await expect(previewDomain).toBeVisible();

    // Should have content
    expect(await previewTitle.textContent()).not.toEqual('');
    expect(await previewDesc.textContent()).not.toEqual('');
    expect(await previewDomain.textContent()).not.toEqual('');
  });
});
