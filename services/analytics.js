const express = require('express');
const router = express.Router();
const Notification = require('../models/notification');

router.get('/analytics', async (req, res) => {
  try {
    const totalSent = await Notification.countDocuments({ status: 'sent' });
    const totalFailed = await Notification.countDocuments({ status: 'failed' });
    const totalRetried = await Notification.countDocuments({ status: 'retried' });

    const deliveryStats = {
      totalSent,
      totalFailed,
      totalRetried
    };

    
    const sentNotifications = await Notification.find({ status: 'sent' });
    const totalDeliveryTime = sentNotifications.reduce((sum, notification) => {
      return sum + (notification.sentAt - notification.createdAt);
    }, 0);
    const averageDeliveryTime = totalDeliveryTime / sentNotifications.length;

    
    const totalResponses = await Notification.countDocuments({ userResponded: true });
    const responseRate = totalResponses / totalSent;

    const userEngagement = {
      averageDeliveryTime,
      responseRate
    };

    res.json({
      deliveryStats,
      userEngagement
    });
  } catch (error) {
    console.error('Error generating analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

