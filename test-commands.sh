# Test main page
curl -I https://www.eyeunit.ai

# Test blog posts
curl -I https://www.eyeunit.ai/blog/2024-01-25-deep-learning-for-retinal-disease-classification

# Test API endpoint
curl -X POST https://api.eyeunit.ai/analyze \
  -H "Content-Type: application/octet-stream" \
  -d @test-image.jpg

# Test contact form
curl -X POST https://www.eyeunit.ai/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","message":"Test message"}' 