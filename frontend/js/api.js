const API_URL = 'http://localhost:5000/api';

class API {
    static async request(endpoint, options = {}) {
        const url = `${API_URL}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Something went wrong');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    static login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: { email, password }
        });
    }

    static register(firstName, lastName, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: { firstName, lastName, email, password }
        });
    }

    static getMe() {
        return this.request('/auth/me');
    }

    // Users
    static getUser(id) {
        return this.request(`/users/${id}`);
    }

    static updateProfile(data) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: data
        });
    }

    static searchUsers(query) {
        return this.request(`/users/search/${query}`);
    }

    static sendFriendRequest(userId) {
        return this.request(`/users/friend-request/${userId}`, {
            method: 'POST'
        });
    }

    static acceptFriendRequest(userId) {
        return this.request(`/users/accept-request/${userId}`, {
            method: 'POST'
        });
    }

    // Posts
    static getFeed() {
        return this.request('/posts/feed');
    }

    static createPost(content, images = [], privacy = 'public') {
        return this.request('/posts', {
            method: 'POST',
            body: { content, images, privacy }
        });
    }

    static likePost(postId) {
        return this.request(`/posts/${postId}/like`, {
            method: 'POST'
        });
    }

    static sharePost(postId, content) {
        return this.request(`/posts/${postId}/share`, {
            method: 'POST',
            body: { content }
        });
    }

    static deletePost(postId) {
        return this.request(`/posts/${postId}`, {
            method: 'DELETE'
        });
    }

    // Comments
    static addComment(postId, content, parentComment = null) {
        return this.request('/comments', {
            method: 'POST',
            body: { postId, content, parentComment }
        });
    }

    static likeComment(commentId) {
        return this.request(`/comments/${commentId}/like`, {
            method: 'POST'
        });
    }

    // Messages
    static getConversations() {
        return this.request('/messages/conversations');
    }

    static getMessages(userId) {
        return this.request(`/messages/${userId}`);
    }

    static sendMessage(receiverId, content) {
        return this.request('/messages', {
            method: 'POST',
            body: { receiverId, content }
        });
    }

    // Notifications
    static getNotifications() {
        return this.request('/notifications');
    }

    static markNotificationRead(id) {
        return this.request(`/notifications/${id}/read`, {
            method: 'PUT'
        });
    }

    static markAllNotificationsRead() {
        return this.request('/notifications/read-all', {
            method: 'PUT'
        });
    }
}
