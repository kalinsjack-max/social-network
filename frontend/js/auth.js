let currentUser = null;
let socket = null;

// Check auth status on load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        initializeApp();
    } else {
        showAuth();
    }
});

// Login Form
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const data = await API.login(email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        initializeApp();
    } catch (error) {
        alert(error.message);
    }
});

// Register Form
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstName = document.getElementById('reg-firstname').value;
    const lastName = document.getElementById('reg-lastname').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const data = await API.register(firstName, lastName, email, password);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        initializeApp();
    } catch (error) {
        alert(error.message);
    }
});

function showAuth() {
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

function showRegister() {
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.add('active');
}

function showLogin() {
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('login-form').classList.add('active');
}

async function initializeApp() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    
    try {
        currentUser = await API.getMe();
        updateUI();
        initializeSocket();
        loadFeed();
        loadNotifications();
        loadConversations();
    } catch (error) {
        logout();
    }
}

function updateUI() {
    // Update all avatar images
    const avatar = currentUser.avatar || 'https://via.placeholder.com/150';
    document.getElementById('nav-avatar').src = avatar;
    document.getElementById('sidebar-avatar').src = avatar;
    document.getElementById('story-avatar').src = avatar;
    document.getElementById('post-avatar').src = avatar;
    document.getElementById('modal-avatar').src = avatar;
    document.getElementById('sidebar-name').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('modal-username').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
}

function initializeSocket() {
    socket = io('http://localhost:5000');
    
    socket.emit('join', currentUser._id);
    
    socket.on('new-message', (data) => {
        if (window.currentChat === data.sender) {
            appendMessage(data);
        }
        updateMessageBadge();
    });
    
    socket.on('typing', (data) => {
        showTypingIndicator(data.userId);
    });
    
    socket.on('user-online', (userId) => {
        updateUserStatus(userId, true);
    });
    
    socket.on('user-offline', (userId) => {
        updateUserStatus(userId, false);
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (socket) socket.disconnect();
    showAuth();
}
