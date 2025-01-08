const fs = require('fs');
const path = require('path');

// Create dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Copy static files
const staticFiles = [
  'index.html',
  'privacy.html',
  'terms.html',
  'sitemap.html',
  'samihalawa-research.html'
];

staticFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('dist', file));
    console.log(`Copied ${file} to dist/`);
  }
});

// Create assets directory in dist
if (!fs.existsSync('dist/assets')) {
  fs.mkdirSync('dist/assets', { recursive: true });
}

// Build blog
require('./blog/build.js');

console.log('Build complete!'); 