const fs = require('fs');
const path = require('path');

const OUT = '_site';
const FILES = [
  'index.html',
  'script.js',
  'robots.txt',
  'sitemap.xml',
  'llms.txt',
  'manifest.webmanifest',
  '_headers',
  'logo-liut.webp',
  'logo-liut-192.svg',
  'logo-liut-512.svg',
  'profile-avatar-2027.jpg',
  'og-image.jpg',
];

// Clean & create output dir
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'dist'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'fonts'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'assets', 'books'), { recursive: true });

// Copy static files
for (const f of FILES) {
  fs.copyFileSync(f, path.join(OUT, f));
}

// Copy book visuals and download assets
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}
copyDir(path.join('assets', 'books'), path.join(OUT, 'assets', 'books'));
copyDir('comment-ca-se-passe', path.join(OUT, 'comment-ca-se-passe'));

// Copy compiled CSS
fs.copyFileSync('dist/styles.css', path.join(OUT, 'dist', 'styles.css'));

// Copy fonts
const fontFiles = fs.readdirSync('fonts').filter(f => f.endsWith('.woff2'));
for (const f of fontFiles) {
  fs.copyFileSync(path.join('fonts', f), path.join(OUT, 'fonts', f));
}

console.log(`Built _site/ with ${FILES.length + 1 + fontFiles.length} files`);
