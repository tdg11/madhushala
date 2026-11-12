const { esc, paras, parasBold, bulletList, pageHeader, pageFooter, watermark, htmlShell, fileUrl, ASSETS } = require('./_helpers');
const path = require('path');

function feeLines(lines) {
  return `<div class="fee-box">${lines
    .map(
      (l) => `<div class="fee-line"><span class="fee-line__label">${esc(l.label)}</span><span class="fee-line__value">${esc(l.value)}</span></div>`
    )
    .join('')}</div>`;
}

function categoryCards(categories) {
  return categories
    .map(
      (cat) => `<div class="category-card category-card--highlight">
        <div class="category-card__name">${esc(cat.name)}</div>
        <div class="category-card__desc">${esc(cat.description)}</div>
      </div>`
    )
    .join('');
}

function tierModifier(name) {
  const n = name.toLowerCase();
  if (n.includes('bronze')) return 'bronze';
  if (n.includes('silver')) return 'silver';
  if (n.includes('gold')) return 'gold';
  if (n.includes('platinum')) return 'platinum';
  return 'bronze';
}

function tierCards(tiers) {
  return `<div class="cols-2">${tiers
    .map(
      (t) => `<div class="tier-card tier-card--${tierModifier(t.name)}">
        <div class="tier-card__band">${esc(t.name.toUpperCase())}</div>
        <div class="tier-card__body">${esc(t.description)}</div>
      </div>`
    )
    .join('')}</div>`;
}

const CONTENT_PAGE_TOTAL = 8;

function pageChrome(label, pageNum, sectionLabel, innerHtml, extraStyle = '', extraClass = '') {
  const pageLabel = `Page ${pageNum} of ${CONTENT_PAGE_TOTAL} · ${sectionLabel}`;
  return `
  <div class="page">
    ${watermark()}
    ${pageHeader({ label })}
    <div class="page-body prospectus-content ${extraClass}" style="${extraStyle}">
      ${innerHtml}
    </div>
    ${pageFooter({ pageLabel })}
  </div>`;
}

function blankPage() {
  return `<div class="page"></div>`;
}

// Full width, like the green cta-panels. A handful of the submitted photos
// are too close to square to run edge-to-edge at their native aspect ratio
// without towering over the page, so this crops (object-fit: cover) to a
// fixed banner height instead of stretching — object-position is tuned per
// photo so the crop doesn't cut off the people in it.
function photoBanner(url, heightPx, objectPosition = 'center') {
  return `<div style="border-radius:10px; overflow:hidden;">
    <img src="${url}" style="display:block; width:100%; height:${heightPx}px; object-fit:cover; object-position:${objectPosition};">
  </div>`;
}

// Full-bleed variant: for use on a page whose .page-body has its side
// padding zeroed out, so this can just sit at 100% width with no margin
// tricks — safer under Chromium's print pagination than negative-margin
// bleeds. A soft shadow at the top/bottom seams makes the bleed read as
// deliberate.
function photoBannerBleed(url, heightPx, objectPosition = 'center') {
  return `<div style="box-shadow: 0 -10px 16px -12px rgba(41,20,16,0.5), 0 10px 16px -12px rgba(41,20,16,0.5);">
    <img src="${url}" style="display:block; width:100%; height:${heightPx}px; object-fit:cover; object-position:${objectPosition};">
  </div>`;
}

// Standard gap this design already uses between a cta-panel and the footer
// below it (--body-pad-y) — reused so a photo sitting above a cta-panel reads
// as the same rhythm as everywhere else.
const PANEL_GAP = 34;

