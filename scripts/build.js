const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { resolveExecutablePath } = require('./_chromium');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const DIST_HTML = path.join(DIST, 'html');

const DOCS = [
  { name: 'sponsorship-prospectus', template: 'prospectus.template.js', content: 'prospectus.json' },
];

async function main() {
  fs.mkdirSync(DIST, { recursive: true });
  fs.mkdirSync(DIST_HTML, { recursive: true });

  const executablePath = resolveExecutablePath();
  const browser = await chromium.launch({ executablePath });

  try {
    for (const doc of DOCS) {
      const render = require(path.join(ROOT, 'src/templates', doc.template));
      const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content', doc.content), 'utf8'));
      const html = render(data);

      const htmlPath = path.join(DIST_HTML, `${doc.name}.html`);
      fs.writeFileSync(htmlPath, html, 'utf8');

      const page = await browser.newPage();
      await page.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
      await page.pdf({
        path: path.join(DIST, `${doc.name}.pdf`),
        printBackground: true,
        preferCSSPageSize: true,
      });
      await page.close();
      console.log('built dist/' + doc.name + '.pdf');
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
