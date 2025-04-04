const { test, expect } = require('@playwright/test');

test('Check Static Assets Loading', async ({ page }) => {
    // Enable request logging
    const failedRequests = [];
    page.on('requestfailed', request => {
        failedRequests.push({
            url: request.url(),
            error: request.failure().errorText
        });
    });

    // Visit each page and check for failed asset loads
    const pages = [
        '/',
        '/pages/technologies.html',
        '/pages/research.html',
        '/pages/solutions.html',
        '/blog',
        '/pages/contact.html'
    ];

    for (const url of pages) {
        console.log(`\nChecking assets on ${url}`);
        await page.goto(`http://localhost:3000${url}`);
        await page.waitForLoadState('networkidle');

        // Log any failed requests for this page
        if (failedRequests.length > 0) {
            console.log('Failed asset requests:');
            failedRequests.forEach(({ url, error }) => {
                console.log(`- ${url}: ${error}`);
            });
            failedRequests.length = 0; // Clear for next page
        } else {
            console.log('All assets loaded successfully');
        }

        // Check specific asset types
        const images = await page.$$eval('img', imgs => imgs.map(img => ({
            src: img.src,
            alt: img.alt,
            loaded: img.complete && img.naturalWidth !== 0
        })));

        console.log('\nImage loading status:');
        images.forEach(img => {
            console.log(`- ${img.src}: ${img.loaded ? '✓' : '✗'} (alt: ${img.alt || 'missing'})`);
            expect(img.loaded).toBeTruthy();
        });

        // Check CSS and JS
        const styles = await page.$$eval('link[rel="stylesheet"]', links => 
            links.map(link => link.href));
        const scripts = await page.$$eval('script[src]', scripts => 
            scripts.map(script => script.src));

        console.log('\nStylesheets:');
        styles.forEach(href => console.log(`- ${href}`));

        console.log('\nScripts:');
        scripts.forEach(src => console.log(`- ${src}`));
    }
}); 