const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const Schema = mongoose.Schema

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    pin: {
        type: String,
        required: true
    },
    verificationToken: {
        type: String,
    },
    tokenExpirationDate: {
        type: Date,
    },
    isVerified: {
        email: {
            type: Boolean,
            default: false,
        },
        phone: {
            type: Boolean,
            default: false,
        },
        passwordToken: {
            type: Boolean,
            default: false,
        },
    },
    verified: {
        type: Date,
    },
    passwordToken: {
        type: String,
    },
    passwordTokenExpirationDate: {
        type: Date,
    },
    securityQuestion1: {
        type: String,
    },
    securityAnswer1: {
        type: String,
    },
    securityQuestion2: {
        type: String,
    },  
    securityAnswer2: {
        type: String,
    },

})

userSchema.pre(
    'save',
    async function (next) {
        const user = this;
        const hashpassword = await bcrypt.hash(user.password, 10);
        const hashpin = await bcrypt.hash(user.pin, 10);

        user.password = hashpassword;
        user.pin = hashpin;
        next();
    }
);

userSchema.methods.isValidPassword = async function(password) {
    const user = this;
    const compare = await bcrypt.compare(password, user.password);
  
    return compare;
  }

  userSchema.methods.isValidPin = async function(pin) {
    const user = this;
    const compare = await bcrypt.compare(pin, user.pin);
  
    return compare;
  }

const userModel = mongoose.model('users', userSchema)
module.exports = userModel