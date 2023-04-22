const express = require('express');
const app = express();
const path = require("path");
const users = require("./mongodb").users;
const products = require("./mongodb").products;
const carts = require("./mongodb").carts;

let user = null;
let cartEmpty = true;

var prod1,prod2,prod3,prod4, allProds;

const getProds = async (req,res)=>{
    try {
        prod1 = await products.findOne({_id : 1});
        prod2 = await products.findOne({_id : 2});
        prod3 = await products.findOne({_id : 3});
        prod4 = await products.findOne({_id : 4});
        allProds = {
            prod1 : {
                prodName : prod1.name,
                prodDesc : prod1.description,
                prodPrice : prod1.price
            },
            prod2 : {
                prodName : prod2.name,
                prodDesc : prod2.description,
                prodPrice : prod2.price
            },
            prod3 : {
                prodName : prod3.name,
                prodDesc : prod3.description,
                prodPrice : prod3.price
            },
            prod4 : {
                prodName : prod4.name,
                prodDesc : prod4.description,
                prodPrice : prod4.price
            }
        }
    }
    catch {
        return; 
    }
}

const templatePath = path.join(__dirname,'/templates')

app.use(express.json());
app.set("view engine","hbs");
app.set("views",templatePath);
app.use(express.urlencoded({extended:false}))
app.use(express.static(__dirname + '/public'));

app.get('/', async (req,res)=>{
    getProds();
    res.render("home", allProds);   
})

app.post('/', async (req,res) => {
    let id = req.body.id;
    if(user){
        const check = await carts.findOne({name : user});
        if(check){
            if(!(id in check.items)){
                console.log('not in')
                let flag = await carts.updateOne(
                    {name : user}, 
                    {$push : {items : id}},
                    function (error, success) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log(success);
                        }
                    }
                );
            }
        }
        else {
            const newData = {
                name : user,
                items : [id]
            };
            let flag = await carts.insertMany([newData]);
        }
        res.redirect('/cart');
    }
    else{
        res.redirect('/login');
    }
})

app.get('/cart', async (req,res)=>{
    if(user){
        try {
            let cartItems = [];
            const ItemsArray = await carts.findOne({name: user});
            for(var i = 0; i < ItemsArray.items.length ; i++){
                let item = await products.findOne({_id : ItemsArray.items[i]});

                cartItems.push({
                    prodId : item._id,
                    prodName : item.name,
                    prodDesc : item.description,
                    prodPrice : item.price
                });
            };
            console.log(cartItems);
            res.render("cart",{items : cartItems, isnotMessage : true}); 
        }
        catch {
            res.render("cart",{message : "Your Cart is empty!", isnotMessage : false})
        }
    }
    else {
        res.redirect('/login');
    }
})

app.get('/order',async (req,res)=>{
    let cartItems = [];
    const ItemsArray = await carts.findOne({name: user});
    for(var i = 0; i < ItemsArray.items.length ; i++){
        let item = await products.findOne({_id : ItemsArray.items[i]});

        cartItems.push({
            prodId : item._id,
            prodName : item.name,
            prodDesc : item.description,
            prodPrice : item.price
        });
    };
    try{
        const check = await carts.deleteOne({name:user});
        if(check) {
            res.render("order",{items : cartItems, isnotMessage : true}); 
        }
        else {
            res.render("order",{message : "Failed to place order :(", isnotMessage : false})
        }
    }
    catch {
        res.send({message : "Failed to place order :(", isnotMessage : false})
    }
    console.log(cartItems);
    
})

app.get('/login',(req,res)=>{
    if(!user){
        res.render("login.hbs");
    }
    else {
        res.render('logout',{username: user});
    }
})

app.post("/login",async (req,res) => {
    if(!user){
        try {
            const check = await users.findOne({name : req.body.name});
            if (check.password == req.body.password) {
                user = check.name;
                if(!cartEmpty){
                    res.render("home", allProds);
                }
                else {
                    res.redirect('/cart');
                }
            } else {
                res.render("login",{message :'Incorrect password.'});
            }
        } catch {
            res.render("login",{message :'Incorrect Details.'});
        } 
    } else {
        res.render('logout',{username: user});
    }
})

app.post('/logout',(req,res)=>{
    user = null;
    res.render("home", allProds);
})

app.get('/signup',(req,res)=>{
    res.render("signup.hbs");
})

app.post("/signup",async (req,res) => {
    const data = {
        name:req.body.name,
        password:req.body.password,
    }
    await users.insertMany([data]);
    res.render("home");
})

app.listen(8000, ()=>{
    console.log("Application running on port 8000");
})
