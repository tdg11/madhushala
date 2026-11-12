const fs = require('fs');
const path = require('path');

/** Playwright's own browser-download/version-lookup doesn't match the
 * pre-installed Chromium in this sandbox, so resolve the executable
 * directly from PLAYWRIGHT_BROWSERS_PATH instead of letting Playwright guess. */
function resolveExecutablePath() {
  const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(process.env.HOME || '', '.cache/ms-playwright');
  const entries = fs.readdirSync(browsersPath).filter((n) => n.startsWith('chromium-'));
  if (!entries.length) {
    throw new Error(`No chromium-* folder found under ${browsersPath}`);
  }
  entries.sort();
  const dir = entries[entries.length - 1];
  const dirPath = path.join(browsersPath, dir);
  const candidates = ['chrome-linux64', 'chrome-linux'].map((sub) => path.join(dirPath, sub, 'chrome'));
  const execPath = candidates.find((p) => fs.existsSync(p));
  if (!execPath) {
    throw new Error(`No chromium executable found under ${dirPath} (tried: ${candidates.join(', ')})`);
  }
  return execPath;
}

module.exports = { resolveExecutablePath };
