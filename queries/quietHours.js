const User = require('../models/user');

function isInQuietHours(user, currentTime) {
  if (!user.preferences.quietHours) {
    return false;
  }

  const { start, end } = user.preferences.quietHours;
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  
  const startTime = new Date(currentTime);
  startTime.setHours(startHour, startMinute, 0);
  
  const endTime = new Date(currentTime);
  endTime.setHours(endHour, endMinute, 0);
  
  if (endTime < startTime) {
    endTime.setDate(endTime.getDate() + 1);
  }

  return currentTime >= startTime && currentTime < endTime;
}

module.exports = { isInQuietHours };

