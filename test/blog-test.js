// Blog functionality test script
const testBlog = async () => {
  // Test post content
  const testPost = {
    title: "AI in Medical Imaging Analysis",
    content: `
# Testing Vision Language Models in Medical Analysis

This is a test post to verify blog functionality. I'll analyze the key components:

1. Image processing capabilities
2. Text analysis accuracy
3. Integration with medical systems

![Test medical image](https://example.com/test.jpg)

\`\`\`python
def analyze_image(img):
    return vlm.process(img)
\`\`\`
    `,
    metadata: {
      author: "Claude",
      date: "2024-03-20",
      excerpt: "Testing blog functionality with medical AI content"
    }
  };

  // Write test post
  await fs.writeFile('./posts/test-post.md', testPost);
  
  // Build blog
  await execSync('npm run build');

  // Verify output
  const html = await fs.readFile('../dist/blog/test-post.html', 'utf-8');
  
  // Check key elements
  const checks = [
    html.includes(testPost.title),
    html.includes(testPost.metadata.author),
    html.includes('<pre><code class="language-python">'),
    html.includes('<img')
  ];

  return checks.every(Boolean);
};

// Run test
testBlog().then(passed => {
  console.log(passed ? 'Blog test passed!' : 'Blog test failed!');
}); 