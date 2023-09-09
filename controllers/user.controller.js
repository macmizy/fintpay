
const passport = require('passport');
const UserModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const utils = require('../utils/index');
const userModel = require('../models/user.model');
const req = require('express/lib/request');
require('dotenv').config();

function userSignup(req, res, next) {
    passport.authenticate('signup', { session: false }, async (err, user, info) => {
        try{
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(400).json({
                    status: 'false',
                    message: 'Signup failed',
                });
            }

            const verificationToken = generateToken();
            const hashedtoken = await utils.hash(verificationToken);
            const tokenExpirationDate = new Date(Date.now() + 5 * 60 * 1000);
    
            const users = await UserModel.findOneAndUpdate({email: user.email},{verificationToken: hashedtoken, tokenExpirationDate: tokenExpirationDate, },{new: true });
            const username = users.username
            const email = user.email
            utils.sendVerificationEmail(username,email,verificationToken)
            res.status(200).json({
                message: 'Signup successful',
                status: 'true',
            }); 
        }catch(error){
            return res.status(400).json({
                status: "false",
                message: "Signup failed"
            })
        }
    })(req, res, next);
};


function userLogin(req,res,next){
    passport.authenticate('login', async (err, user, info) => {
        try {
            if (err) {
                return next(err);
            }
            if (!user) {
                const error = new Error('Username or password is incorrect');
                res.status(400).json({
                    status: 'false',
                    message: 'username or password is incorrect',
                });
                return next(error);
            }
            if(user.isVerified.email === false){
                const error = new Error('Email is not verified');
                res.status(400).json({
                    status: 'false',
                    message: 'Email is not verified',
                });
                return next(error);
            }
            req.login(user, { session: false },
                async (error) => {
                    if (error) return next(error);

                    const body = { _id: user._id, email: user.email };
                    
                    const token = jwt.sign({ user: body }, process.env.SECRET_KEY, { expiresIn: "1h"});

                    return res.status(200).json({
                        status: 'true',
                        token:token 
                        });
                }
            );
            
        } catch (error) {
            res.status(400).json({
                status: 'false',
                message: 'Login failed',
            });
            return next(error);
        }
    }
    )(req, res, next);
};


const verifyEmail = async (req, res) => {
    try{
        const { email, token } = req.body;
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ msg: "Email not found", status: "false" });
        }
        if (!token) {
            return res.status(400).json({ msg: "Token is required", status: "false" });
        }
        const verify = await utils.unhash(token,user.verificationToken);
        if (
            verify === true &&
            user.tokenExpirationDate > currentDay
        ) {
            user.isVerified.email = true;
            user.verificationToken = null;
            user.tokenExpirationDate = null;
            await user.save();
            res.status(200).json({ 
                msg: "Email is verified",
                status: "true"
            });
        } else {
            res.status(400).json({ 
                msg: "Code is invalid or expired.",
                status: "false"
            });
        }
    }catch(error){
        console.log(error)
        res.status(400).json({ 
            msg: "Email verification failed",
            status: "false"
        });
    }
};

const resendEmailToken = async (req, res) => {
    try{
        const {email} = req.body;
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ msg: "Email not found", status: "false" });
        }   
        if(user.isVerified.email === true){
            return res.status(400).json({ msg: "Email is already verified", status: "false" });
        }
        const verificationToken = generateToken();
        const hashedtoken = await utils.hash(verificationToken);
        const tokenExpirationDate = new Date(Date.now() + 5 * 60 * 1000);
        const username = user.username
        utils.sendVerificationEmail(username,email,verificationToken);
    
        user.verificationToken = hashedtoken;
        user.tokenExpirationDate = tokenExpirationDate;
        await user.save();
    
        res.status(200).json({ msg: "Code successfully sent again.", status: "true" });
    }catch(error){
        res.status(400).json({ msg: "Failed to send code.", status: "false" });
    }
};

