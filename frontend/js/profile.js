async function showProfile(userId = null) {
    const id = userId || currentUser._id;
    
    try {
        const user = await API.getUser(id);
        renderProfile(user);
        
        document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
        document.getElementById('profile-page').classList.remove('hidden');
        document.getElementById('feed-container').classList.add('hidden');
        
        // Load user's posts
        const posts = await API.getFeed();
        const userPosts = posts.filter(p => p.author._id === id);
        document.getElementById('profile-posts').innerHTML = userPosts.map(post => createPostHTML(post)).join('');
    } catch (error) {
        console.error(error);
    }
}

function renderProfile(user) {
    document.getElementById('profile-avatar-img').src = user.avatar || 'https://via.placeholder.com/150';
    document.getElementById('cover-photo-img').src = user.coverPhoto || 'https://via.placeholder.com/1200x400';
    document.getElementById('profile-name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('profile-bio').textContent = user.bio || '';
    document.getElementById('profile-bio-full').textContent = user.bio || 'No bio added yet.';
    document.getElementById('profile-work').textContent = user.work || 'No workplace added';
    document.getElementById('profile-education').textContent = user.education || 'No education added';
    document.getElementById('profile-location').textContent = user.location || 'No location added';
    
    // Render friends
    const friendsContainer = document.getElementById('profile-friends');
    if (user.friends && user.friends.length > 0) {
        friendsContainer.innerHTML = user.friends.slice(0, 9).map(friend => `
            <img src="${friend.avatar}" alt="" title="${friend.firstName} ${friend.lastName}">
        `).join('');
    }
}

function showSettings() {
    alert('Settings page coming soon!');
}
