const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const redis = require('redis')
const redisStore = require('connect-redis')(session)
const client = redis.createClient();
const router = express.Router()
const app = express()
let alert = require("alert")
var count=0;

//payment gateway
const qs = require("qs");
const https = require("https");
const url = require("url")
const parseUrl = express.urlencoded({ extended: true });
const parseJson = express.json({ extended: true });
const checksum_lib = require("./Paytm/checksum");
const config = require("./Paytm/config");



//email handler
const nodemailer = require('nodemailer');

//const mongoose = require("mongoose");
const mongoose = require("./src/db/conn");
//database connection
require("./src/db/conn");
//const mongoose = require("mongoose");
//database schemas links
const Register = require("./src/models/userRegister");
const Feedback = require("./src/models/userFeedback");
const UserOTPVerification = require("./src/models/UserOTPVerification");
const ProductWine = require("./src/models/productWine");
const ProductRum = require("./src/models/productRum");
const ProductPlain = require("./src/models/productPlain");
const Cart = require("./src/models/cart");
const Order = require("./src/models/order");
const UserForgotOTPVerification = require("./src/models/UserForgotOTPVerification")


//uqique string
const{v4: uuidv4} = require("uuid");
const { isBoolean, result } = require('lodash')
const { callbackPromise } = require('nodemailer/lib/shared')
const cart = require('./src/models/cart')
const { request } = require('http')
//const UserOTPVerification = require('./src/models/UserOTPVerification')

//env var
require("dotenv").config();

app.use(session({
    secret: 'harpreetjoel',
    store: new redisStore({host:'localhost', port: 6379, client: client, ttl: 500}),
    resave: false,
    saveUninitialized: false,
    maxAge: new Date(Date.now() + 3600000),
    expires: new Date(Date.now() + 3600000)
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static(__dirname + '/views'))

    
//nodemailer transpoter
let transpoter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    port: 587,
    secure: false,
    auth:{
        user:"joelpatole4@gmail.com",
        pass:"sohpkcehmqvnoztg",
    }
})

//testing suceess
transpoter.verify((error,success)=>{
    if(error){
        console.log('error in mail connection')
        console.log(error)
    }else{
        console.log("ready for message")
        console.log(success)
    }
})
// var sess;

//routes
router.get("/", (req,res) => {
    res.render("home")
});

router.get("/registration",(req, res) =>{
    res.render("registration.hbs")
});



//verify otp click should take the control to /userRegistration
router.post("/userRegister", async (req,res) =>{
    console.log("/userRegister reached.")
    try 
    {

        //db madhun UserOTPVerification collection madhun OTP retrive kar 
        //ani check kar with req.otp if == then do the registration part
        

           const email=req.body.email;
           const password = req.body.password;
           const conPass = req.body.confirmPass;
                if(password === conPass)
                {
                        const registerUser = new Register({
                        fullname: req.body.fullname,
                        mobileNum: req.body.mobileNum,
                        email: req.body.email,
                        address: req.body.address,
                        password: password,
                        confirmPass: conPass,
                        verified:false})
                        
                        const userDetails = await Register.findOne({email:email});
                        console.log('entered email is, ',email)
                       //console.log('user wala email is, ',userDetails.email)
                        if(userDetails)
                        {
                           alert('Email alredy registered, please login')
                           res.render("login.hbs")
                        }
                        else
                        {
                                  //if(opt == res.otp)
                                 const registered = await registerUser.save()
                                .then((result)=>{
                                //handle account verification 
                                console.log("trying to save reg data.", result);
                                //(result,res);
                                sendVerificationEmail(req.body.email,res,registerUser._id)
                                //res.status(201).render("login")
                        
                                 })
                                .catch((err)=>{
                                console.log(err)
                                res.json({
                                    err,
                                    status:"failed",
                                    message:"an error occured while saving"
                                })
                                })
                        }
                    
                      //res.status(201).render("login");
                      //else wrong otp
                }
                else
                {
                    alert("Passwords do not match");
                }
            //send otp to mail logic
                        


    }//try ends 
     catch (error) 
    {
    alert("You are already registered.Please login.")
        //res.status(400).send(error);
    }
     
});



