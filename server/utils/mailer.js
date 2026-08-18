const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_USER !== 'your_email@gmail.com') {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Fallback to JSON test transport if SMTP is unconfigured
  return {
    sendMail: async (options) => {
      console.log(`[Email Simulated]: To=${options.to}, Subject="${options.subject}"`);
      return { messageId: 'simulated-msg-id' };
    }
  };
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"${process.env.FROM_NAME || 'ShriMaruti'}" <${process.env.FROM_EMAIL || 'support@shrimaruti.com'}>`,
      to,
      subject,
      html
    });
    console.log(`[Email Sent] To: ${to} | ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email Error]: ${error.message}`);
    return false;
  }
};

module.exports = sendEmail;
