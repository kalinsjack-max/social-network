const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authMiddleware = require('../middleware/auth');

// Get conversations
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    })
    .populate('sender', 'firstName lastName avatar')
    .populate('receiver', 'firstName lastName avatar')
    .sort({ createdAt: -1 });

    // Group by conversation
    const conversations = {};
    messages.forEach(msg => {
      const otherUser = msg.sender._id.toString() === req.user.id 
        ? msg.receiver 
        : msg.sender;
      
      if (!conversations[otherUser._id]) {
        conversations[otherUser._id] = {
          user: otherUser,
          lastMessage: msg,
          unread: 0
        };
      }
      
      if (!msg.isRead && msg.receiver.toString() === req.user.id) {
        conversations[otherUser._id].unread++;
      }
    });

    res.json(Object.values(conversations));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages with user
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    })
    .populate('sender', 'firstName lastName avatar')
    .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      { sender: req.params.userId, receiver: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    const message = new Message({
      sender: req.user.id,
      receiver: receiverId,
      content
    });

    await message.save();
    await message.populate('sender receiver', 'firstName lastName avatar');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
