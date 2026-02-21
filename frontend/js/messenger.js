let currentChat = null;
let conversations = [];

async function showMessenger() {
    document.getElementById('messenger-modal').classList.add('show');
    await loadConversations();
}

function closeMessenger() {
    document.getElementById('messenger-modal').classList.remove('show');
    currentChat = null;
}

async function loadConversations() {
    try {
        conversations = await API.getConversations();
        renderConversations();
    } catch (error) {
        console.error(error);
    }
}

function renderConversations() {
    const container = document.getElementById('conversations-list');
    container.innerHTML = conversations.map(conv => `
        <div class="conversation-item ${currentChat === conv.user._id ? 'active' : ''}" 
             onclick="openChat('${conv.user._id}')">
            <img src="${conv.user.avatar}" alt="">
            <div class="conversation-info">
                <h4>${conv.user.firstName} ${conv.user.lastName}</h4>
                <p>${conv.lastMessage.content}</p>
            </div>
            ${conv.unread > 0 ? `<span class="badge show">${conv.unread}</span>` : ''}
        </div>
    `).join('');
}

async function openChat(userId) {
    currentChat = userId;
    const user = conversations.find(c => c.user._id === userId)?.user;
    
    if (!user) return;
    
    renderConversations();
    
    const chatContainer = document.getElementById('messenger-chat');
    chatContainer.innerHTML = `
        <div class="chat-header">
            <img src="${user.avatar}" alt="">
            <div>
                <h4>${user.firstName} ${user.lastName}</h4>
                <span style="font-size: 13px; color: var(--gray-500);">Active now</span>
            </div>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input">
            <i class="fas fa-plus-circle" style="font-size: 24px; color: var(--primary-color); cursor: pointer;"></i>
            <input type="text" id="message-input" placeholder="Aa" 
                   onkeypress="handleMessageKeypress(event, '${userId}')"
                   oninput="handleTyping('${userId}')">
            <button onclick="sendMessage('${userId}')"><i class="fas fa-paper-plane"></i></button>
        </div>
    `;
    
    // Load messages
    try {
        const messages = await API.getMessages(userId);
        const messagesContainer = document.getElementById('chat-messages');
        messagesContainer.innerHTML = messages.map(msg => createMessageHTML(msg)).join('');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } catch (error) {
        console.error(error);
    }
}

function createMessageHTML(message) {
    const isSent = message.sender._id === currentUser._id;
    return `
        <div class="message ${isSent ? 'sent' : 'received'}">
            ${message.content}
        </div>
    `;
}

function appendMessage(message) {
    const container = document.getElementById('chat-messages');
    if (container) {
        container.innerHTML += createMessageHTML(message);
        container.scrollTop = container.scrollHeight;
    }
}

async function sendMessage(receiverId) {
    const input = document.getElementById('message-input');
    const content = input.value.trim();
    
    if (!content) return;
    
    try {
        const message = await API.sendMessage(receiverId, content);
        input.value = '';
        appendMessage({
            ...message,
            sender: currentUser
        });
        
        if (socket) {
            socket.emit('send-message', {
                ...message,
                receiverId
            });
        }
    } catch (error) {
        console.error(error);
    }
}

function handleMessageKeypress(e, userId) {
    if (e.key === 'Enter') {
        sendMessage(userId);
    }
}

let typingTimer;
function handleTyping(receiverId) {
    if (socket) {
        socket.emit('typing', { receiverId });
        
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            socket.emit('stop-typing', { receiverId });
        }, 3000);
    }
}

function showTypingIndicator(userId) {
    // Show typing indicator in UI
}

function updateMessageBadge() {
    const badge = document.getElementById('message-badge');
    const currentCount = parseInt(badge.textContent) || 0;
    badge.textContent = currentCount + 1;
    badge.classList.add('show');
}
