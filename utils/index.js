const sendVerificationEmail = require('./mails/sendVerificationEmail');
const sendResetPasswordEmail = require('./mails/sendResetPasswordEmail');
const sendOTP = require('./sms/sendOTP');
const {hash,unhash } = require('./hash')
module.exports = { 
    sendVerificationEmail,sendResetPasswordEmail,sendOTP,hash,unhash

};