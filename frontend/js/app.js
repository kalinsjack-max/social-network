// Global event listeners
document.addEventListener('click', (e) => {
    // Close dropdowns when clicking outside
    if (!e.target.closest('.profile-menu')) {
        document.getElementById('profile-dropdown').classList.remove('show');
    }
    
    if (!e.target.closest('.nav-icon[onclick="showNotifications()"]')) {
        document.getElementById('notifications-dropdown').classList.remove('show');
    }
});

// Search functionality
document.getElementById('search-input').addEventListener('input', debounce(async (e) => {
    const query = e.target.value.trim();
    const resultsContainer = document.getElementById('search-results');
    
    if (query.length < 2) {
        resultsContainer.style.display = 'none';
        return;
    }
    
    try {
        const users = await API.searchUsers(query);
        resultsContainer.innerHTML = users.map(user => `
            <div class="conversation-item" onclick="showProfile('${user._id}')">
                <img src="${user.avatar}" alt="">
                <div class="conversation-info">
                    <h4>${user.firstName} ${user.lastName}</h4>
                </div>
            </div>
        `).join('');
        resultsContainer.style.display = 'block';
    } catch (error) {
        console.error(error);
    }
}, 300));

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function toggleProfileMenu() {
    document.getElementById('profile-dropdown').classList.toggle('show');
}

async function showNotifications() {
    const dropdown = document.getElementById('notifications-dropdown');
    dropdown.classList.toggle('show');
    
    if (dropdown.classList.contains('show')) {
        await loadNotifications();
    }
}

async function loadNotifications() {
    try {
        const notifications = await API.getNotifications();
        const container = document.getElementById('notifications-list');
        
        container.innerHTML = notifications.map(notif => `
            <div class="notification-item ${notif.isRead ? '' : 'unread'}" 
                 onclick="handleNotificationClick('${notif._id}', '${notif.type}', '${notif.relatedPost}')">
                <img src="${notif.sender.avatar}" alt="">
                <div class="notification-content">
                    <p><strong>${notif.sender.firstName} ${notif.sender.lastName}</strong> ${notif.message}</p>
                    <span>${formatTime(notif.createdAt)}</span>
                </div>
            </div>
        `).join('');
        
        // Update badge
        const unreadCount = notifications.filter(n => !n.isRead).length;
        const badge = document.getElementById('notif-badge');
        badge.textContent = unreadCount;
        badge.classList.toggle('show', unreadCount > 0);
        
    } catch (error) {
        console.error(error);
    }
}

async function handleNotificationClick(id, type, relatedId) {
    await API.markNotificationRead(id);
    
    if (type === 'like' || type === 'comment' || type === 'share') {
        showFeed();
    } else if (type === 'friend_request') {
        showProfile();
    }
    
    document.getElementById('notifications-dropdown').classList.remove('show');
    loadNotifications();
}

function updateUserStatus(userId, isOnline) {
    // Update UI to show user online/offline status
}

// Close modals on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }
});
