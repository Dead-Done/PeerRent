// config/mailer.js
const nodemailer = require('nodemailer');

// Configure the transporter using Mailtrap credentials from .env
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

// Utility function to send the email
const sendLoginCode = async (email, code) => {
  const mailOptions = {
    from: '"PeerRent" <no-reply@peerrent.com>',
    to: email,
    subject: 'Your PeerRent Login Code',
    text: `Your temporary login code is: ${code}. This code will expire in 10 minutes.`,
    html: `<b>Your temporary login code is: ${code}</b><p>This code will expire in 10 minutes.</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Login code email sent successfully.');
  } catch (error) {
    console.error('Error sending login code email:', error);
  }
};

module.exports = { sendLoginCode };
