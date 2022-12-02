const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserOTPVerificationSchema = new Schema({
    userID : {
        type:String,
        required:true,
        unique:true
    },
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

const UserOTPVerification = new mongoose.model("UserOTPVerification", UserOTPVerificationSchema);

module.exports= UserOTPVerification;