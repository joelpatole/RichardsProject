const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    fName: { 
        type:String,
        required:true
    },
    fEmail:{
        type:String,
        required:true
    },
    subject : {
        type:String,
        required:true
    },
    message : {
        type:String,
        required:true
    }
    
    
})

//creating a collection

const Feedback = new mongoose.model("Feedback", userSchema);

module.exports= Feedback;