let posts = [];

async function loadFeed() {
    try {
        posts = await API.getFeed();
        renderPosts();
    } catch (error) {
        console.error('Error loading feed:', error);
    }
}

function renderPosts() {
    const container = document.getElementById('posts-feed');
    container.innerHTML = posts.map(post => createPostHTML(post)).join('');
}

function createPostHTML(post) {
    const author = post.author;
    const isLiked = post.likes.some(like => like.user === currentUser._id);
    const likeCount = post.likes.length;
    const commentCount = post.comments.length;
    const shareCount = post.shares.length;
    
    return `
        <div class="post" data-id="${post._id}">
            <div class="post-header">
                <div class="post-author">
                    <img src="${author.avatar}" alt="" onclick="showProfile('${author._id}')">
                    <div class="post-author-info">
                        <h4>${author.firstName} ${author.lastName}</h4>
                        <span>${formatTime(post.createdAt)} · <i class="fas fa-globe-americas"></i></span>
                    </div>
                </div>
                <i class="fas fa-ellipsis-h" style="cursor: pointer; padding: 8px; border-radius: 50%;"></i>
            </div>
            <div class="post-content">${post.content}</div>
            ${post.images.length ? `
                <div class="post-images">
                    ${post.images.map(img => `<img src="${img}" alt="">`).join('')}
                </div>
            ` : ''}
            <div class="post-stats">
                <span>${likeCount} likes</span>
                <span>${commentCount} comments · ${shareCount} shares</span>
            </div>
            <div class="post-actions">
                <div class="post-action ${isLiked ? 'liked' : ''}" onclick="toggleLike('${post._id}')">
                    <i class="${isLiked ? 'fas' : 'far'} fa-thumbs-up"></i>
                    <span>Like</span>
                </div>
                <div class="post-action" onclick="focusComment('${post._id}')">
                    <i class="far fa-comment-alt"></i>
                    <span>Comment</span>
                </div>
                <div class="post-action" onclick="sharePost('${post._id}')">
                    <i class="fas fa-share"></i>
                    <span>Share</span>
                </div>
            </div>
            <div class="comments-section">
                ${post.comments.map(comment => createCommentHTML(comment)).join('')}
                <div class="add-comment">
                    <img src="${currentUser.avatar}" alt="">
                    <input type="text" placeholder="Write a comment..." 
                           id="comment-input-${post._id}"
                           onkeypress="handleCommentKeypress(event, '${post._id}')">
                </div>
            </div>
        </div>
    `;
}

function createCommentHTML(comment) {
    return `
        <div class="comment">
            <img src="${comment.author.avatar}" alt="">
            <div style="flex: 1;">
                <div class="comment-content">
                    <h5>${comment.author.firstName} ${comment.author.lastName}</h5>
                    <p>${comment.content}</p>
                </div>
                <div class="comment-actions">
                    <span>Like</span>
                    <span>Reply</span>
                    <span>${formatTime(comment.createdAt)}</span>
                </div>
            </div>
        </div>
    `;
}

async function toggleLike(postId) {
    try {
        await API.likePost(postId);
        loadFeed();
    } catch (error) {
        console.error(error);
    }
}

async function handleCommentKeypress(e, postId) {
    if (e.key === 'Enter' && e.target.value.trim()) {
        try {
            await API.addComment(postId, e.target.value.trim());
            e.target.value = '';
            loadFeed();
        } catch (error) {
            console.error(error);
        }
    }
}

function focusComment(postId) {
    document.getElementById(`comment-input-${postId}`).focus();
}

function openCreatePostModal() {
    document.getElementById('create-post-modal').classList.add('show');
}

function closeCreatePostModal() {
    document.getElementById('create-post-modal').classList.remove('show');
    document.getElementById('post-content').value = '';
    document.getElementById('image-preview').innerHTML = '';
}

function previewImages(input) {
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '';
    
    Array.from(input.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.innerHTML += `<img src="${e.target.result}" alt="">`;
        };
        reader.readAsDataURL(file);
    });
}

async function createPost() {
    const content = document.getElementById('post-content').value;
    const privacy = document.getElementById('post-privacy').value;
    
    if (!content.trim()) return;
    
    try {
        await API.createPost(content, [], privacy);
        closeCreatePostModal();
        loadFeed();
    } catch (error) {
        alert(error.message);
    }
}

function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = (now - date) / 1000;
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
    return date.toLocaleDateString();
}

function showFeed() {
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('feed-container').classList.remove('hidden');
    document.querySelectorAll('.nav-icon').forEach(i => i.classList.remove('active'));
    document.querySelector('.nav-icon[onclick="showFeed()"]').classList.add('active');
}

function showWatch() {
    alert('Watch feature coming soon!');
}

function showMarketplace() {
    alert('Marketplace feature coming soon!');
}

function showGroups() {
    alert('Groups feature coming soon!');
}

function showMemories() {
    alert('Memories feature coming soon!');
}

function showSaved() {
    alert('Saved feature coming soon!');
}

function showFriends() {
    alert('Friends page coming soon!');
}
