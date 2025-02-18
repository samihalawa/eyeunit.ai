const blogPosts = {
    // Sample blog posts data
    posts: [
        {
            id: 1,
            metadata: {
                title: "Advancing AI in Ophthalmology",
                author: "Dr. Sarah Chen",
                date: "2024-02-18",
                excerpt: "Exploring the latest developments in AI-powered eye diagnostics.",
                image: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?auto=format&fit=crop&w=800"
            }
        },
        {
            id: 2,
            metadata: {
                title: "The Future of Medical Imaging",
                author: "Dr. Robert Ferdinand",
                date: "2024-02-15",
                excerpt: "How AI is transforming medical imaging and diagnosis.",
                image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800"
            }
        },
        {
            id: 3,
            metadata: {
                title: "AI in Clinical Practice",
                author: "Dr. Maria Rodriguez",
                date: "2024-02-10",
                excerpt: "Real-world applications of AI in clinical ophthalmology.",
                image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800"
            }
        }
    ],

    async loadPosts() {
        try {
            // Return static posts data
            return Promise.resolve(this.posts);
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