const sendVerificationEmail = (email,res,_id)=>{
    //url to be used in email
    console.log("inside sendVerificationEmail()");
   
    const currentUrl = "http.//localhost:3000/";
    const uniqueString = uuidv4() + _id;
    
     //otp creation
     var num = 1000 + Math.random() * 9000
     OTP=(Math.floor(num));
     console.log(OTP)

    const mailOptions = {
        from:"joelpatole4@gmail.com",
        to:email,
        subject:"Verify your email",
        html:`<p>Verify your Email address to compelete the signup process</p><p>This OTP <b>expires in 1 hour.</b></p>
              <p> <b>OTP: ${OTP}</b></p>`,
        //html:`<p>Verify your Email address to compelete the signup process</p><p>This link <b>expires in 1 hour.</b></p>
        //      <p> <a href=${currentUrl+"user/verify/"+_id+"/"+uniqueString}>Press</a> to proceed.</p>`,
    }

    const UOV = new UserOTPVerification({
        userID:_id,
        //uniqueString:
        email:email,
        otp:OTP,
        createdAt:Date.now(),
        expiresAt:Date.now() + 600000,

    })
    console.log("sendVerificationEmail Entered ", _id , " ",email);
    UOV
    .save()
    .then(()=>{
        transpoter.sendMail(mailOptions)
        .then(()=>{
            console.log("Email Sent.");
            res.status(201).render("OTP",{email:email});
            
            console.log("sucess in data entry")
                        
            /*res.json({
                status:"Pending",
                message:"otp sent"
            })*/
            return OTP
        })
        .catch((error)=>{
            console.log(error)
                var myquery={email:email}
                Register.deleteOne(myquery,(err,obj)=>{
                if(err) throw err
                 console.log("user-Data deleted")
                })
            res.json({
                status:"failed",
                message:"error in sending otp"
            })
            //return false
        })
        
    })
    .catch((error)=>{
        var myquery={email:email}
        Register.deleteOne(myquery,(err,obj)=>{
        if(err) throw err
            console.log("user-Data deleted")
        })
        console.log(error)
        //return false
    })
}

router.get("/login",(req,res) =>{
    res.render("login")
});

router.get("/otp",(req,res) =>{
    res.render("OTP",{email:req.body.email})
});

router.post("/userLogin",async(req,res)=>{
    try{
        const email = req.body.email
        const password = req.body.password

        const userDetails = await Register.findOne({email:email});
        
        if(userDetails.password === password)
        {
            sess = req.session
            sess.name = userDetails.fullname
            sess.email = userDetails.email
            //console.log(sess)
            res.status(201).render("newHome",{name:sess.name})
        }
        else{
            alert("Password is not matching")
        }
    }
    catch(error)
    {
        alert("Inavalid email")
    }
})

router.post("/newHome",(req,res)=>{
    res.render("newHome")
})

router.get("/logout",(req,res)=>{
    req.session.destroy((err)=>{
        if(err){
            console.log(err)
        }
        res.redirect("/home")
    })
})

router.get("/aboutUs",(req,res)=>{
    if(req.session.email){
        res.render("aboutUs",{name:req.session.name})
    }
    else{
        res.render("aboutUs")
    }
});

router.get("/home",(req,res) =>{
    if(count==0)
    {
        if(req.session.email){
            res.render("newHome",{name:req.session.name})
        }
        else{
            res.render("home")
        }
    }
    else
    {
        if(req.session.email){
            req.session.cart={};
            res.render("newHome",{name:req.session.name})
        }
        else{
            res.render("home")
        }
    }
});

router.get("/about",(req,res) =>{
    res.render("aboutUs")
});


router.get("/contact",(req,res)=>{
    if(req.session.email)
    {
        res.render("contact",{name:req.session.name})
    }
    else{
        res.render("contact")
    }
    
})


//feedback/queries added in database
router.post("/processFeedback",async(req,res)=>{
    try 
    {
    //     const fEmail= req.body.email
    //     const fName = req.body.name
    //    const subject = req.body.subject
    //    const message = req.body.message
    //    console.log(subject)
    //    console.log(message)
            const registerFeedback = new Feedback({
            fName:req.body.name,
            fEmail:req.body.email,
            subject: req.body.subject,
            message: req.body.message
         })

         const feedbackSaved = await registerFeedback.save();
         if(req.session.email)
         {
            res.status(201).render("newHome", {name:req.session.name})
         }
         else
         {
            res.status(201).redirect("/home")
         }
         
         alert("thank your for your feedback")
        
    } 
    catch (error) 
    {
        alert("Your feedback not  sent");
        console.log(error)
    }
});

