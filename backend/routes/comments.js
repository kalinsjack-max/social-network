const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/auth');

// Add comment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { postId, content, parentComment } = req.body;

    const comment = new Comment({
      post: postId,
      author: req.user.id,
      content,
      parentComment: parentComment || null
    });

    await comment.save();
    await comment.populate('author', 'firstName lastName avatar');

    // Add to post
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id }
    });

    // Create notification
    const post = await Post.findById(postId);
    if (post.author.toString() !== req.user.id) {
      const notification = new Notification({
        recipient: post.author,
        sender: req.user.id,
        type: 'comment',
        message: 'commented on your post',
        relatedPost: postId
      });
      await notification.save();
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Like comment
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    const likeIndex = comment.likes.findIndex(
      like => like.user.toString() === req.user.id
    );

    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push({ user: req.user.id });
    }

    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
