const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { resolveExecutablePath } = require('./_chromium');

const ROOT = path.resolve(__dirname, '..');
const DIST_HTML = path.join(ROOT, 'dist', 'html');

async function checkFile(browser, htmlPath) {
  const page = await browser.newPage();
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });

  const results = await page.evaluate(() => {
    const pages = Array.from(document.querySelectorAll('.page'));
    return pages.map((pg, i) => {
      const pageRect = pg.getBoundingClientRect();
      const body = pg.querySelector('.page-body');
      let overflow = false;
      let contentBottom = null;
      let fillRatio = null;
      if (body) {
        overflow = body.scrollHeight > body.clientHeight + 1;
        const lastChild = body.lastElementChild;
        if (lastChild) {
          const lastRect = lastChild.getBoundingClientRect();
          contentBottom = lastRect.bottom - body.getBoundingClientRect().top;
          fillRatio = contentBottom / body.clientHeight;
        }
      }
      return {
        index: i + 1,
        pageHeightPx: Math.round(pageRect.height),
        bodyOverflow: overflow,
        fillRatio: fillRatio ? Number(fillRatio.toFixed(2)) : null,
      };
    });
  });

  await page.close();
  return results;
}

async function main() {
  const files = fs.readdirSync(DIST_HTML).filter((f) => f.endsWith('.html'));
  const executablePath = resolveExecutablePath();
  const browser = await chromium.launch({ executablePath });

  let hadIssue = false;
  try {
    for (const f of files) {
      const results = await checkFile(browser, path.join(DIST_HTML, f));
      console.log(`\n${f}`);
      for (const r of results) {
        const flags = [];
        if (r.bodyOverflow) flags.push('OVERFLOW');
        if (flags.length) hadIssue = true;
        console.log(
          `  page ${r.index}: height=${r.pageHeightPx}px fillRatio=${r.fillRatio} ${flags.length ? '=> ' + flags.join(', ') : 'OK'}`
        );
      }
    }
  } finally {
    await browser.close();
  }

  if (hadIssue) {
    console.log('\nSome pages overflow their page box (content will be clipped) — see OVERFLOW flags above.');
    process.exitCode = 1;
  } else {
    console.log('\nNo page overflows its box. (fillRatio is informational only — low values on short pages are expected.)');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
