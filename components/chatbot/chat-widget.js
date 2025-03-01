export class ChatWidget {
    constructor() {
        this.apiKey = null;
        this.apiBase = 'https://api-inference.huggingface.co/models/Qwen/Qwen2.5-Coder-32B-Instruct';
        this.initializeApiKey();
        this.isOpen = false;
        this.isTyping = false;
        this.context = [
            {
                role: 'system',
                content: `You are an AI assistant for EyeUnit.ai, a company specializing in AI-powered ophthalmology solutions. Your role is to:
                - Help users understand EyeUnit.ai's products and services
                - Answer questions about AI in ophthalmology
                - Guide users to relevant sections of the website
                - Direct users to the contact form for business inquiries or technical support
                - Maintain a professional, helpful, and informative tone
                - Acknowledge when a topic requires direct contact with the team
                
                Key information:
                - Main services: AI-assisted diagnostic tools, medical image analysis, research collaboration
                - Key pages: Technologies, Research, Solutions, Contact
                - For technical support or business inquiries: Direct to /contact.html
                - For research collaboration: Mention the research page and suggest contacting the team
                
                Remember: You're a helpful guide but should direct complex inquiries to the human team through the contact form.`
            }
        ];
        
        this.createWidget();
        this.attachEventListeners();
    }

    async initializeApiKey() {
        try {
            console.log('Fetching API configuration...');
            const baseUrl = window.location.origin;
            const configUrl = `${baseUrl}/api/config`;
            console.log(`Attempting to fetch config from: ${configUrl}`);
            
            // Add retries for better reliability, especially in Cloudflare
            let retries = 3;
            let response = null;
            let useCloudflareFunction = false;
            
            while (retries > 0) {
                try {
                    // Try standard fetch first
                    response = await fetch(configUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        cache: 'no-cache',
                        credentials: useCloudflareFunction ? 'omit' : 'same-origin'
                    });
                    
                    // If we get a response, break out of retry loop
                    if (response.ok) {
                        break;
                    }
                    
                    // If not OK and we haven't tried Cloudflare Function mode yet, try that
                    if (!useCloudflareFunction && response.status === 404) {
                        console.log('Standard endpoint not found, trying Cloudflare Function endpoint...');
                        useCloudflareFunction = true;
                        continue;  // Try again with Cloudflare Function mode
                    }
                    
                    // If we've already tried both or got a non-404 error, decrement retries
                    console.error(`Fetch attempt failed with status ${response.status} (${retries} retries left)`);
                    retries--;
                    if (retries === 0) break;
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                } catch (fetchError) {
                    console.error(`Fetch attempt failed (${retries} retries left):`, fetchError);
                    retries--;
                    if (retries === 0) throw fetchError;
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
                }
            }
            
            if (!response || !response.ok) {
                const error = response ? await response.text() : 'No response received';
                let errorMessage;
                try {
                    const errorJson = JSON.parse(error);
                    errorMessage = errorJson.error || (response ? response.statusText : 'Unknown error');
                } catch (e) {
                    errorMessage = error || (response ? response.statusText : 'Unknown error');
                }
                console.error(`API config response not OK: ${response ? response.status : 'No response'}`);
                throw new Error(`Failed to fetch API configuration: ${errorMessage}`);
            }
            
            const config = await response.json();
            if (!config.huggingfaceApiKey) {
                console.error('API key missing in server response:', config);
                throw new Error('API key missing in server response');
            }
            
            this.apiKey = config.huggingfaceApiKey;
            console.log('API key successfully initialized');
        } catch (error) {
            console.error('Failed to initialize API key:', error);
            this.apiKey = null; // Ensure key is null on failure
            // Only add error message if widget is already created
            if (document.querySelector('.chat-messages')) {
                this.addBotMessage("I apologize, but I'm having trouble connecting to the server. Please try again later or contact support if the issue persists.");
            }
        }
    }

    createWidget() {
        // Load CSS with absolute URL
        const cssPath = `${window.location.origin}/components/chatbot/chat-widget.css`;
        if (!document.querySelector(`link[href="${cssPath}"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssPath;
            document.head.appendChild(link);
        }

        // Create widget container
        const widget = document.createElement('div');
        widget.className = 'chat-widget';
        widget.innerHTML = `
            <div class="chat-icon" title="Chat with AI Assistant">
                <i class="fas fa-comments"></i>
            </div>
            <div class="chat-container" style="display: none;">
                <div class="chat-header">
                    <div class="chat-title">EyeUnit.ai Assistant</div>
                    <button class="close-chat">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="chat-messages"></div>
                <div class="chat-input-container">
                    <input type="text" class="chat-input" placeholder="Type your message..." aria-label="Chat message">
                    <button class="send-message" disabled>
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(widget);
    }

    attachEventListeners() {
        const chatIcon = document.querySelector('.chat-icon');
        const closeChat = document.querySelector('.close-chat');
        const chatContainer = document.querySelector('.chat-container');
        const input = document.querySelector('.chat-input');
        const sendButton = document.querySelector('.send-message');

        chatIcon.addEventListener('click', () => this.toggleChat());
        closeChat.addEventListener('click', () => this.toggleChat());

        input.addEventListener('input', () => {
            sendButton.disabled = !input.value.trim();
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && input.value.trim()) {
                this.sendMessage();
            }
        });

        sendButton.addEventListener('click', () => this.sendMessage());
    }

    toggleChat() {
        const chatContainer = document.querySelector('.chat-container');
        this.isOpen = !this.isOpen;
        chatContainer.style.display = this.isOpen ? 'flex' : 'none';
        
        if (this.isOpen && !this.hasWelcomeMessage) {
            this.addBotMessage("Hello! I'm EyeUnit.ai's AI assistant. How can I help you today?");
            this.hasWelcomeMessage = true;
        }
    }

    async sendMessage() {
        const input = document.querySelector('.chat-input');
        const message = input.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addUserMessage(message);
        input.value = '';
        document.querySelector('.send-message').disabled = true;

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await this.callAPI(message);
            this.hideTypingIndicator();
            this.addBotMessage(response);
        } catch (error) {
            console.error('API Error:', error);
            this.hideTypingIndicator();
            this.addBotMessage("I apologize, but I'm having trouble connecting right now. Please try again later or contact our support team for immediate assistance.");
        }
    }

    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.textContent = message;
        this.appendMessage(messageDiv);
        this.context.push({ role: 'user', content: message });
    }

    addBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.textContent = message;
        this.appendMessage(messageDiv);
        this.context.push({ role: 'assistant', content: message });
    }

    appendMessage(messageDiv) {
        const messagesContainer = document.querySelector('.chat-messages');
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        document.querySelector('.chat-messages').appendChild(indicator);
    }

    hideTypingIndicator() {
        const indicator = document.querySelector('.typing-indicator');
        if (indicator) {
            indicator.remove();
        }
        this.isTyping = false;
    }

    async callAPI(message) {
        if (!this.apiKey) {
            console.error('API key not initialized');
            return "I apologize, but I cannot process your request at the moment as the API key is not available. Please try again later or contact support.";
        }
        console.log('Sending message to HuggingFace API...');
        try {
            // Create a chat-like prompt format
            const prompt = `<|im_start|>system
You are an AI assistant for EyeUnit.ai, a company specializing in AI-powered ophthalmology solutions.
You help users understand EyeUnit.ai's products and services, answer questions about AI in ophthalmology,
and guide users to relevant sections of the website. For complex inquiries or technical support,
you should direct users to the contact form at /contact.html.
<|im_end|>
<|im_start|>user
${message}
<|im_end|>
<|im_start|>assistant`;

            console.log('Calling HuggingFace API at:', this.apiBase);
            
            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            try {
                const response = await fetch(this.apiBase, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: {
                            max_new_tokens: 500,
                            temperature: 0.7,
                            top_p: 0.95,
                            stop: ['<|im_end|>', '<|im_start|>'],
                            do_sample: true
                        }
                    }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error Response:', errorText, 'Status:', response.status);
                    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
                }

                console.log('Response received from API');
                const result = await response.json();
                
                if (!result || !Array.isArray(result) || result.length === 0) {
                    console.error('Invalid response format:', result);
                    return "I apologize, but I received an invalid response. Please try again or contact support.";
                }
                
                // Process and clean the response
                let answer = result[0].generated_text || '';
                
                // Remove the input prompt from the response
                answer = answer.replace(prompt, '').trim();
                
                // Remove any trailing stop tokens
                answer = answer.replace(/<\|im_end\|>/g, '').trim();
                
                // If empty response, provide a fallback
                if (!answer) {
                    return "I apologize, but I'm having trouble generating a response. Please try rephrasing your question or contact our support team for assistance.";
                }
                
                return answer;
            } catch (fetchError) {
                clearTimeout(timeoutId);
                if (fetchError.name === 'AbortError') {
                    console.error('API request timed out');
                    return "I apologize, but the request timed out. Please try again later or contact support.";
                }
                throw fetchError;
            }
        } catch (error) {
            console.error('Error in API call:', error);
            return `I apologize, but I encountered an error processing your request. Please try again later or contact support.`;
        }
    }
}
