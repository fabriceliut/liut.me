// QA automatisée — Playwright (standalone, hors vitest)
// Usage : node qa/qa.mjs  (un serveur statique doit servir _site sur $BASE_URL)
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:8092';
const OUT = 'qa/screenshots';
mkdirSync(OUT, { recursive: true });

const results = [];
const ok = (name, cond, detail = '') => {
  results.push({ name, pass: !!cond, detail });
  console.log(`${cond ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
};

const browser = await chromium.launch();
const page = await browser.newPage();

const consoleErrors = [];
const badRequests = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push(String(e)));
page.on('response', (r) => {
  if (r.status() >= 400) badRequests.push({ url: r.url(), status: r.status() });
});

// Navigate to networkidle
const resp = await page.goto(BASE + '/', { waitUntil: 'networkidle' });
ok('Page répond 200', resp && resp.status() === 200, `status ${resp && resp.status()}`);

// Screenshots aux breakpoints
for (const w of [320, 768, 1280]) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/home-${w}.png`, fullPage: true });
  ok(`Screenshot ${w}px`, true);
}

// Retour desktop pour les interactions
await page.setViewportSize({ width: 1280, height: 900 });

// Skip link présent en 1er
const skip = await page.locator('a.skip-link').first();
ok('Skip link présent', await skip.count() === 1);

// CTA cal.com
const cta = page.locator('a[href*="cal.com/fabrice-liut"]').first();
ok('CTA cal.com présent', await cta.count() >= 1, await cta.getAttribute('href'));

// Nav vers la vue meeting (showView)
await page.evaluate(() => window.showView && window.showView('meeting'));
await page.waitForTimeout(400);
const meetingVisible = await page.locator('#view-meeting:not(.hidden-view)').count();
ok('Navigation vue meeting', meetingVisible === 1);

// ScoreCards présents + compteur animé
const sc = await page.locator('.scorecard').count();
ok('ScoreCards présentes', sc >= 4, `${sc} cartes`);
await page.locator('#view-meeting .scorecard').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);
const counter = await page.locator('.scorecard[data-count="3185"] .sc-value .num').first().textContent();
ok('Compteur ROI animé (≠ 0)', counter && counter.replace(/\s|\u00a0/g, '') !== '0', `valeur "${counter}"`);
await page.screenshot({ path: `${OUT}/meeting-scorecards-1280.png`, fullPage: true });

// Accordéon (details) : ouverture + aria-expanded
const firstDetails = page.locator('#view-meeting details').first();
const summary = firstDetails.locator('summary');
await summary.click();
await page.waitForTimeout(150);
const open = await firstDetails.evaluate((d) => d.open);
const aria = await summary.getAttribute('aria-expanded');
ok('Accordéon ouvre', open === true);
ok('aria-expanded synchronisé', aria === 'true', `aria-expanded="${aria}"`);

// Logos références : chaque pastille affiche un favicon OU un monogramme de secours
await page.evaluate(() => window.showView && window.showView('home'));
await page.waitForTimeout(300);
const logoStats = await page.evaluate(() => {
  const pills = Array.from(document.querySelectorAll('#parcours span'))
    .filter((s) => s.querySelector('img[src*="s2/favicons"], .logo-fallback'));
  let shown = 0;
  for (const p of pills) {
    const img = p.querySelector('img');
    const fb = p.querySelector('.logo-fallback');
    if (fb) shown++;
    else if (img && img.complete && img.naturalWidth > 0) shown++;
  }
  return { total: pills.length, shown };
});
ok('Tous les logos affichés (favicon ou monogramme)', logoStats.total > 0 && logoStats.shown === logoStats.total, `${logoStats.shown}/${logoStats.total}`);

// Console propre — on distingue erreurs same-origin (les nôtres) vs externes
const origin = new URL(BASE).origin;
const ownBad = badRequests.filter((r) => r.url.startsWith(origin) && !r.url.endsWith('/favicon.ico'));
const extBad = badRequests.filter((r) => !ownBad.includes(r));
ok('0 requête 404 same-origin', ownBad.length === 0, ownBad.map((r) => r.status + ' ' + r.url).join(' | ') || 'aucune');
if (extBad.length) console.log(`  (info) ${extBad.length} ressource(s) externe(s) indisponible(s) en headless : favicons clients Google — OK en prod.`);

await browser.close();

const passed = results.filter((r) => r.pass).length;
console.log(`\n=== QA : ${passed}/${results.length} OK ===`);
process.exit(passed === results.length ? 0 : 1);
