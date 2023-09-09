const transporter = require('./config');


const sendVerificationEmail = (username, email, verificationToken ) => {
  const mailOptions = {
    from: process.env.GMAIL, // Sender email address
    to: email, // Recipient email address
    subject: 'Verification Code',
    text: `Hello ${username},Your verification code is: ${verificationToken}`,
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
    console.log(`Email sent: ${info}`);
  });
   

};

module.exports = sendVerificationEmail ;
