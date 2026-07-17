import Notification from '../models/Notification.js';

// Store io reference
let io = null;

export const setIO = (socketIO) => {
  io = socketIO;
};

/**
 * Create a notification and emit via Socket.io
 */
export const sendNotification = async ({ recipient, type, title, message, data = {} }) => {
  try {
    const notification = await Notification.create({
      recipient,
      type,
      title,
      message,
      data
    });

    // Emit real-time notification
    if (io) {
      io.to(`user:${recipient}`).emit('notification:new', notification);
    }

    return notification;
  } catch (error) {
    console.error('Notification error:', error.message);
    return null;
  }
};

/**
 * Get unread notification count for a user
 */
export const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ recipient: userId, read: false });
};

export default { sendNotification, getUnreadCount, setIO };
