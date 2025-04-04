// Blog posts data
const blogPosts = [
    {
        id: 'ai-glaucoma-triage-innovation',
        title: 'Revolutionizing Glaucoma Screening with AI Triage',
        author: 'Dr. Emma Reynolds',
        date: '2024-04-20',
        excerpt: 'Learn how AI-powered glaucoma triage systems are transforming early detection and improving patient outcomes in ophthalmology.',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=800',
        category: 'Innovation'
    },
    {
        id: 'ai-diagnostics-revolution',
        title: 'The AI Revolution in Ophthalmology Diagnostic Techniques',
        author: 'Dr. Sarah Chen',
        date: '2024-02-21',
        excerpt: 'Exploring how artificial intelligence is transforming eye care diagnostics and improving patient outcomes.',
        image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800',
        category: 'Technology'
    },
    {
        id: 'machine-learning-advances',
        title: 'Latest Advances in Machine Learning for Medical Imaging',
        author: 'Dr. Michael Roberts',
        date: '2024-02-15',
        excerpt: 'A deep dive into recent breakthroughs in machine learning algorithms for medical image analysis.',
        image: 'https://images.unsplash.com/photo-1581093458791-9d09c85a8f60?auto=format&fit=crop&w=800',
        category: 'Research'
    },
    {
        id: 'ethics-ai-healthcare',
        title: 'Ethics in AI Healthcare: Navigating the Future',
        author: 'Prof. Emily Watson',
        date: '2024-02-08',
        excerpt: 'Addressing ethical considerations and best practices in AI-powered healthcare solutions.',
        image: 'https://images.unsplash.com/photo-1576670159805-381a0aa93de9?auto=format&fit=crop&w=800',
        category: 'Ethics'
    }
];

// Function to load blog posts
function loadBlogPosts() {
    const blogPostsContainer = document.getElementById('blogPosts');
    if (!blogPostsContainer) return;

    blogPostsContainer.innerHTML = '';

    blogPosts.forEach(post => {
        const postElement = document.createElement('article');
        postElement.className = 'bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300';
        
        postElement.innerHTML = `
            <img src="${post.image}" alt="${post.title}" class="w-full h-48 object-cover">
            <div class="p-6">
                <div class="flex items-center text-sm text-gray-500 mb-2">
                    <span>${post.category}</span>
                    <span class="mx-2">•</span>
                    <span>${new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}</span>
                </div>
                <h3 class="text-xl font-semibold mb-2 hover:text-blue-600 transition-colors">
                    <a href="/blog/${post.id}.html">${post.title}</a>
                </h3>
                <p class="text-gray-600 mb-4">${post.excerpt}</p>
                <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-500">${post.author}</span>
                    <a href="/blog/${post.id}.html" class="text-blue-600 hover:text-blue-700 font-medium">
                        Read More →
                    </a>
                </div>
            </div>
        `;
        
        blogPostsContainer.appendChild(postElement);
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', loadBlogPosts); 
