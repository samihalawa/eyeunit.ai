import { ChatWidget } from './chat-widget.js';

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (!window.eyeUnitChat) {
        window.eyeUnitChat = new ChatWidget();
    }
});
