var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    name:{type: String ,required: true},
    cart:{type: Object,required: true},
    address:{type: String,required: true},
    email:{type: String,required: true}
});

module.exports = mongoose.model('Order',schema);