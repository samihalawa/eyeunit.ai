const { createCanvas } = require('canvas');
const fs = require('fs');

// Create a test retinal image
const canvas = createCanvas(224, 224);
const ctx = canvas.getContext('2d');

// Draw a simple retinal-like pattern
ctx.fillStyle = 'red';
ctx.beginPath();
ctx.arc(112, 112, 100, 0, Math.PI * 2);
ctx.fill();

// Save as test image
const buffer = canvas.toBuffer('image/jpeg');
fs.writeFileSync('test/test-image.jpg', buffer); 