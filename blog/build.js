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
  smartLists: true,
  smartypants: true
});

// Create required directories with absolute paths
const ensureDirectories = () => {
  const baseDir = path.resolve(__dirname);
  const dirs = [
    path.join(baseDir, 'posts'),
    path.join(baseDir, 'dist'),
    path.join(baseDir, 'dist/assets')
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Read template with absolute path
const getTemplate = () => {
  const templatePath = path.join(__dirname, 'template.html');
  try {
    return fs.readFileSync(templatePath, 'utf-8');
  } catch (err) {
    console.error('Template not found:', err);
    process.exit(1);
  }
};

// Copy assets
const copyAssets = () => {
  const srcStylesPath = path.join(__dirname, 'styles.css');
  const destStylesPath = path.join(__dirname, 'dist/styles.css');
  fs.copyFileSync(srcStylesPath, destStylesPath);
};

// Process posts with absolute paths
const processPost = (template, post) => {
  const postPath = path.join(__dirname, 'posts', post);
  const content = fs.readFileSync(postPath, 'utf-8');
  const { data, content: markdown } = matter(content);
  
  const htmlContent = marked(markdown);
  
  // Format date
  const date = data.date ? new Date(data.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  return template
    .replace(/\{\{title\}\}/g, data.title || '')
    .replace(/\{\{author\}\}/g, data.author || '')
    .replace(/\{\{date\}\}/g, date)
    .replace(/\{\{image\}\}/g, data.image || '')
    .replace(/\{\{excerpt\}\}/g, data.excerpt || '')
    .replace(/\{\{keywords\}\}/g, data.keywords || '')
    .replace(/\{\{\{content\}\}\}/g, htmlContent)
    .replace(/\{\{slug\}\}/g, post.replace('.md', ''));
};

// Main build function
const build = () => {
  console.log('Starting blog build...');
  
  ensureDirectories();
  copyAssets();
  const template = getTemplate();
  const postsDir = path.join(__dirname, 'posts');

  // Get and process posts
  const posts = fs.readdirSync(postsDir)
    .filter(file => file.endsWith('.md'));

  console.log(`Found ${posts.length} posts`);

  // Process each post
  posts.forEach(post => {
    try {
      const postHtml = processPost(template, post);
      const outputPath = path.join(__dirname, 'dist', post.replace('.md', '.html'));
      fs.writeFileSync(outputPath, postHtml);
      console.log(`Built ${post}`);
    } catch (err) {
      console.error(`Error processing ${post}:`, err);
    }
  });

  // Generate index
  const blogIndex = posts
    .map(post => {
      const content = fs.readFileSync(path.join(postsDir, post), 'utf-8');
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

  const indexPath = path.join(__dirname, 'dist/index.json');
  fs.writeFileSync(indexPath, JSON.stringify(blogIndex, null, 2));
  
  // Generate index.html
  const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>EyeUnit.ai Blog</title>
    <link rel="stylesheet" href="styles.css">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body class="bg-gray-50">
    <nav class="bg-white shadow fixed w-full top-0 z-50">
        <div class="container mx-auto px-6 py-4">
            <div class="flex justify-between items-center">
                <a href="/" class="text-xl font-bold">EyeUnit.ai</a>
                <a href="/blog" class="ml-4 hover:text-blue-600">Blog</a>
            </div>
        </div>
    </nav>
    
    <main class="container mx-auto px-6 py-8 mt-20">
        <h1 class="text-4xl font-bold mb-8">Latest Posts</h1>
        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            ${blogIndex.map(post => `
                <article class="bg-white rounded-lg shadow-lg overflow-hidden">
                    ${post.image ? `<img src="${post.image}" alt="${post.title}" class="w-full h-48 object-cover">` : ''}
                    <div class="p-6">
                        <h2 class="text-xl font-bold mb-2">
                            <a href="${post.slug}.html" class="hover:text-blue-600">${post.title}</a>
                        </h2>
                        <div class="text-gray-600 text-sm mb-4">${new Date(post.date).toLocaleDateString()}</div>
                        <p class="text-gray-700">${post.excerpt}</p>
                    </div>
                </article>
            `).join('')}
        </div>
    </main>
    
    <footer class="bg-gray-100 mt-12">
        <div class="container mx-auto px-6 py-4 text-center text-gray-600">
            &copy; 2024 EyeUnit.ai. All rights reserved.
        </div>
    </footer>
</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'dist/index.html'), indexHtml);
  console.log('Blog build complete!');
};

// Run build
build(); 