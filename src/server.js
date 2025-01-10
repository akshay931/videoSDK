const express = require('express');
const mongoose = require('mongoose');
const { Kafka } = require('kafkajs');
const notificationIngestion = require('../services/notificationIngestion');
const notificationProcessing = require('../services/notificationProcessing');
const notificationDelivery = require('../services/notificationDelivery');
const analytics = require('../services/analytics');

const app = express();
app.use(express.json());


mongoose.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });

const kafka = new Kafka({
  clientId: 'client1',
  brokers: ['localhost:9092'] 
});

app.use('/api', notificationIngestion);
app.use('/api', analytics);


notificationProcessing.processNotifications().catch(console.error);


setInterval(() => {
  notificationDelivery.deliverNotifications().catch(console.error);
}, 1000); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

