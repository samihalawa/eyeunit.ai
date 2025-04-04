#!/usr/bin/env node

/**
 * Deployment health checker script
 * 
 * Run this script to verify that your Cloudflare Pages deployment is working correctly.
 * It tests API endpoints and connectivity to confirm functionality.
 * 
 * Usage: node scripts/check-deployment.js <deployment-url>
 * Example: node scripts/check-deployment.js https://eyeunit.pages.dev
 */

const https = require('https');
const http = require('http');

const baseUrl = process.argv[2] || 'http://localhost:3000';
console.log(`Testing deployment at: ${baseUrl}`);

// Helper to make HTTP/HTTPS requests
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            data: res.headers['content-type']?.includes('application/json') 
              ? JSON.parse(data) 
              : data
          };
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

async function checkEndpoint(endpoint, name) {
  const url = `${baseUrl}${endpoint}`;
  console.log(`\nChecking ${name} (${url})...`);
  
  try {
    const response = await makeRequest(url);
    
    console.log(`Status: ${response.statusCode}`);
    console.log('Response:', typeof response.data === 'object' ? 
      JSON.stringify(response.data, null, 2) : response.data.substring(0, 100) + '...');
    
    return {
      name,
      url,
      success: response.statusCode >= 200 && response.statusCode < 300,
      statusCode: response.statusCode
    };
  } catch (error) {
    console.error(`Error checking ${name}:`, error.message);
    return {
      name,
      url,
      success: false,
      error: error.message
    };
  }
}

async function main() {
  console.log('Starting deployment health check...\n');
  
  const results = [];
  
  // Check main page
  results.push(await checkEndpoint('/', 'Main Page'));
  
  // Check API endpoints
  results.push(await checkEndpoint('/api/health', 'Health API'));
  results.push(await checkEndpoint('/api/config', 'Config API'));
  
  // Check static assets
  results.push(await checkEndpoint('/components/chatbot/chat-widget.js', 'Chat Widget Script'));
  
  // Summary
  console.log('\n===== SUMMARY =====');
  let allSuccess = true;
  
  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.name} (${result.statusCode || 'No response'})`);
    if (!result.success) allSuccess = false;
  });
  
  console.log('\nOverall status:', allSuccess ? '✅ All checks passed' : '❌ Some checks failed');
  console.log('\nIf there are failures, check:');
  console.log('1. Cloudflare Pages configuration');
  console.log('2. Environment variables in Cloudflare');
  console.log('3. Functions directory and routing');
  
  process.exit(allSuccess ? 0 : 1);
}

main().catch(error => {
  console.error('Error running health check:', error);
  process.exit(1);
}); 