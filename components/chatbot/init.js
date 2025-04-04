// Get the base URL dynamically
const basePath = window.location.origin;
const chatWidgetPath = `${basePath}/components/chatbot/chat-widget.js`;

// Dynamic import with absolute path
import(chatWidgetPath)
    .then(module => {
        const { ChatWidget } = module;
        // Initialize chat widget when DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                new ChatWidget();
            });
        } else {
            // DOM already loaded, initialize immediately
            new ChatWidget();
        }
    })
    .catch(err => {
        console.error('Failed to load ChatWidget module:', err);
    });
