const blogPosts = {
    async loadPosts() {
        try {
            const response = await fetch('/api/blog/posts/index.json');
            if (!response.ok) throw new Error('Failed to load blog posts');
            const posts = await response.json();
            
            // Transform post URLs to absolute paths
            const transformedPosts = posts.map(post => ({
                ...post,
                url: `/blog/posts/${post.slug}`
            }));
            
            // Sort posts by date
            return transformedPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Error loading blog posts:', error);
            document.dispatchEvent(new CustomEvent('blog-error', { 
                detail: { 
                    message: 'Failed to load blog posts. Please try again later.',
                    error: error.message
                }
            }));
            return [];
        }
    }
};

if (typeof module !== 'undefined') module.exports = blogPosts;