const User = require('../models/User');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join personal room
    socket.on('join', async (userId) => {
      socket.userId = userId;
      socket.join(userId);
      
      // Update online status
      await User.findByIdAndUpdate(userId, { isOnline: true });
      io.emit('user-online', userId);
    });

    // Handle typing
    socket.on('typing', ({ receiverId }) => {
      io.to(receiverId).emit('typing', { userId: socket.userId });
    });

    // Handle stop typing
    socket.on('stop-typing', ({ receiverId }) => {
      io.to(receiverId).emit('stop-typing', { userId: socket.userId });
    });

    // Handle new message
    socket.on('send-message', (data) => {
      io.to(data.receiverId).emit('new-message', data);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      if (socket.userId) {
        await User.findByIdAndUpdate(socket.userId, { 
          isOnline: false, 
          lastSeen: new Date() 
        });
        io.emit('user-offline', socket.userId);
      }
    });
  });
};