module.exports = function render(data) {
  const cover = data.cover;
  const crestFull = fileUrl(path.join(ASSETS, 'crest-logo.png'));
  const coverPageBg = fileUrl(path.join(ASSETS, 'cover-page-bg.png'));
  const closingPageBg = fileUrl(path.join(ASSETS, 'closing-page-bg.png'));
  const photoCohort = fileUrl(path.join(ASSETS, 'photo-cohort-founder.jpg'));
  const photoManishaSpeaking = fileUrl(path.join(ASSETS, 'photo-manisha-speaking.jpg'));
  const photoWineClink = fileUrl(path.join(ASSETS, 'photo-wine-clink.jpg'));
  const photoGoaBanner = fileUrl(path.join(ASSETS, 'photo-goa-banner.jpg'));
  const founderPortrait = fileUrl(path.join(ASSETS, 'founder-portrait-prospectus.jpg'));

  const coverPage = `
  <div class="page" style="align-items:center; justify-content:center;">
    <img src="${coverPageBg}" style="position:absolute; inset:0; width:100%; height:100%; z-index:0;">
    <div style="position:relative; flex:1 1 auto; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding: 0 24mm; z-index:1;">
      <div style="width:85.4mm; height:85.4mm; margin-bottom:12mm; visibility:hidden;"></div>
      <p class="eyebrow" style="margin:0 0 6mm; letter-spacing:0.28em; font-size:16px;">${esc(cover.docLabel)}</p>
      <h1 class="doc-title" style="font-size:27px; color: var(--color-cream); margin-bottom:8mm;">
        ${cover.wordmarkLines.map(esc).join('<br>')}
      </h1>
      <div style="width:18mm; height:1px; background: var(--color-gold); margin-bottom:8mm;"></div>
      <p class="tagline" style="font-style:normal; text-transform:uppercase; letter-spacing:0.1em; font-size:12px; color: rgba(251,247,239,0.75); margin:0;">${esc(cover.tagline)}</p>
    </div>
  </div>`;

  // Page 1 of 8 (Introduction): vision sits above the photo, and the photo
  // runs full-bleed edge-to-edge for impact.
  const page2 = pageChrome(
    data.documentLabel,
    1,
    'Introduction',
    `
    <div style="padding: 0 var(--page-margin);">
      <h2 class="section-title">${esc(data.page2.heading)}</h2>
      ${parasBold(data.page2.paragraphs, [3])}
    </div>
    <div>
      <div class="cta-panel" style="margin: 0 var(--page-margin) ${PANEL_GAP}px;">
        <p class="eyebrow" style="margin-bottom:4px;">${esc(data.page2.vision.heading)}</p>
        <p style="margin:0;">${esc(data.page2.vision.text)}</p>
      </div>
      ${photoBannerBleed(photoGoaBanner, 320)}
    </div>`,
    'padding-left:0; padding-right:0;',
    'anchored'
  );

  // Page 2 of 8 (About & Founder): compact rounded portrait sits beside the
  // name/role/credentials row, with bio paragraphs running full-width below.
  const page3 = pageChrome(
    data.documentLabel,
    2,
    'About & Founder',
    `
    <h2 class="section-title">${esc(data.page3.about.heading)}</h2>
    ${parasBold(data.page3.about.paragraphs, [2])}
    <hr class="rule-gold">
    <h2 class="section-title">${esc(data.page3.founder.heading)}</h2>
    <div style="display:flex; gap:20px; align-items:center; margin-bottom:14px;">
      <img src="${founderPortrait}" style="flex:0 0 auto; width:216px; height:250px; object-fit:cover; object-position:center bottom; border-radius:14px;">
      <div>
        <h3 class="subsection-title" style="font-size:22px; margin-bottom:3px;">${esc(data.page3.founder.name)}</h3>
        <p class="secondary" style="font-size:12px; margin-bottom:9px;">${esc(data.page3.founder.role)}</p>
        <div>
          ${data.page3.founder.credentialTags.map((t) => `<span class="tag" style="margin-right:6px; margin-bottom:4px; display:inline-block;">${esc(t)}</span>`).join('')}
        </div>
      </div>
    </div>
    ${paras(data.page3.founder.paragraphs)}
    <p class="signature" style="font-size:14px; margin-top:6px;">${esc(data.page3.founder.pullQuote)}</p>`
  );

  const page4 = pageChrome(
    data.documentLabel,
    3,
    'Why This Matters',
    `
    <h2 class="section-title">${esc(data.page4.heading)}</h2>
    ${paras(data.page4.paragraphs)}
    ${bulletList(data.page4.bullets)}
    ${parasBold(data.page4.afterParagraphs, [0])}
    <div class="cols-3" style="margin-top:6px;">
      ${data.page4.industries
        .map((ind) => `<span class="tag" style="text-align:center;">${esc(ind)}</span>`)
        .join('')}
    </div>`
  );

  // Page 4 of 8 (Scholarship Programme): category boxes coloured, and the
  // Manisha-speaking photo anchored to the bottom of the page.
  const page5 = pageChrome(
    data.documentLabel,
    4,
    'Scholarship Programme',
    `
    <div>
      <h2 class="section-title">${esc(data.page5.heading)}</h2>
      ${parasBold(data.page5.paragraphs, [2])}
      <h3 class="subsection-title" style="margin-top:14px; margin-bottom:12px;">${esc(data.page5.categoriesHeading)}</h3>
      ${categoryCards(data.page5.categories)}
      <p class="secondary" style="margin-top:8px;">${esc(data.page5.closing)}</p>
    </div>
    ${photoBanner(photoManishaSpeaking, 310)}`,
    '',
    'anchored'
  );

  // Page 5 of 8 (Why Become a Partner): cohort photo anchored to the bottom.
  const page6 = pageChrome(
    data.documentLabel,
    5,
    'Why Become a Partner',
    `
    <div>
      <h2 class="section-title">${esc(data.page6.heading)}</h2>
      ${parasBold(data.page6.paragraphs, [1])}
      ${bulletList(data.page6.bullets, 'styled-list check-list')}
      <p style="margin-top:10px;">${esc(data.page6.closing)}</p>
    </div>
    ${photoBanner(photoCohort, 310)}`,
    '',
    'anchored'
  );

  // Page 6 of 8 (Sponsorship Tiers): metallic tier finishes, and the course
  // fees highlighted in a boxed callout.
  const page7 = pageChrome(
    data.documentLabel,
    6,
    'Sponsorship Tiers',
    `
    <h2 class="section-title">${esc(data.page7.heading)}</h2>
    <p>${esc(data.page7.intro)}</p>
    ${tierCards(data.page7.tiers)}
    <p style="margin-top:4px;"><strong>${esc(data.page7.longTermNote)}</strong></p>
    <h3 class="subsection-title" style="margin-top:10px;">${esc(data.page7.fees.heading)}</h3>
    ${feeLines(data.page7.fees.lines)}
    <h2 class="section-title" style="margin-top:12px;">${esc(data.page7.recognition.heading)}</h2>
    <p>${esc(data.page7.recognition.intro)}</p>
    ${bulletList(data.page7.recognition.bullets, 'styled-list pale-list')}
    ${data.page7.recognition.closingNotes.map((n) => `<p style="margin-bottom:3px;">${esc(n)}</p>`).join('')}`
  );

  // Page 7 of 8 (Selection & Governance): the "readable" modifier bumps
  // font size / line-height / bullet markers for older readers, while
  // staying on the dense base scale so the page still fits.
  const page8 = pageChrome(
    data.documentLabel,
    7,
    'Selection & Governance',
    `
    <h2 class="section-title">${esc(data.page8.heading)}</h2>
    ${parasBold(data.page8.intro, [0])}
    ${bulletList(data.page8.assessedOn)}

    <h3 class="subsection-title" style="margin-top:8px;">${esc(data.page8.eligibility.heading)}</h3>
    <p class="secondary">${esc(data.page8.eligibility.intro)}</p>
    ${bulletList(data.page8.eligibility.bullets)}

    <h3 class="subsection-title" style="margin-top:8px;">${esc(data.page8.conditions.heading)}</h3>
    ${bulletList(data.page8.conditions.bullets)}

    <h3 class="subsection-title" style="margin-top:8px;">${esc(data.page8.preference.heading)}</h3>
    ${bulletList(data.page8.preference.bullets)}

    <h3 class="subsection-title" style="margin-top:8px;">${esc(data.page8.expectations.heading)}</h3>
    ${bulletList(data.page8.expectations.bullets, 'styled-list check-list')}

    <p class="secondary" style="margin-top:6px;">${esc(data.page8.closing)}</p>`,
    '',
    'dense readable'
  );

  const c9 = data.page9.contact;
  const page9 = pageChrome(
    data.documentLabel,
    8,
    'Contact',
    `
    <div style="padding: 0 var(--page-margin);">
      <h2 class="section-title">${esc(data.page9.heading)}</h2>
      ${paras(data.page9.paragraphs)}
      <div style="margin: 4px 0 10px;">
        ${data.page9.representLines.map((l) => `<p style="margin:0 0 3px;">${esc(l)}</p>`).join('')}
      </div>
      ${parasBold(data.page9.closingParagraphs, [2])}
    </div>
    <div>
      <div class="cta-panel" style="margin: 0 var(--page-margin) ${PANEL_GAP}px;">
        <p class="eyebrow" style="margin-bottom:4px;">${esc(c9.heading)}</p>
        <p class="signature" style="font-size:16px; margin-bottom:2px;">${esc(c9.name)}</p>
        <p style="margin:0 0 8px; color: rgba(251,247,239,0.88);">${esc(c9.org)} — ${esc(c9.role)}</p>
        <p style="margin:0; font-size:12px; color: rgba(251,247,239,0.75);">${esc(c9.address)}<br>${esc(c9.phone)} &nbsp;|&nbsp; ${esc(c9.email)}</p>
      </div>
      ${photoBannerBleed(photoWineClink, 190)}
    </div>`,
    'padding-left:0; padding-right:0;',
    'anchored'
  );

  const closingPage = `
  <div class="page" style="align-items:center; justify-content:center;">
    <img src="${closingPageBg}" style="position:absolute; inset:0; width:100%; height:100%; z-index:0;">
    <div style="position:relative; flex:1 1 auto; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; z-index:1;">
      <div style="width:43mm; height:43mm; margin-bottom:8mm; visibility:hidden;"></div>
      <p class="eyebrow" style="color: var(--color-gold); margin:0 0 6mm; font-size:14px; letter-spacing:0.2em;">Madhushala by Mata</p>
      <p style="font-family: var(--font-body); font-size:13px; color: rgba(251,247,239,0.75); letter-spacing:0.04em; margin:0 0 10mm;">A WSET Approved Programme Provider</p>
      <div style="width:14mm; height:1px; background: var(--color-gold); margin-bottom:8mm;"></div>
      <p style="font-family: var(--font-body); font-size:10px; color: rgba(251,247,239,0.65); letter-spacing:0.06em; text-transform:uppercase; margin:0;">&copy; 2026 Madhushala by Mata &middot; All Rights Reserved</p>
    </div>
  </div>`;

  return htmlShell({
    title: 'Sponsorship Prospectus — Madhushala by Mata',
    body: coverPage + blankPage() + page2 + page3 + page4 + page5 + page6 + page7 + page8 + page9 + blankPage() + closingPage,
  });
};