const forgotPassword = async (req, res) => {
    try{
        const { email } = req.body;
        if (!email) {
           return res.status(400).json({ msg: "Email is required" });
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "user not found" });
        }
    
        const passwordToken = generateToken();
        const hashedtoken = await utils.hash(passwordToken);
        const passwordTokenExpirationDate = new Date(Date.now() + 5 * 60 * 1000);
        const baseURL = req.protocol + '://' + req.get('host');
        const passwordResetURL = `${baseURL}/reset-password/${passwordToken}`;
        const username = user.username
        utils.sendResetPasswordEmail(username,email,passwordToken,passwordResetURL);
    
        user.passwordToken = hashedtoken;
        user.passwordTokenExpirationDate = passwordTokenExpirationDate;
        user.isVerified.passwordToken = false;
        await user.save();
    
        res.status(200).json({ 
            msg: "Please check your email to reset password",
            status: "true",
            passwordToken: passwordToken 
        });
    }catch(error){
        res.status(400).json({ 
            msg: "Failed to send code.",
            status: "false"
        });
    }
};


const verifyPasswordToken = async (req, res) => {
    try{
        const {email, token} = req.body;
        currentDay = new Date(Date.now());
        const user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ msg: "Email not found", status: "false" });
        }
        if (!token) {
            return res.status(400).json({ msg: "Token is required", status: "false" });
        }
        const verify = await utils.unhash(token,user.passwordToken);
        if(
            verify === true &&
            user.passwordTokenExpirationDate > currentDay
        ){
            user.passwordToken = null;
            user.passwordTokenExpirationDate = null;
            user.isVerified.passwordToken = true;
            await user.save();
    
            res.status(200).json({ 
                msg: "Code is correct",
                status: "true"
            });
        }else{
            res.status(400).json({
                msg: "Code is invalid or expired.",
                status: "false"
            });
        }
    }catch(error){
        res.status(400).json({
            msg: "Failed to verify code.",
            status: "false"
        });
    }
};

const resetPassword = async (req, res) => {
    try{
        const { email, password } = req.body;
        const user = await userModel.findOne({ email: email });
        if (!user) {  
            return res.status(400).json({ msg: "Email not found", status: "false" });
        }
        if (!password) {
            return res.status(400).json({ msg: "Password is required", status: "false" });
        }
        
        if (user.isVerified.passwordToken == false || user.passwordToken != null) {
            return res.status(400).json({ msg: "Code is not verified", status: "false" });
        }
        user.password = password;
        user.isVerified.passwordToken = false;
        await user.save();
        res.status(200).json({
            msg: "Password reset is successful",
            status: "true"
        });
    }catch(error){
        res.status(400).json({
            msg: "Failed to reset password.",
            status: "false"
        });
    }
};

const verifyPasswordTokenAndResetPassword = async (req, res) => {
    try{
        const token = req.params.token;
        const { password, email } = req.body;
        let currentDay = new Date(Date.now());
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: "Email not found" });
        }
        if (!password) {
            return res.status(400).json({ msg: "Password is required" });
        }
        if (!token) {
            return res.status(400).json({ msg: "Link is incorrect", status: "false"});
        }
    
        const verify = await utils.unhash(token,user.passwordToken);
    
        if (
            verify === true  &&
            user.passwordTokenExpirationDate > currentDay
        ) {
            user.isVerified.passwordToken = true;
            user.password = password;
            user.passwordToken = null;
            user.passwordTokenExpirationDate = null;
            await user.save();
    
            res.status(200).json({
                msg: "Password reset is successful",
                status: "true"
            });
        } else {
            res.status(400).json({
                msg: "Code is invalid or expired.",
                status: "false"
            });
        }
    }catch(error){
        res.status(400).json({
            msg: "Failed to reset password.",
            status: "false"
        });
    }

};

const sendOTP = async (req, res) => {

    try{
        const { email } = req.body;
        const user = await userModel.findOne({ email: email });
        if(!user){
            return res.status(400).json({ msg: "Email not found", status: "false"});
        }
        const phone = user.phone;
    
    
       
        const passwordToken = generateToken();
        const hashedtoken = await utils.hash(otp);
        const passwordTokenExpirationDate = new Date(Date.now() + 5 * 60 * 1000);
    
        utils.sendOTP(passwordToken, phone);
    
        user.passwordToken = hashedtoken;
        user.passwordTokenExpirationDate = passwordTokenExpirationDate;
        user.isVerified.passwordToken = false;
        await user.save();
    
        res.status(200).json({ 
            status: "true",
            msg: "OTP is sent"
        });
    }catch(error){
        res.status(400).json({ 
            status: "false",
            msg: "Failed to send OTP"
        });
    }
};

