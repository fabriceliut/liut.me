const fs = require('fs');
const path = require('path');

const OUT = '_site';
const FILES = [
  'index.html',
  'script.js',
  'robots.txt',
  'sitemap.xml',
  'logo-liut.webp',
  'profile-banana3pro.jpg',
];

// Clean & create output dir
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'dist'), { recursive: true });

// Copy static files (minify HTML)
for (const f of FILES) {
  if (f === 'index.html') {
    let html = fs.readFileSync(f, 'utf8');
    // Collapse whitespace between tags (safe for this markup)
    html = html.replace(/>\s+</g, '><').replace(/\n\s*/g, '').trim();
    fs.writeFileSync(path.join(OUT, f), html);
  } else {
    fs.copyFileSync(f, path.join(OUT, f));
  }
}

// Copy compiled CSS
fs.copyFileSync('dist/styles.css', path.join(OUT, 'dist', 'styles.css'));

const htmlSize = fs.statSync(path.join(OUT, 'index.html')).size;
console.log(`Built _site/ with ${FILES.length + 1} files (HTML: ${(htmlSize/1024).toFixed(1)}KB)`);
