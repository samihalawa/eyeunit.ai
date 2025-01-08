const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// Configure marked with better security and features
marked.setOptions({
  headerIds: true,
  mangle: false,
  gfm: true,
  breaks: true,
  smartLists: true
});

// Create required directories
const ensureDirectories = () => {
  const dirs = ['./posts', '../dist/blog'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Read template
const getTemplate = () => {
  try {
    return fs.readFileSync('./template.html', 'utf-8');
  } catch (err) {
    console.error('Template file missing. Creating default template...');
    const defaultTemplate = `<!DOCTYPE html>
    <html><head><title>{{title}}</title></head><body>{{content}}</body></html>`;
    fs.writeFileSync('./template.html', defaultTemplate);
    return defaultTemplate;
  }
};

// Process posts
const processPost = (template, post) => {
  const content = fs.readFileSync(path.join('./posts', post), 'utf-8');
  const { data, content: markdown } = matter(content);
  
  const htmlContent = marked(markdown);
  
  return template
    .replace(/\{\{title\}\}/g, data.title || '')
    .replace(/\{\{author\}\}/g, data.author || '')
    .replace(/\{\{date\}\}/g, data.date || '')
    .replace(/\{\{image\}\}/g, data.image || '')
    .replace(/\{\{excerpt\}\}/g, data.excerpt || '')
    .replace(/\{\{keywords\}\}/g, data.keywords || '')
    .replace(/\{\{content\}\}/g, htmlContent)
    .replace(/\{\{slug\}\}/g, post.replace('.md', ''))
    .replace(/\{\{markdown_path\}\}/g, `/posts/${post}`);
};

// Main build function
const build = () => {
  console.log('Starting blog build...');
  
  ensureDirectories();
  const template = getTemplate();

  // Get and process posts
  const posts = fs.readdirSync('./posts')
    .filter(file => file.endsWith('.md'));

  console.log(`Found ${posts.length} posts`);

  // Process each post
  posts.forEach(post => {
    try {
      const postHtml = processPost(template, post);
      const outputPath = path.join('../dist/blog', post.replace('.md', '.html'));
      fs.writeFileSync(outputPath, postHtml);
      console.log(`Built ${post}`);
    } catch (err) {
      console.error(`Error processing ${post}:`, err);
    }
  });

  // Generate index
  const blogIndex = posts
    .map(post => {
      const content = fs.readFileSync(path.join('./posts', post), 'utf-8');
      const { data } = matter(content);
      return {
        title: data.title || '',
        date: data.date || new Date().toISOString(),
        excerpt: data.excerpt || '',
        slug: post.replace('.md', ''),
        image: data.image || ''
      };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  fs.writeFileSync('../dist/blog/index.json', JSON.stringify(blogIndex, null, 2));
  console.log('Blog build complete!');
};

// Create posts directory if it doesn't exist
const postsDir = './posts';
if (!fs.existsSync(postsDir)) {
  fs.mkdirSync(postsDir, { recursive: true });
  
  // Create sample post if no posts exist
  const samplePost = fs.readFileSync('./posts/2024-01-01-ai-in-ophthalmology.md', 'utf-8');
  fs.writeFileSync(path.join(postsDir, '2024-01-01-ai-in-ophthalmology.md'), samplePost);
}

// Run build
build(); 