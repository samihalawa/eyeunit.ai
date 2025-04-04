const { test, expect } = require('@playwright/test');

test('Complete Website Navigation and Content Test', async ({ page }) => {
    // Go to homepage
    await page.goto('http://localhost:3000');
    console.log('Testing Home Page...');
    
    // Check homepage content
    await expect(page.locator('nav.fixed.top-0 a.gradient-text, nav.bg-white a.gradient-text')).toBeVisible();
    await expect(page.locator('nav.fixed.top-0, nav.bg-white')).toBeVisible();
    
    // Test navigation menu - using more specific selectors
    const navLinks = ['Technologies', 'Research', 'Solutions', 'Blog', 'Contact'];
    for (const link of navLinks) {
        // Check if either desktop or mobile navigation link is visible
        const linkVisible = await page.evaluate((linkText) => {
            const links = Array.from(document.querySelectorAll('a')).filter(a => 
                a.textContent.trim() === linkText && 
                a.href.toLowerCase().includes(linkText.toLowerCase())
            );
            return links.some(link => {
                const style = window.getComputedStyle(link);
                return style.display !== 'none' && style.visibility !== 'hidden';
            });
        }, link);
        expect(linkVisible).toBeTruthy();
    }

    // Test each page
    const pages = [
        {
            name: 'Technologies',
            url: '/pages/technologies.html',
            expectedContent: [
                { text: 'AI Core Technology', selector: 'h2' },
                { text: 'Machine Learning Models', selector: 'h2' },
                { text: 'Integration Capabilities', selector: 'h2' }
            ]
        },
        {
            name: 'Research',
            url: '/pages/research.html',
            expectedContent: [
                { text: 'Latest Research', selector: 'h2' },
                { text: 'Research Areas', selector: 'h2' },
                { text: 'Research Partners', selector: 'h2' }
            ]
        },
        {
            name: 'Solutions',
            url: '/pages/solutions.html',
            expectedContent: [
                { text: 'AI-Powered Eye Care Solutions', selector: 'h1' },
                { text: 'Our Product Suite', selector: 'h2' },
                { text: 'Key Features', selector: 'h2' }
            ]
        },
        {
            name: 'Blog',
            url: '/blog',
            expectedContent: [
                { text: 'Blog & Insights', selector: 'h1' },
                { text: 'Filter by Topic', selector: 'h3' },
                { text: 'Featured Post', selector: 'h2' }
            ]
        },
        {
            name: 'Contact',
            url: '/pages/contact.html',
            expectedContent: [
                { text: 'Contact Us', selector: 'h1' },
                { text: 'Get in Touch', selector: 'h2' },
                { text: 'Contact Information', selector: 'h2' }
            ]
        }
    ];
    
    for (const { name, url, expectedContent } of pages) {
        console.log(`\nTesting ${name} page...`);
        
        // Navigate to page
        await page.goto(`http://localhost:3000${url}`);
        await page.waitForLoadState('networkidle');
        console.log(`${name} page loaded: ${page.url()}`);

        // Check page content
        for (const { text, selector } of expectedContent) {
            const element = await page.locator(`${selector}:text("${text}")`);
            const isVisible = await element.isVisible();
            console.log(`- Checking for "${text}" in ${selector}: ${isVisible ? '✓' : '✗'}`);
            expect(isVisible).toBeTruthy();
        }

        // Check common elements
        await expect(page.locator('nav.fixed.top-0, nav.bg-white')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
        await expect(page.locator('footer').getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
        await expect(page.locator('footer').getByRole('link', { name: 'Terms of Service' })).toBeVisible();
        await expect(page.locator('footer').getByRole('link', { name: 'Sitemap' })).toBeVisible();
    }

    // Test footer links
    console.log('\nTesting footer links...');
    const footerLinks = [
        { name: 'Privacy Policy', url: '/pages/privacy.html' },
        { name: 'Terms of Service', url: '/pages/terms.html' },
        { name: 'Sitemap', url: '/pages/sitemap.html' }
    ];
    
    for (const { name, url } of footerLinks) {
        console.log(`\nTesting ${name}...`);
        await page.goto(`http://localhost:3000${url}`);
        await page.waitForLoadState('networkidle');
        
        // Verify page loaded
        const heading = await page.locator('h1').first();
        const text = await heading.textContent();
        console.log(`Page heading: ${text}`);
        expect(text).toContain(name);
        
        // Check common elements
        await expect(page.locator('nav.fixed.top-0, nav.bg-white')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
    }
}); 