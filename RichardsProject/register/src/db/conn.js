const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/registration', {
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(() => {
    console.log(`connection successfull`);
}).catch((e) => {
    console.log(`no connection ${e}`);
})

module.exports= mongoose