const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    fullname : {
        type:String,
        required:true
    },
    mobileNum : {
        type:Number,
        required:true
    },
    email : {
        type:String,
        required:true,
        unique:true
    },
    address : {
        type:String,
        required:true
    },
    password : {
        type:String,
        required:true,
    },
    confirmPass : {
        type:String,
        required:true
    }
    
})

//creating a collection

const Register = new mongoose.model("User", userSchema);

module.exports= Register;