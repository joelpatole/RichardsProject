const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserForgotOTPVerificationSchema = new Schema({
    email : {
        type:String,
        required:true,
        unique:true
    },
    otp : {
        type:String,
        required:true,
        unique:true
    },
    createdAt : {
        type:Date,
        required:true,
        unique:true
    },
    expiresAt : {
        type:Date,
        required:true,
        unique:true
    }
});

const UserForgotOTPVerification = new mongoose.model("UserForgotOTPVerification", UserForgotOTPVerificationSchema);

module.exports= UserForgotOTPVerification;