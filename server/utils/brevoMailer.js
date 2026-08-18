const { BrevoClient } = require('@getbrevo/brevo');

/**
 * Generates responsive HTML template for ShrimAruti OTP verification emails
 */
const getOtpHtmlTemplate = ({ userName, otp, expiryMinutes }) => {
  const name = userName ? userName.split(' ')[0] : 'Valued Customer';
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ShrimAruti OTP Verification</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
          color: #1e293b;
        }
        .container {
          max-width: 540px;
          margin: 30px auto;
          background-color: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }
        .header {
          background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
          padding: 28px 24px;
          text-align: center;
        }
        .header h1 {
          color: #ffffff;
          font-size: 24px;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.5px;
        }
        .header p {
          color: #fef3c7;
          font-size: 12px;
          font-weight: 600;
          margin: 4px 0 0 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .content {
          padding: 32px 28px;
        }
        .greeting {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 12px;
        }
        .text {
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
          margin: 0 0 24px 0;
        }
        .otp-box-container {
          text-align: center;
          margin: 28px 0;
        }
        .otp-box {
          display: inline-block;
          background: #fffbeb;
          border: 2px dashed #f59e0b;
          border-radius: 14px;
          padding: 16px 36px;
          font-size: 34px;
          font-weight: 900;
          letter-spacing: 10px;
          color: #b45309;
        }
        .validity-badge {
          display: inline-block;
          margin-top: 12px;
          background-color: #fef3c7;
          color: #92400e;
          font-size: 12px;
          font-weight: 700;
          padding: 6px 14px;
          border-radius: 20px;
        }
        .warning-box {
          background-color: #f8fafc;
          border-left: 4px solid #cbd5e1;
          padding: 14px 16px;
          border-radius: 4px 12px 12px 4px;
          font-size: 12px;
          color: #64748b;
          margin-top: 24px;
        }
        .footer {
          background-color: #f8fafc;
          padding: 20px 28px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          font-size: 12px;
          color: #94a3b8;
        }
        .footer p {
          margin: 4px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Shri Maruti</h1>
          <p>Authentic Gifting & Living</p>
        </div>
        <div class="content">
          <div class="greeting">Hello ${name},</div>
          <p class="text">Your ShrimAruti account verification code is provided below. Please enter this code to verify your request.</p>
          
          <div class="otp-box-container">
            <div class="otp-box">${otp}</div>
            <div>
              <span class="validity-badge">⏱️ Valid for ${expiryMinutes || 5} minutes</span>
            </div>
          </div>
          
          <div class="warning-box">
            🔒 <strong>Security Warning:</strong> Never share this OTP with anyone. ShrimAruti staff will never ask for your verification code. If you did not request this OTP, please ignore this email.
          </div>
        </div>
        <div class="footer">
          <p>Regards,</p>
          <p><strong>ShrimAruti Team</strong></p>
          <p style="margin-top: 12px; font-size: 11px;">© ${new Date().getFullYear()} ShrimAruti.com. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Sends OTP email using official Brevo SDK (@getbrevo/brevo v6)
 */
const sendBrevoOtpEmail = async ({ email, userName, otp, expiryMinutes = 5 }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'no-reply@shrimaruti.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'ShrimAruti';

  if (!apiKey || apiKey === 'your_brevo_api_key') {
    console.warn('[Brevo Warning]: BREVO_API_KEY is not configured in server/.env.');
    return {
      success: false,
      error: 'Brevo API Key is missing in server/.env. Please configure BREVO_API_KEY.'
    };
  }

  try {
    const client = new BrevoClient({ apiKey });

    const response = await client.transactionalEmails.sendTransacEmail({
      subject: `Your ShrimAruti Verification OTP is ${otp}`,
      htmlContent: getOtpHtmlTemplate({ userName, otp, expiryMinutes }),
      sender: { name: senderName, email: senderEmail },
      to: [{ email: email, name: userName || email }]
    });

    console.log(`[Brevo Email Sent Success] To: ${email} | Result:`, response);
    return { success: true, data: response };
  } catch (error) {
    const errBody = error.body || error.response?.body || error.message;
    console.error('[Brevo API Failure Details]:', errBody);

    let userFacingMessage = 'Unable to send OTP right now. Please try again in a few moments.';
    if (typeof errBody === 'object' && errBody.message) {
      if (errBody.message.includes('unrecognised IP address')) {
        userFacingMessage = 'Brevo Security Notice: Your IP address is not authorized in Brevo settings. Please allow all IPs or add your IP in Brevo Security settings (https://app.brevo.com/security/authorised_ips).';
      } else if (errBody.code === 'unauthorized') {
        userFacingMessage = 'Invalid Brevo API Key. Please check BREVO_API_KEY in server/.env.';
      }
    }

    return {
      success: false,
      error: userFacingMessage
    };
  }
};

module.exports = { sendBrevoOtpEmail };
