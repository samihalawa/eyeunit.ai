const { chromium } = require('@playwright/test');

async function checkLinks() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Starting link check...');
  
  // Base URL for the site
  const baseUrl = 'http://localhost:3000';
  
  // Visit the homepage first
  await page.goto(baseUrl);
  console.log(`Checking links on homepage: ${baseUrl}`);
  
  // Get all links from the homepage
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a'))
      .map(a => {
        return {
          href: a.href,
          text: a.textContent.trim(),
          isExternal: a.href.startsWith('http') && !a.href.includes('localhost:3000')
        };
      })
      .filter(link => link.href && !link.href.startsWith('javascript:') && !link.href.startsWith('mailto:') && !link.href.startsWith('#'));
  });
  
  console.log(`Found ${links.length} links on homepage`);
  
  // Set to track visited URLs to avoid duplicates
  const visited = new Set();
  // Array to track all pages to check (start with homepage)
  const pagesToCheck = [baseUrl];
  // Track broken links
  const brokenLinks = [];
  // Track all links found
  const allLinks = new Map();
  
  // Process internal pages to a certain depth
  let depth = 0;
  const maxDepth = 2; // Only go 2 levels deep
  
  while (pagesToCheck.length > 0 && depth < maxDepth) {
    const currentUrl = pagesToCheck.shift();
    
    if (visited.has(currentUrl)) continue;
    visited.add(currentUrl);
    
    console.log(`\nChecking page: ${currentUrl}`);
    try {
      const response = await page.goto(currentUrl, { waitUntil: 'networkidle' });
      if (!response.ok()) {
        console.error(`Error: ${currentUrl} returned status ${response.status()}`);
        brokenLinks.push({ url: currentUrl, status: response.status(), referrer: 'direct navigation' });
        continue;
      }
      
      // Get all links on this page
      const pageLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a'))
          .map(a => {
            return {
              href: a.href,
              text: a.textContent.trim(),
              isExternal: a.href.startsWith('http') && !a.href.includes('localhost:3000')
            };
          })
          .filter(link => link.href && !link.href.startsWith('javascript:') && !link.href.startsWith('mailto:') && !link.href.startsWith('#'));
      });
      
      // Process each link
      for (const link of pageLinks) {
        if (!allLinks.has(link.href)) {
          allLinks.set(link.href, { text: link.text, referrers: [currentUrl] });
        } else {
          allLinks.get(link.href).referrers.push(currentUrl);
        }
        
        // Add internal links to the list to check
        if (!link.isExternal && !visited.has(link.href)) {
          pagesToCheck.push(link.href);
        }
        
        // Check if external link works (basic HEAD request)
        if (link.isExternal) {
          try {
            const externalResponse = await context.request.head(link.href);
            console.log(`External link: ${link.href} - Status: ${externalResponse.status()}`);
            
            if (!externalResponse.ok()) {
              brokenLinks.push({ 
                url: link.href, 
                text: link.text,
                status: externalResponse.status(), 
                referrer: currentUrl 
              });
            }
          } catch (error) {
            console.error(`Failed to access external link: ${link.href} - ${error.message}`);
            brokenLinks.push({ 
              url: link.href, 
              text: link.text,
              error: error.message, 
              referrer: currentUrl 
            });
          }
        }
      }
    } catch (error) {
      console.error(`Failed to navigate to ${currentUrl}: ${error.message}`);
      brokenLinks.push({ 
        url: currentUrl, 
        error: error.message, 
        referrer: 'direct navigation' 
      });
    }
    
    // If all current pages are processed, increase depth and continue with the next level
    if (pagesToCheck.length === 0 && depth < maxDepth - 1) {
      const nextLevel = Array.from(allLinks.keys())
        .filter(url => !url.isExternal && !visited.has(url));
      
      pagesToCheck.push(...nextLevel);
      depth++;
      console.log(`\nMoving to depth ${depth + 1}...`);
    }
  }
  
  // Print summary
  console.log('\n=== LINK CHECK RESULTS ===');
  console.log(`Total unique links found: ${allLinks.size}`);
  console.log(`Total pages visited: ${visited.size}`);
  console.log(`Broken links found: ${brokenLinks.length}`);
  
  if (brokenLinks.length > 0) {
    console.log('\n=== BROKEN LINKS ===');
    brokenLinks.forEach((link, index) => {
      console.log(`\n${index + 1}. ${link.url}`);
      if (link.text) console.log(`   Text: "${link.text}"`);
      if (link.status) console.log(`   Status: ${link.status}`);
      if (link.error) console.log(`   Error: ${link.error}`);
      console.log(`   Found on: ${link.referrer}`);
    });
  } else {
    console.log('\nAll links are working! 🎉');
  }
  
  // Print all links found
  console.log('\n=== ALL LINKS ===');
  Array.from(allLinks.entries()).forEach(([url, details], index) => {
    console.log(`\n${index + 1}. ${url}`);
    console.log(`   Text: "${details.text}"`);
    console.log(`   Found on: ${details.referrers.join(', ')}`);
  });
  
  await browser.close();
  
  return brokenLinks.length === 0;
}

// Run the link checker
checkLinks()
  .then(allLinksWorking => {
    if (allLinksWorking) {
      console.log('\nAll links are working correctly! Ready to push to GitHub.');
      process.exit(0);
    } else {
      console.error('\nBroken links were found. Please fix them before pushing to GitHub.');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Error running link check:', error);
    process.exit(1);
  }); 