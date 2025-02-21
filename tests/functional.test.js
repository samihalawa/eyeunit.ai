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