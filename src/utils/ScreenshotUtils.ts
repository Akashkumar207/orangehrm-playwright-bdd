import fs from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';

const SCREENSHOTS_DIR = 'screenshots';

function sanitize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * Captures a screenshot with a human-readable, collision-free filename —
 * e.g. "login-fails-with-an-invalid-password-failure-2026-09-03T10-15-00.png"
 * — instead of Playwright's own internal hashed failure-screenshot name.
 *
 * This is separate from `BasePage.takeScreenshot()`: that one is for a page
 * object to grab an ad-hoc screenshot mid-test with a caller-chosen name;
 * this one is specifically for the "capture evidence on failure" hook in
 * `test.fixture.ts`, named after the failing test itself.
 */
export class ScreenshotUtils {
  static async captureFailure(page: Page, testTitle: string): Promise<string> {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    const fileName = `${sanitize(testTitle)}-failure-${timestamp()}.png`;
    const filePath = path.join(SCREENSHOTS_DIR, fileName);
    await page.screenshot({ path: filePath, fullPage: true });
    return filePath;
  }
}
