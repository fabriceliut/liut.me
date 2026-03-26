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

// Copy static files
for (const f of FILES) {
  fs.copyFileSync(f, path.join(OUT, f));
}

// Copy compiled CSS
fs.copyFileSync('dist/styles.css', path.join(OUT, 'dist', 'styles.css'));

console.log(`Built _site/ with ${FILES.length + 1} files`);
