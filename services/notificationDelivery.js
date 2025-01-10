const User = require('../models/user');
const Notification = require('../models/notification');
const { checkThrottling } = require('../queries/throttling');
const { isInQuietHours } = require('../queries/quietHours');
const { checkDuplication } = require('../queries/deduplication');
const { aggregateLowPriorityNotifications } = require('../queries/aggregation');
const { getUrgentAlerts } = require('../queries/urgentAlerts');
const { MongoClient } = require('mongodb');
const mongoClient = new MongoClient('mongodb://localhost:27017');

async function deliverNotifications() {
  
  const urgentAlerts = await getUrgentAlerts();
  for (const alert of urgentAlerts) {
    await processNotification(alert);
  }

  const pendingNotifications = await Notification.find({ status: 'pending', priority: { $ne: 'high' } });
  for (const notification of pendingNotifications) {
    await processNotification(notification);
  }
}

async function processNotification(notification) {
  await mongoClient.connect();
  const user = await User.findOne({ userId: notification.userId });
  if (!user) {
    console.error(`User not found for notification: ${notification._id}`);
    return;
  }

  if (!(await checkThrottling(user.userId))) {
    await rescheduleNotification(notification);
    return;
  }

  if (isInQuietHours(user, new Date())) {
    await rescheduleNotification(notification);
    return;
  }

  if (await checkDuplication(notification)) {
    
    const db = mongoClient.db('test');
    await Notification.updateOne({ _id: notification._id }, { status: 'suppressed' });
        // await db.collection('scheduledNotifications').deleteOne({ _id: notification._id });
    return;
  }

  if (notification.priority === 'low') {
    const aggregatedNotification = await aggregateLowPriorityNotifications(user.userId);
    if (aggregatedNotification) {
      await sendNotification(aggregatedNotification, user);
      return;
    }
  }

  await sendNotification(notification, user);
}

async function sendNotification(notification, user) {
  for (const channel of user.preferences.channels) {
    try {
      switch (channel) {
        case 'email':
          await sendEmail(notification, user);
          break;
        case 'sms':
          await sendSMS(notification, user);
          break;
        case 'push':
          await sendPushNotification(notification, user);
          break;
      }
      await Notification.updateOne({ _id: notification._id }, { status: 'sent' });
      return;
    } catch (error) {
      console.error(`Failed to send notification via ${channel}:`, error);
    }
  }
  
  await Notification.updateOne({ _id: notification._id }, { status: 'failed' });
}

async function rescheduleNotification(notification) {
  const newSendTime = new Date(Date.now() + 60 * 60 * 1000); // Reschedule for 1 hour later
  const db = mongoClient.db('test');
  await Notification.updateOne({ _id: notification._id }, { sendTime: newSendTime });
  await db.collection('scheduledNotifications').updateOne({ _id: notification._id }, { sendTime: newSendTime });
}

// Mock delivery functions
async function sendEmail(notification, user) {
  console.log(`Sending email to ${user.userId}: ${notification.message}`);
}

async function sendSMS(notification, user) {
  console.log(`Sending SMS to ${user.userId}: ${notification.message}`);
}

async function sendPushNotification(notification, user) {
  console.log(`Sending push notification to ${user.userId}: ${notification.message}`);
}

module.exports = { deliverNotifications,sendNotification };

