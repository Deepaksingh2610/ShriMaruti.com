const cron = require('node-cron');
const Order = require('../models/Order');
const User = require('../models/User');
const sendEmail = require('./mailer');

const initCronJobs = () => {
  // Check for abandoned pending orders every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const pendingOrders = await Order.find({
        paymentStatus: 'Pending',
        abandonedCartReminderSent: false,
        createdAt: { $lte: twoHoursAgo }
      });

      for (const order of pendingOrders) {
        const recipientEmail = order.senderDetails.email;
        if (recipientEmail) {
          await sendEmail({
            to: recipientEmail,
            subject: '🎁 Did you leave something special in your cart at Shri Maruti?',
            html: `
              <h3>Hello ${order.senderDetails.name},</h3>
              <p>You left items in your cart at ShriMaruti.com! Complete your order now and bring a smile to your loved ones.</p>
              <p><strong>Order Summary:</strong> ${order.orderItems.length} items (Total: ₹${order.pricing.totalAmount})</p>
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/cart" style="background:#d97706; color:#fff; padding:10px 20px; text-decoration:none; border-radius:5px; inline-block;">Return to Cart</a>
            `
          });
          order.abandonedCartReminderSent = true;
          await order.save();
        }
      }
    } catch (err) {
      console.error('Abandoned Cart Cron Error:', err.message);
    }
  });

  // Check for upcoming occasion reminders daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      const users = await User.find({ 'reminders.0': { $exists: true } });
      const today = new Date();

      for (const user of users) {
        for (const reminder of user.reminders) {
          const reminderDate = new Date(reminder.date);
          const diffDays = Math.ceil((reminderDate - today) / (1000 * 60 * 60 * 24));

          if (diffDays === reminder.emailAlertDaysBefore) {
            await sendEmail({
              to: user.email,
              subject: `🎉 Reminder: ${reminder.title} (${reminder.recipientName}) is coming up in ${diffDays} days!`,
              html: `
                <h3>Hello ${user.name},</h3>
                <p>Don't forget! <strong>${reminder.recipientName}'s ${reminder.occasion}</strong> is on <strong>${reminderDate.toLocaleDateString('en-IN')}</strong>.</p>
                <p>Order a personalized gift now on ShriMaruti.com to ensure timely delivery!</p>
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="background:#d97706; color:#fff; padding:10px 20px; text-decoration:none; border-radius:5px; inline-block;">Browse Gifts</a>
              `
            });
          }
        }
      }
    } catch (err) {
      console.error('Occasion Reminders Cron Error:', err.message);
    }
  });

  console.log('[Cron Jobs] Initialized background schedulers for abandoned cart & occasion reminders.');
};

module.exports = initCronJobs;