//main menu
router.get("/menu",(req,res) =>{
    if(req.session.email)
    {
        res.render("menu",{name:req.session.name})
    }
    else{
        res.render("menu")
    }
    
});


//cake menus
router.get("/wineCake",(req,res) =>{
    ProductWine.find(function(err,docs){
        var productChunks = [];
        var chunkSize = 2;
        for(var i=0;i<docs.length;i+=chunkSize){
            productChunks.push(docs.slice(i,i+chunkSize));
        }
        if(req.session.email)
        {
            res.render("wineCake",{name:req.session.name,products:productChunks})
        }
        else{
            res.render("wineCake",{products:productChunks})
        }
    });
    // if(req.session.email)
    // {
    //     res.render("wineCake",{name:req.session.name,products:products})
    // }
    // else{
    //     res.render("wineCake",{products:products})
    // }
    
});
router.get("/rumCake",(req,res) =>{
    ProductRum.find(function(err,docs){
        var productChunks = [];
        var chunkSize = 2;
        for(var i=0;i<docs.length;i+=chunkSize){
            productChunks.push(docs.slice(i,i+chunkSize));
        }
        if(req.session.email)
        {
            res.render("rumCake",{name:req.session.name,products:productChunks})
        }
        else{
            res.render("rumCake",{products:productChunks})
        }
    });
    
});
router.get("/plainCake",(req,res) =>{
        ProductPlain.find(function(err,docs){
        var productChunks = [];
        var chunkSize = 2;
        for(var i=0;i<docs.length;i+=chunkSize){
            productChunks.push(docs.slice(i,i+chunkSize));
        }
        if(req.session.email)
        {
            res.render("plainCake",{name:req.session.name,products:productChunks})
        }
        else{
            res.render("plainCake",{products:productChunks})
        }
    });

});

//otp verification
router.post("/verifyOtp" ,async(req,res)=>{
    const otp = req.body.otp
    const email = req.body.email
    console.log(email)
    console.log(otp)
    const userOtpDetails = await UserOTPVerification.findOne({otp:otp});
    console.log(userOtpDetails)
    if(userOtpDetails)
    {
        if(userOtpDetails.expiresAt-userOtpDetails.createdAt > 600000)
        {
           alert('timeOut')
           var myquery={otp:otp}
            UserOTPVerification.deleteOne(myquery,(err,obj)=>{
                 if(err) throw err
                 console.log("otp-Data deleted")
            })
           var myquery={email:email}
            Register.deleteOne(myquery,(err,obj)=>{
                 if(err) throw err
                 console.log("user-Data deleted")
            })
        }
        else
        {
            console.log(userOtpDetails)
            alert("OTP Verified.")
            res.render("login.hbs")
            var myquery={otp:otp}
            UserOTPVerification.deleteOne(myquery,(err,obj)=>{
                 if(err) throw err
                 console.log("otp-Data deleted")
            })

        }
        
    }
    else{
        alert('wrong otp')
        console.log("wrong otp")

        var myqueryotp= {email:email}
        console.log(myqueryotp)
            UserOTPVerification.deleteOne(myqueryotp,(err,obj)=>{
                 if(err) throw err
                 console.log("otp-Data deleted")
            })
        var myqueryuser={email:email}
            Register.deleteOne(myqueryuser,(err,obj)=>{
                 if(err) throw err
                 console.log("user-Data deleted")
            })
        res.render("registration")
        
    }
    
});


//cart links
router.get("/cart",(req,res) =>{
    if(req.session.email)
    {
        if(!req.session.cart){
            return res.render('cart',{products: null})
        }
        var cart = new Cart(req.session.cart);
        res.render("cart",{name:req.session.name,products: cart.generateArray(),totalPrice: cart.totalPrice})
    }
    else{
        alert("You're not logged in. Please login/register to continue")
        res.render("menu")
    }
    
});

