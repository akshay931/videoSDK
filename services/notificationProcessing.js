const { Kafka } = require('kafkajs');
const { MongoClient } = require('mongodb');
const User = require('../models/user');
const Notification = require('../models/notification');
const schedule = require('node-schedule');
// const {sendNotification} = require('./notificationDelivery')
const { checkDuplication } = require('../queries/deduplication');
const kafka = new Kafka({ clientId: 'notification-processor', brokers: ['localhost:9092'] });
const consumer = kafka.consumer({ groupId: 'notification-processor-group' });
const mongoClient = new MongoClient('mongodb://localhost:27017');

async function processNotifications() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'notifications', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const notification = JSON.parse(message.value.toString());
      if (notification.priority == 'high' || !notification.sendTime || new Date(notification.sendTime) <= new Date() )
{
  //
        // Process immediately
        // if (await checkDuplication(notification)) {
        //   await Notification.updateOne({ _id: notification._id }, { status: 'suppressed' });
        //   return;
        // }
        // const user = await User.findOne({ userId: notification.userId });
        await sendNotification(notification);
    
      } else {
        // Schedule for later
        
        await storeNotification(notification);
      }
    },
  });
}

async function storeNotification(notification) {
  await mongoClient.connect();
  const db = mongoClient.db('test');
  await db.collection('scheduledNotifications').insertOne({
    ...notification,
    sendTime: new Date(notification.sendTime), 
    createdAt:new Date(notification.createdAt)
  });
}

async function checkScheduledNotifications() {
  const db = mongoClient.db('test');
  const now = new Date();
  const notifications = await db.collection('scheduledNotifications')
    .find({ sendTime: { $lte: now } })
    .toArray();
  console.log(notifications)
  for (const notification of notifications) {
    const user = await User.findOne({ userId: notification.userId });
    await sendNotification(notification,user);
    await db.collection('scheduledNotifications').deleteOne({ _id: notification._id });
  }
}

async function sendNotification(notification) {
  
  console.log('Sending notification:', notification);
}
// async function sendNotification(notification, user) {
//   for (const channel of user.preferences.channels) {
//     try {
//       switch (channel) {
//         case 'email':
//           await sendEmail(notification, user);
//           break;
//         case 'sms':
//           await sendSMS(notification, user);
//           break;
//         case 'push':
//           await sendPushNotification(notification, user);
//           break;
//       }
//       await Notification.updateOne({ _id: notification._id }, { status: 'sent' });
//       return;
//     } catch (error) {
//       console.error(`Failed to send notification via ${channel}:`, error);
//     }
//   }

// async function sendEmail(notification, user) {
//   console.log(`Sending email to ${user.userId}: ${notification.message}`);
// }

// async function sendSMS(notification, user) {
//   console.log(`Sending SMS to ${user.userId}: ${notification.message}`);
// }

// async function sendPushNotification(notification, user) {
//   console.log(`Sending push notification to ${user.userId}: ${notification.message}`);
// }
  
//   // If all channels fail, mark as failed
//   await Notification.updateOne({ _id: notification._id }, { status: 'failed' });
// }
// Run the processor
processNotifications().catch(console.error);

// Schedule periodic checks for pending notifications
schedule.scheduleJob('*/1 * * * *', checkScheduledNotifications);

module.exports = { processNotifications, checkScheduledNotifications };

