const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Get user profile
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('friends', 'firstName lastName avatar')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send friend request
router.post('/friend-request/:id', authMiddleware, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!targetUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already friends
    if (currentUser.friends.includes(req.params.id)) {
      return res.status(400).json({ message: 'Already friends' });
    }

    // Check if request already sent
    if (targetUser.friendRequests.some(req => req.from.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    targetUser.friendRequests.push({ from: req.user.id });
    currentUser.sentRequests.push(req.params.id);

    await targetUser.save();
    await currentUser.save();

    res.json({ message: 'Friend request sent' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept friend request
router.post('/accept-request/:id', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const requestSender = await User.findById(req.params.id);

    // Remove from requests
    currentUser.friendRequests = currentUser.friendRequests.filter(
      req => req.from.toString() !== req.params.id
    );
    
    // Add to friends
    currentUser.friends.push(req.params.id);
    requestSender.friends.push(req.user.id);

    // Remove from sent requests
    requestSender.sentRequests = requestSender.sentRequests.filter(
      id => id.toString() !== req.user.id
    );

    await currentUser.save();
    await requestSender.save();

    res.json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search/:query', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({
      $or: [
        { firstName: { $regex: req.params.query, $options: 'i' } },
        { lastName: { $regex: req.params.query, $options: 'i' } }
      ]
    }).select('firstName lastName avatar').limit(20);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
