const express = require('express');
const userModel = require('../models/user.model');
const passport = require('passport')
const validateUser = require('../models/user.validator')
require('dotenv').config();


const {
    userLogin,userSignup,
    logout,forgotPassword,
    verifyEmail,resendEmailToken,
    securityQuestion, verifyPasswordToken,
    verifyPasswordTokenAndResetPassword,
    getsecurityQuestions,securityAnswers,
    sendOTP,verifyOTP, resetPassword
} = require('../controllers/user.controller')

const userRoute = express.Router();
userRoute.post('/signup',validateUser, userSignup)
userRoute.post('/login',userLogin)
userRoute.post("/forgot-password", forgotPassword);
userRoute.post("/verify-email", verifyEmail);
userRoute.post("/resend-email", resendEmailToken);
userRoute.post("/reset-password/:token", verifyPasswordTokenAndResetPassword );
userRoute.post("/resend-password", forgotPassword);
userRoute.post("/verify-password-token", verifyPasswordToken);
userRoute.post("/reset-password", resetPassword);
userRoute.post("/send-otp", sendOTP);
userRoute.post("/verify-otp", verifyOTP);
userRoute.post("/security-question", securityQuestion);
userRoute.get("/get-security-questions", getsecurityQuestions);
userRoute.post("/security-answers", securityAnswers);
userRoute.get("/logout", logout);




userRoute.get('/allusers',passport.authenticate('jwt',{session: false}), async(req,res)=>{
    try{
        const allusers = await userModel.find()
        console.log(req.user._id)
        return res.status(200).send(allusers)
    }catch(err){
        console.log(err)
        return res.status(400).send({
            status: "false",
            message: "Users not found"
        })
    }
})

module.exports = userRoute