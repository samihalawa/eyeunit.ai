// @ts-check
const { test, expect } = require('@playwright/test');

test('Chatbot functionality', async ({ page }) => {
  // Navigate to the homepage
  await page.goto('http://localhost:3000');
  
  console.log('Waiting for page to load...');
  
  // Wait for the chatbot button to be visible
  await page.waitForSelector('#chatButton', { state: 'visible' });
  
  // Click the chat button to open the widget
  console.log('Opening chatbot widget...');
  await page.click('#chatButton');
  
  // Verify the chat widget is opened
  await expect(page.locator('#chatWidget')).toHaveClass(/open/);
  
  // Check if the initial message is visible
  const initialMessage = await page.locator('.bot-message').textContent();
  console.log(`Initial message: ${initialMessage}`);
  expect(initialMessage).toContain("Hi there! I'm your EyeUnit.ai assistant");
  
  // Type a message
  console.log('Typing a message...');
  await page.fill('#chatInput', 'What is EyeUnit.ai?');
  
  // Send the message
  await page.click('#sendButton');
  
  // Wait for typing indicator
  await page.waitForSelector('.typing-indicator', { state: 'visible' });
  console.log('Waiting for response...');
  
  // Wait for response (this might take some time)
  await page.waitForSelector('.typing-indicator', { state: 'hidden', timeout: 30000 })
    .catch(() => console.log('Typing indicator did not disappear, but continuing test...'));
  
  // Verify we have at least 2 messages now (our question and hopefully a response)
  const messageCount = await page.locator('.message').count();
  console.log(`Message count: ${messageCount}`);
  expect(messageCount).toBeGreaterThan(2);
  
  // Take a screenshot for reference
  await page.screenshot({ path: 'chatbot-test.png' });
  
  console.log('Test completed successfully!');
});
