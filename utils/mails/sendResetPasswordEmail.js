const transporter = require('./config');
require('dotenv').config();


const sendResetPasswordEmail = ( username, email, passwordToken, passwordResetURL) => {
  const mailOptions = {
    from: process.env.GMAIL, // Sender email address
    to: email, // Recipient email address
    subject: 'Password token',
    text: `Hi ${username}, Your Password token code is: ${passwordToken} or click on this link to reset your password ${passwordResetURL}`,
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
    console.log(`Email sent: ${info}`);
  });
   

};

module.exports = sendResetPasswordEmail ;
