const blogPosts = {
    async loadPosts() {
        const posts = [
            {
                id: '2024-01-01-ai-in-ophthalmology',
                metadata: {
                    title: 'AI in Ophthalmology: The Future is Here',
                    date: '2024-01-01',
                    author: 'Dr. Sarah Chen',
                    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=2680&auto=format&fit=crop',
                    excerpt: 'Exploring how artificial intelligence is transforming eye care and diagnostics, leading to better patient outcomes.'
                }
            },
            {
                id: '2024-02-15-enhancing-diagnostic-accuracy',
                metadata: {
                    title: 'Enhancing Diagnostic Accuracy with Machine Learning',
                    date: '2024-02-15',
                    author: 'Dr. James Wilson',
                    image: 'https://media.istockphoto.com/id/1425844400/photo/look-at-the-light.webp?a=1&b=1&s=612x612&w=0&k=20&c=sx8KJXgXLnGdAaRXk2FnPkNc3-Mus13oIEsBRdFm930=',
                    excerpt: 'A deep dive into machine learning models that are improving the precision of eye disease diagnoses.'
                }
            },
            {
                id: '2024-03-20-integrating-ai-clinical-settings',
                metadata: {
                    title: 'Integrating AI Solutions in Clinical Settings',
                    date: '2024-03-20',
                    author: 'Laura Martinez',
                    image: 'https://media.istockphoto.com/id/2118024278/photo/young-woman-doing-optical-exam-at-medical-clinic.webp?a=1&b=1&s=612x612&w=0&k=20&c=HLoOWpejDRA3I_PknRnBWSC4ITuliqAQ5x7_wnLeI8c=',
                    excerpt: 'Best practices for incorporating AI technologies into existing medical workflows to maximize efficiency.'
                }
            }
        ];
        return posts;
    },
    async loadPost(postId) {
        const response = await fetch(`/blog/posts/${postId}.md`);
        if (!response.ok) {
            console.error(`Failed to load blog post: ${postId}`);
            return null;
        }
        const content = await response.text();
        const post = {
            id: postId,
            content: content,
            metadata: (await this.loadPosts()).find(post => post.id === postId).metadata
        };
        return post;
    }
}; 