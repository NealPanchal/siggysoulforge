document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatWindow = document.getElementById('chat-window');
    const sendBtn = document.getElementById('btn-send');

    // Make inputs responsive during AI generation
    let isWaitingForResponse = false;

    // Scroll to bottom helper
    const scrollToBottom = () => {
        chatWindow.scrollTop = chatWindow.scrollHeight;
    };

    // Append a message to the chat
    const appendMessage = (content, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message`;

        const msgContent = document.createElement('div');
        msgContent.className = 'message-content';
        msgContent.textContent = content; // using textContent for security (prevents XSS)

        msgDiv.appendChild(msgContent);
        chatWindow.appendChild(msgDiv);
        scrollToBottom();
    };

    // Add typing indicator
    const showTypingIndicator = () => {
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typing-indicator';

        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            indicator.appendChild(dot);
        }

        chatWindow.appendChild(indicator);
        scrollToBottom();
    };

    // Remove typing indicator
    const removeTypingIndicator = () => {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    };

    // Handle form submission
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const message = chatInput.value.trim();
        if (!message || isWaitingForResponse) return;

        // User message
        appendMessage(message, 'user');
        chatInput.value = '';

        // Lock input
        isWaitingForResponse = true;
        chatInput.disabled = true;
        sendBtn.disabled = true;

        showTypingIndicator();

        try {
            // Hit the API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Bot message
            removeTypingIndicator();
            if (data.response) {
                appendMessage(data.response, 'bot');
            } else {
                appendMessage(data.error || "The multiverse hiccuped. Try again.", 'bot');
            }

        } catch (error) {
            console.error('Error fetching chat response:', error);
            removeTypingIndicator();
            appendMessage("*flickers with static* ...the soul forge is temporarily closed.", 'bot');
        } finally {
            // Unlock input
            isWaitingForResponse = false;
            chatInput.disabled = false;
            sendBtn.disabled = false;
            chatInput.focus();
        }
    });
});
