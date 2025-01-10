const express = require('express');
const { Kafka } = require('kafkajs');
const router = express.Router();
const Notification = require('../models/notification');
const { MongoClient } = require('mongodb');
const kafka = new Kafka({ clientId: 'notification-app', brokers: ['localhost:9092'] });
const producer = kafka.producer();
const mongoClient = new MongoClient('mongodb://localhost:27017');

router.post('/notify', async (req, res) => {
  try {
    const { message, userId, priority, sendTime } = req.body;
    
    if (!message || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const notification = new Notification({
      message,
      userId,
      priority: priority || 'normal',
      sendTime: sendTime,
      createdAt: new Date(),
      status: 'pending'
    });

    await notification.save(); 
    // await mongoClient.connect();
    // const db = mongoClient.db('notifications');
    // await db.collection('notification').insertOne(notification);
  

    // Publish to Kafka
    await producer.connect();
    await producer.send({
      topic: 'notifications',
      messages: [{ value: JSON.stringify(notification) }],
    });

    res.status(200).json({ message: 'Notification received' });
  } catch (error) {
    console.error('Error processing notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    await producer.disconnect();
  }
});

module.exports = router;

