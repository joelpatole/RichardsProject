var ProductPlain = require('../models/productPlain');
var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/registration');

var products = [
    new ProductPlain({
        imagePath: '/css/plainWalnut.jpg',
        title: 'Walnut Cake',
        price: 150
    }),
    new ProductPlain({
        imagePath: '/css/ChocoWalnutCake2.jpeg',
        title: 'Choco Walnut Cake',
        price: 200
    }),
    new ProductPlain({
        imagePath: '/css/CherryWalnutCake.jpeg',
        title: 'Cherry Plain Cake',
        price: 290
    }),
    new ProductPlain({
        imagePath: '/css/RoseCake.jpeg',
        title: 'Rose Cake',
        price: 150
    }),
    new ProductPlain({
        imagePath: '/css/PlainCake3.jpeg',
        title: 'Vanilla Sponge Cake',
        price: 150
    })


];
var done=0;
for (var i=0;i<products.length;i++){
    products[i].save(function(err,result){
        done++;
        if(done === products.length){
            exit();
        }
    });
}
function exit(){
    mongoose.disconnect();
}