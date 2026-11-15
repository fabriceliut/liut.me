// QA automatisée — Playwright (standalone)
// Usage : node qa/qa.mjs (un serveur statique doit servir _site sur $BASE_URL)
import { chromium } from 'playwright';
import { mkdirSync, existsSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:8092';
const OUT = 'qa/screenshots';
mkdirSync(OUT, { recursive: true });
const results = [];
const ok = (name, cond, detail = '') => {
  results.push({ name, pass: !!cond, detail });
  console.log(`${cond ? '✓' : '✗'} ${name}${detail ? ' — ' + detail : ''}`);
};
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH || (existsSync('/usr/local/bin/chromium') ? '/usr/local/bin/chromium' : undefined);
const browser = await chromium.launch({ executablePath });
const context = await browser.newContext();
const page = await context.newPage();
const consoleErrors = [];
const badRequests = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push(String(e)));
page.on('response', (r) => { if (r.status() >= 400) badRequests.push({ url: r.url(), status: r.status() }); });

const home = await page.goto(BASE + '/', { waitUntil: 'networkidle' });
ok('Home répond 200', home && home.status() === 200, `status ${home && home.status()}`);
for (const w of [320, 768, 1280]) {
  await page.setViewportSize({ width: w, height: 900 });
  await page.waitForTimeout(150);
  await page.screenshot({ path: `${OUT}/home-${w}.png`, fullPage: true });
  ok(`Screenshot home ${w}px`, true);
}
await page.setViewportSize({ width: 390, height: 568 });
const menuToggle = page.locator('#mobile-menu-toggle');
await menuToggle.click();
ok('Menu mobile ouvert', await page.locator('#mobile-menu.flex').count() === 1);
ok('aria-expanded synchronisé', await menuToggle.getAttribute('aria-expanded') === 'true');
ok('État visuel du bouton synchronisé', await menuToggle.locator('#menu-icon-svg line').count() === 2);
ok('Panneau mobile scrollable', await page.locator('#mobile-menu').evaluate((el) => {
  el.scrollTop = 120;
  return el.classList.contains('overflow-y-auto') && el.scrollTop > 0;
}));
ok('Scroll de la page verrouillé', await page.evaluate(() => document.body.style.overflow === 'hidden'));
await page.getByRole('link', { name: 'Offres' }).last().click();
await page.waitForTimeout(250);
ok('Ancre mobile synchronisée', await page.evaluate(() => location.hash === '#offres'));
ok('Menu mobile refermé', await menuToggle.getAttribute('aria-expanded') === 'false' && await page.locator('#mobile-menu').evaluate((el) => el.hidden && getComputedStyle(el).display === 'none'));
ok('Couverture playbook portrait', await page.locator('.book-card--playbook img[width="500"][height="746"]').count() === 1);
await page.setViewportSize({ width: 1280, height: 900 });

const meeting = await page.goto(BASE + '/comment-ca-se-passe/', { waitUntil: 'networkidle' });
ok('Route 45 minutes répond 200', meeting && meeting.status() === 200, `status ${meeting && meeting.status()}`);
ok('Route 45 minutes possède un H1', await page.locator('main h1').count() === 1);
ok('Canonical route présent', (await page.locator('link[rel="canonical"]').getAttribute('href'))?.endsWith('/comment-ca-se-passe/'));
ok('ScoreCards présentes', await page.locator('.scorecard').count() >= 4);
ok('Retour sans animation bloquante', await page.locator('main').evaluate((el) => el.getAnimations().length === 0));
const firstDetails = page.locator('details').first();
const summary = firstDetails.locator('summary');
if (await summary.count()) { await summary.click(); await page.waitForTimeout(100); }
ok('Accordéon accessible', await summary.getAttribute('aria-expanded') === 'true');
ok('Bouton retour présent', await page.locator('a[aria-label="Retour à la page principale"]').count() === 1);
await page.screenshot({ path: `${OUT}/meeting-1280.png`, fullPage: true });

const origin = new URL(BASE).origin;
ok('0 erreur console', consoleErrors.length === 0, consoleErrors.join(' | ') || 'aucune');
const ownBad = badRequests.filter((r) => r.url.startsWith(origin) && !r.url.endsWith('/favicon.ico'));
ok('0 requête 404 same-origin', ownBad.length === 0, ownBad.map((r) => r.status + ' ' + r.url).join(' | ') || 'aucune');
await browser.close();
const passed = results.filter((r) => r.pass).length;
console.log(`\n=== QA : ${passed}/${results.length} OK ===`);
process.exit(passed === results.length ? 0 : 1);