router.get('/add-cart-wine/:id',(req,res,next)=>{
    if(req.session.email)
    {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    ProductWine.findById(productId,(err,product)=>{
        if(err){
            return res.redirect('/home');
        }
        cart.add(product,product.id);
        req.session.cart =cart;
        req.session.totalPrice=cart.totalPrice;
        console.log(req.session.cart);
        alert("Item added.")
        res.redirect('/wineCake');
    });

    }
    else{
        alert("Please Login to order your favorite cake.")
    }
});

router.get('/add-cart-rum/:id',(req,res,next)=>{
    if(req.session.email)
    {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    ProductRum.findById(productId,(err,product)=>{
        if(err){
            return res.redirect('/home');
        }
        cart.add(product,product.id);
        req.session.cart =cart;
        req.session.totalPrice=cart.totalPrice;
        console.log(req.session.cart);
        alert("Item added.")
        res.redirect('/rumCake');
    });

    }
    else{
        alert("Please Login to order your favorite cake.")
    }
});

router.get('/add-cart-plain/:id',(req,res,next)=>{
    if(req.session.email)
    {
    var productId = req.params.id;
    var cart = new Cart(req.session.cart ? req.session.cart : {});
    ProductPlain.findById(productId,(err,product)=>{
        if(err){
            return res.redirect('/home');
        }
        cart.add(product,product.id);
        req.session.cart =cart;
        req.session.totalPrice=cart.totalPrice;
        console.log(req.session.cart);
        alert("Item added.")
        res.redirect('/plainCake');
    });

    }
    else{
        alert("Please Login to order your favorite cake.")
    }
});

//increment, decrement and delete on cart
router.get('/incre/:id',(req,res)=>{
    if(req.session.email)
    {
        var productId = req.params.id;
        var cart=new Cart(req.session.cart);
        cart.incre(productId);
        req.session.cart=cart;
        //console.log(cart)
        res.render("cart",{name:req.session.name,products: cart.generateArray(),totalPrice: cart.totalPrice})
    }
    else{
        alert("Error!!")
    }
});
router.get("/decre/:id",(req,res)=>{
    if(req.session.email)
    {
        var productId = req.params.id;
        var cart=new Cart(req.session.cart);
        cart.decre(productId);
        req.session.cart=cart;
        //console.log(cart);
        res.render("cart",{name:req.session.name,products: cart.generateArray(),totalPrice: cart.totalPrice})
    }
    else{
        alert("Error!!")
    }
});
router.get("/delete/:id",(req,res)=>{
    if(req.session.email)
    {
        var productId = req.params.id;
        var cart=new Cart(req.session.cart);
        cart.delete(productId);
        req.session.cart=cart;
        //console.log(cart);
        res.render("cart",{name:req.session.name,products: cart.generateArray(),totalPrice: cart.totalPrice})
    }
    else{
        alert("Error!!")
    }
});

//payment links
router.get("/checkout",(req,res)=>{
      
        var cart = new Cart(req.session.cart);
        products=cart.generateArray()
        res.render("checkout",{name:req.session.name,totalPrice: cart.totalPrice});
        
});

//paytm connection function after user clicks pay in checkout
router.post("/paynow", [parseUrl, parseJson], (req, res) => {
    // Route for making payment
   
    var paymentDetails = {
      amount: req.body.amount,
      customerId: req.body.name,
      customerEmail: req.session.email,
      customerPhone: req.body.phone
  }
  req.session.address=req.body.address
  console.log(paymentDetails.amount,paymentDetails.customerId,paymentDetails.customerEmail);
  if(!paymentDetails.amount || !paymentDetails.customerId || !paymentDetails.customerEmail || !paymentDetails.customerPhone) {
      res.status(400).send('Payment failed')
  } else {
      var params = {};
      params['MID'] = config.PaytmConfig.mid;
      params['WEBSITE'] = config.PaytmConfig.website;
      params['CHANNEL_ID'] = 'WEB';
      params['INDUSTRY_TYPE_ID'] = 'Retail';
      params['ORDER_ID'] = 'TEST_'  + new Date().getTime();
      params['CUST_ID'] = paymentDetails.customerId;
      params['TXN_AMOUNT'] = paymentDetails.amount;
      params['CALLBACK_URL'] = 'http://localhost:3000/callback';
      params['EMAIL'] = paymentDetails.customerEmail;
      params['MOBILE_NO'] = paymentDetails.customerPhone;
   
   
      checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
          var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
          // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production
   
          var form_fields = "";
          for (var x in params) {
              form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
          }
          form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";
   
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
          res.end();
      });
  }
  });

  //after payment successfull call callback and save order in database
