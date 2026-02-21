const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

// Create post
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { content, images, privacy } = req.body;
    
    const post = new Post({
      author: req.user.id,
      content,
      images: images || [],
      privacy: privacy || 'public'
    });

    await post.save();
    await post.populate('author', 'firstName lastName avatar');

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get feed posts
router.get('/feed', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const friendIds = user.friends.map(friend => friend.toString());
    friendIds.push(req.user.id);

    const posts = await Post.find({
      $or: [
        { privacy: 'public' },
        { author: { $in: friendIds } },
        { author: req.user.id }
      ]
    })
    .populate('author', 'firstName lastName avatar')
    .populate({
      path: 'comments',
      populate: {
        path: 'author',
        select: 'firstName lastName avatar'
      }
    })
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like/Unlike post
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user.id
    );

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push({ user: req.user.id });
      
      // Create notification
      if (post.author.toString() !== req.user.id) {
        const notification = new Notification({
          recipient: post.author,
          sender: req.user.id,
          type: 'like',
          message: 'liked your post',
          relatedPost: post._id
        });
        await notification.save();
      }
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Share post
router.post('/:id/share', authMiddleware, async (req, res) => {
  try {
    const originalPost = await Post.findById(req.params.id);
    
    if (!originalPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const sharedPost = new Post({
      author: req.user.id,
      content: req.body.content || '',
      isShared: true,
      originalPost: originalPost._id,
      privacy: req.body.privacy || 'public'
    });

    await sharedPost.save();
    await sharedPost.populate([
      { path: 'author', select: 'firstName lastName avatar' },
      { path: 'originalPost', populate: { path: 'author', select: 'firstName lastName avatar' } }
    ]);

    // Add share record to original
    originalPost.shares.push({ user: req.user.id });
    await originalPost.save();

    res.status(201).json(sharedPost);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete post
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.remove();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
