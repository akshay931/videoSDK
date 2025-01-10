const Notification = require('../models/notification');

async function aggregateLowPriorityNotifications(userId) {
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
  const notifications = await Notification.find({
    userId,
    priority: 'low',
    sendTime: { $lte: oneHourFromNow },
    status: 'pending'
  });

  if (notifications.length > 1) {
    const summary = `You have ${notifications.length}
      ${notifications.map(n => '- ' + n.message).join('\n')}`;
    
    await Notification.updateMany(
      { _id: { $in: notifications.map(n => n._id) } },
      { $set: { status: 'aggregated' } }
    );

    return new Notification({
      userId,
      message: summary,
      priority: 'low',
      sendTime: new Date(),
      status: 'pending'
    });
  }

  return null;
}

module.exports = { aggregateLowPriorityNotifications };

