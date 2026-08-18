const GiftCard = require('../models/GiftCard');
const { v4: uuidv4 } = require('uuid');
const sendEmail = require('../utils/mailer');

// @route POST /api/giftcards/purchase
exports.purchaseGiftCard = async (req, res) => {
  try {
    const { initialBalance, purchaserName, purchaserEmail, recipientName, recipientEmail, giftMessage } = req.body;

    const uniqueCode = 'GIFT-' + uuidv4().substring(0, 8).toUpperCase();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year validity

    const giftCard = await GiftCard.create({
      code: uniqueCode,
      initialBalance: Number(initialBalance),
      currentBalance: Number(initialBalance),
      purchaserName,
      purchaserEmail,
      recipientName,
      recipientEmail,
      giftMessage,
      expiryDate
    });

    // Send email with code to recipient
    sendEmail({
      to: recipientEmail,
      subject: `🎁 You've received a ₹${initialBalance} Shri Maruti Digital Gift Card from ${purchaserName}!`,
      html: `
        <h3>Surprise! ${purchaserName} sent you a Gift Card!</h3>
        <p><strong>Gift Code:</strong> <span style="font-size:20px; font-weight:bold; color:#d97706; background:#fef3c7; padding:4px 10px; border-radius:4px;">${uniqueCode}</span></p>
        <p><strong>Amount:</strong> ₹${initialBalance}</p>
        <p><strong>Message:</strong> "${giftMessage || 'Enjoy your gift!'}"</p>
        <p>Redeem this code at checkout on ShriMaruti.com!</p>
      `
    });

    res.status(201).json({ success: true, giftCard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/giftcards/validate
exports.validateGiftCard = async (req, res) => {
  try {
    const { code } = req.body;
    const giftCard = await GiftCard.findOne({ code: code.toUpperCase(), isActive: true });

    if (!giftCard) {
      return res.status(404).json({ success: false, message: 'Invalid gift card code' });
    }

    if (new Date() > giftCard.expiryDate) {
      return res.status(400).json({ success: false, message: 'Gift card has expired' });
    }

    if (giftCard.currentBalance <= 0) {
      return res.status(400).json({ success: false, message: 'Gift card balance is 0' });
    }

    res.json({
      success: true,
      code: giftCard.code,
      balance: giftCard.currentBalance,
      expiryDate: giftCard.expiryDate
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
