---
name: playwright-e2e-automation
description: Build resilient, deterministic end-to-end browser tests, visual regression suites, and automated user flows with Playwright.
---

# Playwright E2E Automation

This skill provides architectural best practices for creating robust, flake-free browser automation and visual verification tests using Playwright.

## Key Principles

1. **User-Visible Locators**:
   - Prefer role locators (`getByRole('button', { name: 'Submit' })`) and text locators (`getByText`).
   - Avoid brittle CSS selectors or XPath paths that break during UI refactoring.
2. **Auto-Waiting Over Hard Sleeps**:
   - Never use `page.waitForTimeout()` in production test suites.
   - Rely on Playwright's built-in web-first assertions (`expect(locator).toBeVisible()`).
3. **Hermetic State & Fixtures**:
   - Isolate tests using fresh browser contexts.
   - Mock flaky third-party external networks with `page.route()`.
4. **Visual Regression & Tracing**:
   - Capture video and trace archives on test failures (`trace: 'retain-on-failure'`).
   - Perform pixel-level snapshot testing with defined tolerance thresholds.

## Multimodal Visual UI Debugging & AI Vision Loop

When an end-to-end test fails or a user reports layout corruption, use Playwright's visual capture primitives alongside multimodal LLM inspection:

### 1. Automated Failure Snapshot Capture

Configure Playwright to capture full-page and element-level screenshots along with DOM state on any assertion failure:

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
});

// Custom test wrapper for visual defect inspection
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const screenshotPath = testInfo.outputPath('visual-failure.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    // Dump computed layout metrics for overlapping elements
    const layoutContext = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        classes: el.className,
        box: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        overflow: style.overflow,
        display: style.display,
        zIndex: style.zIndex,
      };
    });
    console.log('LAYOUT_DEBUG_CONTEXT:', JSON.stringify(layoutContext));
  }
});
```

### 2. The Multimodal Vision Feedback Loop

Feed the visual artifacts directly into a multimodal agent:

1. **Capture Visual State**: Collect `visual-failure.png` + current HTML snippet + `LAYOUT_DEBUG_CONTEXT`.
2. **Vision Analysis Prompt**:
   ```text
   Review the attached screenshot of the failed UI component at 1280x800.
   Identify:
   - Visual clipping, unwanted horizontal scrollbars, or text overlapping.
   - Contrast ratio or accessibility violations.
   - Broken flex/grid alignments compared to the intended spec.
   Recommend precise CSS/Tailwind changes to resolve the visual defect.
   ```
3. **Patch Application**: Apply the targeted CSS or markup fix.
4. **Replay & Visual Verification**: Re-run the Playwright test with `--update-snapshots` or assert visual stability with `expect(page).toHaveScreenshot({ maxDiffPixelRatio: 0.02 })`.

### 3. Anti-Flake Visual Invariants

- **Freeze CSS Animations**: Disable transitions and CSS animations before capturing screenshots (`await page.emulateMedia({ reducedMotion: 'reduce' })`).
- **Font Rendering Normalization**: Use deterministic system fonts or await web fonts with `await page.evaluate(() => document.fonts.ready)`.
- **Mask Dynamic Content**: Mask dynamic dates, random IDs, or avatar URLs using `mask: [page.locator('.timestamp'), page.locator('.avatar')]`.

