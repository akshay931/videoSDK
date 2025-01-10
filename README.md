# Notification System

## Description
This project is a distributed notification system designed to process and deliver notifications to users through various channels (email, SMS, push notifications). The system ingests notifications, processes them based on user preferences and various business rules, and then delivers them to the appropriate channel.

## Implementation Details
- **Backend Framework**: The system is built with **Node.js** and **Express.js**.
- **Database**: **MongoDB** is used for storing user preferences, notifications, and analytics data.
- **Kafka**: Kafka is used as the messaging system to handle notification ingestion and processing.
- **Job Scheduling**: **node-schedule** is used for scheduling notification delivery and periodic checks.
- **Mongoose**: Used for interacting with MongoDB.

## Design Choices
1. **Kafka for Decoupling**: Kafka is used to decouple the ingestion, processing, and delivery of notifications. This ensures that notifications can be processed independently and asynchronously, allowing for better scalability and resilience.
2. **MongoDB**: Chose MongoDB due to its flexibility in handling semi-structured data, especially for user preferences and notification statuses.
3. **User Preferences**: Users can configure preferences for receiving notifications through channels such as email, SMS, and push notifications. Additionally, they can define quiet hours to avoid receiving notifications during specific periods.
4. **Notification Throttling and Deduplication**: A throttling mechanism ensures that users do not receive too many notifications in a short period. Deduplication prevents sending the same notification more than once within a specific time window.
5. **Priority-Based Delivery**: Notifications are prioritized, with high-priority notifications being sent immediately, while low-priority notifications are aggregated and sent later.

## Known Issues
1. **Error Handling in Kafka Consumer**: Error handling for Kafka consumer is not yet fully implemented. If Kafka is unavailable or there's a consumer issue, it might lead to failures in message consumption.
2. **Notification Delivery Failure Handling**: In some cases, if the notification fails to be sent via any channel, it will be marked as 'failed'. The retry logic for failed notifications is not yet implemented.
3. **Scaling Issues**: The current implementation is not optimized for scaling, as all services are running in a single instance without load balancing.
4. **Notification Status Issue**: When sending a notification with **normal** or **low priority** and a **future send time**, the notification should be saved with a **pending** status in the database. However, it is incorrectly being saved with a **sent** status instead. This issue needs to be addressed to ensure proper notification status handling before delivery.

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/akshay931/videoSDK.git
