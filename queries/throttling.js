const User = require('../models/user');
const Notification = require('../models/notification');

async function checkThrottling(userId) {
  const user = await User.findOne({ userId });
  if (!user) {
    throw new Error('User not found');
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentNotifications = await Notification.countDocuments({
    userId,
    createdAt: { $gte: oneHourAgo },
    status: 'sent'
  });

  return recentNotifications < user.preferences.notificationLimit;
}

module.exports = { checkThrottling };

