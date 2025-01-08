const { execSync } = require('child_process');
const path = require('path');

// Build site
console.log('Building site...');
execSync('npm run build', { stdio: 'inherit' });

// Deploy to server
console.log('Deploying to eyeunit.ai...');
execSync(`rsync -avz --delete dist/ eyeunit@eyeunit.ai:/var/www/eyeunit.ai/`, {
  stdio: 'inherit'
});

// Test deployment
console.log('Testing deployment...');
const tests = [
  'curl -I https://www.eyeunit.ai',
  'curl -I https://www.eyeunit.ai/blog',
  'curl -X POST https://api.eyeunit.ai/analyze -H "Content-Type: application/octet-stream" -d @test/test-image.jpg'
];

tests.forEach(test => {
  try {
    execSync(test, { stdio: 'inherit' });
    console.log(`✓ ${test}`);
  } catch (err) {
    console.error(`✗ ${test}`);
    console.error(err);
  }
}); 