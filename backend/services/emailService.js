const { Resend } = require('resend');

// Requires RESEND_API_KEY in .env
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendOtpEmail = async (toEmail, otp) => {
  try {
    const data = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>', // Dummy sender provided by resend for testing, usually a custom verified domain
      to: toEmail,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #333;">Your Authentication Code</h2>
          <p>Please use the following 6-digit One-Time Password (OTP) to complete your login:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; padding: 10px 20px; background-color: #f4f4f4; border-radius: 5px; letter-spacing: 5px;">${otp}</span>
          </div>
          <p style="color: red; font-size: 12px;">This code expires securely in 5 minutes.</p>
        </div>
      `
    });
    return data;
  } catch (error) {
    console.error('Error sending OTP Email:', error);
    throw error;
  }
};