const verifyOTP = async (req, res) => {
    try{
        const { email, token } = req.body;
        const user = userModel.findOne({ email: email });
        let currentDay = new Date(Date.now());
        if (!user) {
            return res.status(400).json({ 
                msg: "Email not found",
                status: "false"
            });
        }
        if (!token) {
            return res.status(400).json({ 
                msg: "OTP is required",
                status: "false"
             });
        }
    
        const verify = await utils.unhash(token,user.passwordToken);
        if (
            verify === true &&
            user.passwordTokenExpirationDate > currentDay
        ) {
            user.passwordToken = null;
            user.passwordTokenExpirationDate = null;
            user.isVerified.passwordToken = true;
            await user.save();
    
            res.status(200).json({ 
                msg: "Code is correct",
                status: "true"
            });
        } else {
            res.status(400).json({ 
                msg: "Code is invalid or expired.",
                status: "false"
            });
        }
    }catch(error){
        res.status(400).json({ 
            msg: "Failed to verify code.",
            status: "false"
        });
    }
};

const securityQuestion = async (req, res) => {
    try{
        const { email,securityQuestion1,securityQuestion2,securityAnswer1,securityAnswer2 } = req.body;
        const user = userModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ msg: "Email not found" });
        }
        if (!securityQuestion1 || !securityQuestion2 || !securityAnswer1 || !securityAnswer2) {
            return res.status(400).json({ msg: "Security Question or Answer is required" });
    
        }
        user.securityQuestion1 = securityQuestion1;
        user.securityQuestion2 = securityQuestion2;
        user.securityAnswer1 = securityAnswer1;
        user.securityAnswer2 = securityAnswer2;
        await user.save();
        res .status(200).json({ 
            msg: "Security Question is set",
            status: "true"
        });
    }catch(error){
        res.status(400).json({ 
            msg: "Failed to set security questions.",
            status: "false"
        });
    }

}

const getsecurityQuestions = async (req, res) => {
    try{
        const { email } = req.body;
        const user = userModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ 
                msg: "Email not found", 
                status: "false" 
            });
        }
        res.status(200).json({ 
            securityQuestion1: user.securityQuestion1,
            securityQuestion2: user.securityQuestion2,
            status: "true"
        });
    }catch(error){
        res.status(400).json({ 
            msg: "Failed to get security questions.",
            status: "false"
        });
    }
}

const securityAnswers = async (req, res) => {
    try{
        const { email,securityAnswer1,securityAnswer2 } = req.body;
        const user = userModel.findOne({ email: email });
        if (!user) {
            return res.status(400).json({ msg: "Email not found", status: "false" });
        }
        if (!securityAnswer1 || !securityAnswer2) {
            return res.status(400).json({ msg: "Security Answer is required", status: "false" });
    
        }
        if (user.securityAnswer1 === securityAnswer1 && user.securityAnswer2 === securityAnswer2) {
            res.status(200).json({ 
                msg: "Security Answers are correct",
                status: "true" 
            });
        } else {
            res.status(400).json({ 
                msg: "Security Answers are incorrect",
                status: "false"
            });
        }
    }catch(error){
        res.status(400).json({ 
            msg: "Failed to verify security answers.",
            status: "false"
        });
    }
};

const logout = async (req, res) => {
    if (req.isAuthenticated()) {
        req.logout((err) => {
            if (err) {
                return res.status(400).json({ 
                    msg: "Something went wrong!",
                    status: "false"
                 });
            }
        });

    }
    res.status(200).json({ 
        msg: "You are logged out.",
        status: "true"
    });
};

const generateToken = ()=> {
    const number = Math.floor(Math.random() * 900000) + 100000;
    const string = number.toString();
    return string;

}

module.exports ={
    userLogin,
    userSignup,
    verifyEmail,
    resendEmailToken,
    forgotPassword,
    verifyPasswordToken,
    resetPassword,
    verifyPasswordTokenAndResetPassword,
    sendOTP,
    verifyOTP,
    securityQuestion,
    getsecurityQuestions,
    securityAnswers,
    logout,
}