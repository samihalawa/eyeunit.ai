const { test, expect } = require('@playwright/test');

// Contact Form Tests
test.describe('Contact Form Tests', () => {
    test('should validate required fields', async ({ page }) => {
        await page.goto('http://localhost:3000/pages/contact.html');
        
        // Click submit without filling any fields
        await page.click('#submitButton');
        
        // Check HTML5 validation messages
        const nameInput = page.locator('#name');
        const emailInput = page.locator('#email');
        const messageInput = page.locator('#message');
        const subjectSelect = page.locator('#subject');
        
        // Get validation state
        const nameValid = await nameInput.evaluate(el => el.validity.valid);
        const emailValid = await emailInput.evaluate(el => el.validity.valid);
        const messageValid = await messageInput.evaluate(el => el.validity.valid);
        const subjectValid = await subjectSelect.evaluate(el => el.validity.valid);
        
        expect(nameValid).toBeFalsy();
        expect(emailValid).toBeFalsy();
        expect(messageValid).toBeFalsy();
        expect(subjectValid).toBeFalsy();
    });

    test('should validate email format', async ({ page }) => {
        await page.goto('http://localhost:3000/pages/contact.html');
        
        // Fill form with invalid email
        await page.fill('#name', 'Test User');
        await page.fill('#email', 'invalid-email');
        await page.fill('#message', 'Test message');
        await page.selectOption('#subject', 'demo');
        
        // Get email input validation state
        const emailValid = await page.locator('#email').evaluate(el => el.validity.valid);
        expect(emailValid).toBeFalsy();
        
        // Fill with valid email
        await page.fill('#email', 'test@example.com');
        const emailValidAfter = await page.locator('#email').evaluate(el => el.validity.valid);
        expect(emailValidAfter).toBeTruthy();
    });
});

// Blog Tests
test.describe('Blog Functionality Tests', () => {
    test('should filter blog posts by topic', async ({ page }) => {
        await page.goto('http://localhost:3000/blog');
        
        // Click filter button/dropdown if exists
        const filterButton = page.locator('.filter-button, .topic-filter');
        if (await filterButton.isVisible()) {
            await filterButton.click();
            // Select a topic (adjust selector based on your implementation)
            await page.click('.topic-option:first-child');
            
            // Verify filtered results
            const posts = await page.locator('.blog-post').count();
            expect(posts).toBeGreaterThan(0);
        }
    });

    test('should load blog post content', async ({ page }) => {
        await page.goto('http://localhost:3000/blog/ai-diagnostics-revolution.html');
        
        // Check for essential blog post elements using more specific selectors
        const mainHeading = page.locator('h1.text-4xl');
        await expect(mainHeading).toBeVisible();
        await expect(mainHeading).toHaveText(/The AI Revolution/);
        
        // Check for article content
        await expect(page.locator('.blog-content, article')).toBeVisible();
    });
});

// Performance Tests
test.describe('Performance Tests', () => {
    test('should load pages within acceptable time', async ({ page }) => {
        const urls = [
            '/',
            '/pages/technologies.html',
            '/pages/solutions.html',
            '/blog'
        ];

        for (const url of urls) {
            const start = Date.now();
            await page.goto(`http://localhost:3000${url}`);
            await page.waitForLoadState('networkidle');
            const loadTime = Date.now() - start;
            
            console.log(`Load time for ${url}: ${loadTime}ms`);
            expect(loadTime).toBeLessThan(5000); // 5 seconds threshold
        }
    });
});

// Accessibility Tests
test.describe('Accessibility Tests', () => {
    test('should have proper semantic structure', async ({ page }) => {
        await page.goto('http://localhost:3000');
        
        // Check for essential semantic elements with more specific selectors
        await expect(page.locator('nav.bg-white')).toBeVisible();
        
        // Check for at least one section
        const sectionCount = await page.locator('section').count();
        expect(sectionCount).toBeGreaterThan(0);
        
        // Check for alt text in images
        const images = await page.locator('img');
        const count = await images.count();
        for (let i = 0; i < count; i++) {
            const alt = await images.nth(i).getAttribute('alt');
            expect(alt).toBeTruthy();
        }
        
        // Check for proper heading hierarchy
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBeGreaterThan(0);
        
        // Check for interactive elements accessibility
        const links = await page.locator('a[href]');
        const linksCount = await links.count();
        for (let i = 0; i < linksCount; i++) {
            const link = links.nth(i);
            const hasText = await link.evaluate(el => 
                el.textContent.trim() !== '' || el.getAttribute('aria-label') !== null
            );
            expect(hasText).toBeTruthy();
        }
    });
});

// Mobile Responsiveness Tests
test.describe('Mobile Responsiveness Tests', () => {
    test('should maintain readable text size on mobile', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('http://localhost:3000');
        
        // Check main heading font size
        const fontSize = await page.evaluate(() => {
            const heading = document.querySelector('h1');
            return window.getComputedStyle(heading).fontSize;
        });
        
        // Convert px to number
        const size = parseInt(fontSize);
        expect(size).toBeGreaterThanOrEqual(20); // Minimum readable size
    });

    test('should have responsive layout', async ({ page }) => {
        // Test on mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('http://localhost:3000');
        
        // Wait for any responsive adjustments
        await page.waitForTimeout(1000);
        
        // Check if content is properly contained
        const layoutCheck = await page.evaluate(() => {
            const body = document.body;
            const html = document.documentElement;
            
            // Get the maximum of these potential scroll widths
            const maxWidth = Math.max(
                body.scrollWidth,
                body.offsetWidth,
                html.clientWidth,
                html.scrollWidth,
                html.offsetWidth
            );
            
            // Allow for a small margin of error (2px)
            return Math.abs(maxWidth - window.innerWidth) <= 2;
        });
        
        expect(layoutCheck).toBeTruthy();
    });
}); 