router.post("/callback",(req,res)=>{
  res.redirect("/confirmation")    
});

router.get("/confirmation",(req,res)=>{
    count=1;
    if(req.session.name){
        //res.send('payment sucess')
        var name= req.session.name
        var email= req.session.email

        console.log(name,email)
        console.log(req.session.cart)
        var cart = new Cart(req.session.cart);
        var total=cart.totalPrice
        console.log(name,email,total)
        var order = new Order({
            name: req.session.name,
            cart: cart,
            address: req.session.address,
            email: req.session.email
        });
        order.save(function(err,result){
            console.log("Entered order in database.")
        });

        const mailOptions = {
            from:"joelpatole4@gmail.com",
            to:email,
            subject:"Richards Wine And Rum Cake- Order Details",
            html:`<h1 style="font-size:23px;color:maroon;"  >ORDER CONFIRMATION</h1><br><p>Hello ${name},<br> Your cake order for <b>${cart.totalQty}</b> cake for <b>Rs.${total}</b> was placed successfully. Order will be delivered within 4-5 business days.<br> 
            Thankyou for choosing us. Hope to see you again with another order placement.</p>`,
        
        }
        transpoter.sendMail(mailOptions)
        .then(()=>{
            console.log("Email Sent.");
            res.status(201).render("callback",{name:name});
            
        });

        alert("Payment successfull.. Order confirmation sent on your email id")

    }
    else{
        alert("Some error occured while payment. Please try again.")
        res.render("home");
    }
  });//confirmation End

    //render bill page 
    router.get("/bill", (req, res) => {
        if(req.session.email)
        {
            if(!req.session.cart){
                alert("Unable to download file")
            }
            var cart = new Cart(req.session.cart);
            res.render("bill",{name:req.session.name,email:req.session.email,address: req.session.address,products: cart.generateArray(),totalPrice: cart.totalPrice})
        }
        else{
            alert("You're not logged in. Please login/register to continue")
            res.render("menu")
        }

    });


    //forgotOTP functionality
    const sendVerificationEmailForgotPassword= (email,res)=>{
        console.log("inside sendVerificationEmailForgotPassword()");
        var num = 1000 + Math.random()*9000;
        OTP=(Math.floor(num));
        console.log(OTP)
    
        const mailOptions = {
            from:"joelpatole4@gmail.com",
            to:email,
            subject:"MAIL TO CHANGE YOUR PASSWORD",
            html:`<h1 style="color:maroon;" >Mail To Change Your Password</h1><p style="color:brown;"> Verify your Email address to change Password</p><p>This OTP <b>expires in 1 hour.</b></p>
                  <p style=font-size:30px; style= "color:red;"> <b>OTP: ${OTP}</b></p>`,
        }
    
        const UFOV = new UserForgotOTPVerification({
            email:email,
            otp:OTP,
            createdAt:Date.now(),
            expiresAt:Date.now() + 600000
    
        })
    
        UFOV.save()
        .then(()=>{
            transpoter.sendMail(mailOptions)
            .then(()=>{
                console.log("Email Sent.");
                res.status(201).render("ForgotOTP",{email:email});
                
                console.log("sucess in data entry")
                            
                /*res.json({
                    status:"Pending",
                    message:"otp sent"
                })*/
                return OTP
            })
            .catch((error)=>{
                console.log(error)
                    var myquery={email:email}
                    Register.deleteOne(myquery,(err,obj)=>{
                    if(err) throw err
                     console.log("user-Data deleted")
                    })
                res.json({
                    status:"failed",
                    message:"error in sending otp"
                })
                //return false
            })
            
        })
        .catch((error)=>{
            var myquery={email:email}
            Register.deleteOne(myquery,(err,obj)=>{
            if(err) throw err
                console.log("user-Data deleted")
            })
            console.log(error)
            //return false
        })
    
    }

    //forgot password updation done checking for OTP verification
    router.post("/verifyForgottenOtp" ,async(req,res)=>{
        console.log("inside /verifyForgottenOtp route")
        const otp = req.body.otp
        const email = req.body.email
        console.log(email)
        console.log(otp)
        const userOtpDetails = await UserForgotOTPVerification.findOne({otp:otp});
        console.log(userOtpDetails)
        if(userOtpDetails)
        {
            if(userOtpDetails.expiresAt-userOtpDetails.createdAt > 600000)
            {
               alert('timeOut')
               var myquery={otp:otp}
               UserForgotOTPVerification.deleteOne(myquery,(err,obj)=>{
                     if(err) throw err
                     console.log("otp-Data deleted inside verifyForgottenOtp")
                })
               var myquery={email:email}
                Register.deleteOne(myquery,(err,obj)=>{
                     if(err) throw err
                     console.log("user-Data deleted inside verifyForgottenOtp")
                })
            }
            else
            {
                console.log(userOtpDetails)
                alert("OTP Verified.")
                res.render("login.hbs")
                var myquery={otp:otp}
                UserForgotOTPVerification.deleteOne(myquery,(err,obj)=>{
                     if(err) throw err
                     console.log("otp-Data deleted inside verifyForgottenOtp")
                })
    
            }
            
        }
        else{
            alert('wrong otp')
            console.log("wrong otp inside verifyForgottenOtp ")
    
            alert("Enter OTP again")
            res.status(201).render("ForgotOTP",{email:email});
            
        }
        
    });


    //forgot password route
    router.get("/forgotPassword",(req,res) =>{
        res.render("forgotPassword")
    });
    

    router.post("/forgotPasswordOTP",async (req,res)=>{
        app.use(bodyParser.urlencoded({ extended: true }));
        const email=req.body.email;
        const password = req.body.NewPassword;
        const conPass = req.body.NewRePassword;
        console.log(password)
        console.log(conPass)
    
        //store the user details in this variable
        const userDetails = await Register.findOne({email:email});
        if(!userDetails)
        {
            alert("INCORRECT EMAIL ID")
        }
        else
        {
            console.log("got user details in /forgotPasswordOTP")
            console.log(userDetails.fullname)
            console.log(userDetails.mobileNum)
            console.log(userDetails.email)
            console.log(userDetails.address)
            console.log("->",password)
            console.log("->",conPass)
        
            //delete the user
            var myquery={email:email}
                Register.deleteOne(myquery,(err,obj)=>{
                if(err) throw err
                    console.log("user-Data deleted")
                })
                //console.log(error)
            
            //with the help of stored variable again save the user as new user
            if(password === conPass)
            {
                console.log("inside pass==conpass")
                const registerUser = await new Register({
                fullname: userDetails.fullname,
                mobileNum: userDetails.mobileNum,
                email: userDetails.email,
                address: userDetails.address,
                password: req.body.NewPassword,
                confirmPass: req.body.NewRePassword,
                verified:false})
        
                const registered = registerUser.save()
                                .then((result)=>{
                                //handle account verification 
                                console.log("trying to save reg data.", result);
                                //(result,res);
                                sendVerificationEmailForgotPassword(email,res)
                                //res.status(201).render("login")
                        
                                })
                                .catch((err)=>{
                                console.log(err)
                                    res.json({
                                        err,
                                        status:"failed",
                                        message:"an error occured while saving"
                                    })
                                })
            }
            else{
                alert("password do not match")
                console.log("inside pass==conpass of else so that data is resaved again")
                const registerUser = await new Register({
                fullname: userDetails.fullname,
                mobileNum: userDetails.mobileNum,
                email: userDetails.email,
                address: userDetails.address,
                password: req.body.NewPassword,
                confirmPass: req.body.NewRePassword,
                verified:false})
        
                const registered = registerUser.save()
                                .then((result)=>{
                                //handle account verification 
                                console.log("trying to save reg data in else.", result);
                                //(result,res);
                                //sendVerificationEmailForgotPassword(email,res)
                                //res.status(201).render("login")
                        
                                })
                                .catch((err)=>{
                                console.log(err)
                                    res.json({
                                        err,
                                        status:"failed",
                                        message:"an error occured while saving in else block of /forgotPasswordOTP"
                                    })
                                })
            }
        }
    
        
                 
        
    });

module.exports = router