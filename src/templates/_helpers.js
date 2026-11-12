const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const ASSETS = path.resolve(ROOT, 'assets');
const STYLES = path.resolve(ROOT, 'src/styles');

function fileUrl(absPath) {
  return 'file://' + absPath.split(path.sep).join('/');
}

function esc(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function paras(arr) {
  return (arr || []).map((p) => `<p>${esc(p)}</p>`).join('\n');
}

/** Same as paras(), but bolds specific sentences already present verbatim in
 * the content — used to give "important statements" visual weight without
 * inventing or altering any copy. */
function parasBold(arr, boldIndices = []) {
  return (arr || [])
    .map((p, i) => (boldIndices.includes(i) ? `<p><strong>${esc(p)}</strong></p>` : `<p>${esc(p)}</p>`))
    .join('\n');
}

function bulletList(arr, className = 'styled-list') {
  return `<ul class="${className}">${(arr || [])
    .map((li) => `<li>${esc(li)}</li>`)
    .join('')}</ul>`;
}

function styleSheets() {
  return `
  <link rel="stylesheet" href="${fileUrl(path.join(STYLES, 'tokens.css'))}">
  <link rel="stylesheet" href="${fileUrl(path.join(STYLES, 'base.css'))}">
  <link rel="stylesheet" href="${fileUrl(path.join(STYLES, 'components.css'))}">`;
}

/** Header used at the top of every printed page. */
function pageHeader({ label }) {
  return `
  <div class="page-header">
    <div class="page-header__brand">
      <img class="page-header__crest" src="${fileUrl(path.join(ASSETS, 'crest-logo.png'))}" alt="">
      <div class="page-header__wordmark">Madhushala By Mata<strong>Wine Education Scholarship Programme</strong></div>
    </div>
    <div class="page-header__label">${esc(label)}</div>
  </div>`;
}

/** Footer used at the bottom of every printed page. The document name
 * already appears in the header label, so the footer only repeats the
 * page number/section and contact details. */
function pageFooter({ pageLabel, phone = '+91 9823948247', email = 'mata@madhushalabymata.com' }) {
  return `
  <div class="page-footer">
    <div>${esc(pageLabel)}</div>
    <div class="page-footer__contact">${esc(phone)} &nbsp;|&nbsp; ${esc(email)}</div>
  </div>`;
}

function watermark() {
  return `<img class="page-watermark" src="${fileUrl(path.join(ASSETS, 'crest-logo.png'))}" alt="">`;
}

function htmlShell({ title, body }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
${styleSheets()}
</head>
<body>
${body}
</body>
</html>`;
}

module.exports = { esc, paras, parasBold, bulletList, pageHeader, pageFooter, watermark, htmlShell, fileUrl, ASSETS };
