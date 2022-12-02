let alert = require("alert")
module.exports = function Cart(oldCart){
    //console.log(oldCart.items)
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    this.add = function(item,id){
        var storedItem = this.items[id];
        if(!storedItem){
            storedItem = this.items[id] = {item: item, qty: 0, price: 0};
        }
        storedItem.qty++;
        storedItem.price = storedItem.item.price * storedItem.qty;
        this.totalQty++;
        this.totalPrice += storedItem.item.price;
    }
    this.generateArray = function(){
        var arr = [];
        for(var id in this.items){
            arr.push(this.items[id]);
        }
        return arr;
    };
    this.incre = function(id){
        var storedItem = this.items[id];
        if(storedItem.qty<15) {

            storedItem.qty++;
            storedItem.price = storedItem.item.price * storedItem.qty;
            this.totalQty++;
            this.totalPrice += storedItem.item.price;
        }
        else{
            alert("Cannot select more than 15 cakes at a time.")
            return;
        }
        
    };
    this.decre = function(id){
        var storedItem = this.items[id];
        if(storedItem.qty>1){
            storedItem.qty--;
            storedItem.price = storedItem.item.price * storedItem.qty;
            this.totalQty--;
            this.totalPrice -= storedItem.item.price;
        }
        else{
            alert("Cannot select less than 1 item")
            return;
        }
        
    };
    this.delete = function(id){
        var storedItem = this.items[id];
        
        this.totalQty -= storedItem.qty;
        this.totalPrice -= storedItem.item.price * storedItem.qty;
        delete this.items[id];
        
    };
};