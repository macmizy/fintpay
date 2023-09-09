const client = require('./config');
require('dotenv').config();

const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const sendOTP = (otp, phone) => {
    
    client.messages
        .create({
        body: `Your OTP Payflex is: ${otp}`,
        from: twilioPhoneNumber,
        to: phone,
        })
        .then((message) => {
        console.log(`OTP sent to ${phone}: ${message.sid}`);
        })
        .catch((error) => {
        console.error('Error sending OTP:', error);
        });
}

module.exports = sendOTP;