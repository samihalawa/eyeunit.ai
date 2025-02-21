const { test, expect } = require('@playwright/test');

test('Navigation Test', async ({ page }) => {
    // Go to homepage
    await page.goto('http://localhost:3000');
    console.log('Home page loaded');

    // Test each navigation link
    const links = ['Technologies', 'Research', 'Solutions', 'Blog', 'Contact'];
    
    for (const link of links) {
        // Find and click the link
        const linkElement = await page.getByText(link).first();
        await linkElement.click();
        
        // Wait for page to load
        await page.waitForLoadState('networkidle');
        console.log(`${link} page loaded: ${page.url()}`);

        // Get page heading
        const heading = await page.$('h1');
        if (heading) {
            const text = await heading.textContent();
            console.log(`Page heading: ${text}`);
        }

        // Go back to homepage
        await page.goBack();
        await page.waitForLoadState('networkidle');
    }
}); 