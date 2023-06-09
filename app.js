const express = require('express');
const app = express();
const path = require("path");
var fs = require('fs');
const hbs = require("hbs");
var multer = require('multer');
const { log } = require('console');
const users = require("./mongodb").users;
const products = require("./mongodb").products;
const carts = require("./mongodb").carts;
const orders = require("./mongodb").orders;

let user = null, userName = null;
let cartEmpty = true;

const templatePath = path.join(__dirname, '/templates')

app.use(express.json());
app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));

hbs.registerHelper("str", function(e) {
    return e.toString('base64');
});

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/products')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});
 
var upload = multer({ storage: storage });

app.get('/adminHome', async (req, res) => {
    try {
        userArr = []
        const allOrders = await orders.find({delivered : false});
        if(allOrders.length){
            for(var i = 0; i < allOrders.length; i++){
                var use = await users.findOne({_id : allOrders[i].name});
                userArr.push({
                    _id : allOrders[i]._id,
                    user_id : use._id,
                    name : use.name,
                    Add : use.address,
                    Ph : use.phone,
                    order : allOrders[i].order,
                    total : allOrders[i].total,
                    orderedDate : allOrders[i].orderedDate
                })
            }
            res.render("adminHome", {Items : userArr});
        }
        else 
        res.render("adminHome", {message: "Currently, there are no orders :("});
    }
    catch {
        res.render("adminHome", {message: "Error occured while fetching orderd details !"});
    }
})

app.get('/adminOH', async (req, res) => {
    try {
        userArr = []
        const allOrders = await orders.find({delivered : true});
        if(allOrders.length){
            for(var i = 0; i < allOrders.length; i++){
                var use = await users.findOne({_id : allOrders[i].name});
                userArr.push({
                    _id : allOrders[i]._id,
                    user_id : use._id,
                    name : use.name,
                    Add : use.address,
                    Ph : use.phone,
                    order : allOrders[i].order,
                    total : allOrders[i].total,
                    orderedDate : allOrders[i].orderedDate,
                    deliveredDate : allOrders[i].deliveredDate
                })
            }
            res.render("adminOH", {Items : userArr});
        }
        else 
        res.render("adminOH", {message: "Currently, there are no orders :("});
    }
    catch {
        res.render("adminOH", {message: "Error occured while fetching orderd details !"});
    }
})

app.post('/adminHome', async (req, res) => {
    try {
        var oID = req.body.oid;
        let d = new Date();
        var date = d.getDate() + '/' + d.getMonth() + '/' + d.getFullYear();
        await orders.updateOne({_id : oID}, {$set : {delivered : true, deliveredDate : date}});
        res.redirect("/adminHome");
    }
    catch {
        res.render("adminHome", {message: "Failed to remove order !"});
    }
})

app.get("/addProducts", (req,res) => {
    res.render("addProducts");
})

app.get("/editProducts", (req,res) => {
    res.render("editProducts");
})

app.get("/allProducts", async (req,res) => {
    try {
        const allProds = await products.find({});
        res.render("allProducts", {items : allProds});
    }
    catch {
        res.render("allProducts", {message : "Could not load the products :("});
    }
})

app.post("/allProducts", async (req,res) => {
    try {
        const id = req.body.id;
        await products.deleteOne({_id : id});
        res.redirect("/allProducts");
    }
    catch {
        res.render("allProducts", {message : "Could not delete the product :("});
    }
})

app.post("/editProducts", async (req,res) => {
    try {
        let id = req.body.id;
        var product = {
            name: req.body.name,
            category : req.body.category,
            description: req.body.description,
            price : req.body.price,
            stock : req.body.stock
        }
        await products.updateOne( {_id : id} , { $set : product} );
        res.redirect("/allProducts");
    }
    catch {
        res.render("allProducts", {message : "Could not update the product :("});
    }
})

app.post('/addProducts', upload.single('image'), async (req, res) => {
    var product = {
        _id : req.body.id,
        name: req.body.name,
        category : req.body.category,
        description: req.body.description,
        price : req.body.price,
        stock : req.body.stock,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/public/products/' + req.file.originalname)),
            contentType: 'image/png'
        }
    }
    try{
        await products.create(product);
        res.redirect('/');
    }
    catch {
        res.render("addProducts",{message : "Could not add new product !"});
    }

})

app.post('/deleteProducts', async (req,res) => {
    let pid = req.body.productID;
    try {
        await products.deleteOne({_id : pid});
        res.redirect('/');
    }
    catch {
        res.render('deleteProducts', {message: "Could not delete product!"})
    }
})

app.get('/', async (req, res) => {
    if(user && user == "admin"){
        res.redirect("/adminHome");
        return;
    }
    try {
        const allProds = await products.find({});
        res.render("home", {items : allProds});
    }
    catch {
        res.render("home", {message : "Could not load the products :("});
    }
})

app.post('/', async (req, res) => {
    if(!req.body.userSearch && req.body.userSearch != ""){
        if(!req.body.prod && req.body.prod != ""){    
            let id = req.body.id;
            try {
                let stockInfo = await products.findOne({_id : id});
                stock = stockInfo.stock;
        
                if (user) {
                    const check = await carts.findOne({ _id : user });
                    if (check) {
                        let l = check.items.length;
                        i = 0
                        while(i < l && check.items[i].id != id) i++;
                        if(i >= l || l == 0){
                            await carts.updateOne({_id : user}, 
                                {$push : {items : {id : id , quantity : 1, stock : stock}}});
                        }
                        else {
                            try {
                                let q = check.items[i].quantity;
                                _old = {
                                    id : id,
                                    quantity: q,
                                    stock : stock
                                }
                                q += 1;
                                _new = {
                                    id : id,
                                    quantity: q,
                                    stock : stock
                                }
                                await carts.updateOne({_id:user},
                                    {$pull : {items : _old}});
                                await carts.updateOne({_id:user},
                                    {$push : {items : _new}});
                            }
                            catch {
                                console.log("Error adding item! ");
                            }
                        }
                    }
                    else {
                        const newData = {
                            _id: user,
                            items: [{id : id , quantity : 1, stock : stock}]
                        };
                        await carts.insertMany([newData]);
                        cartEmpty = false;
                    }
                    res.redirect('/cart');
                }
                else {
                    res.redirect('/login');
                }
            }
            catch {
                console.log("Error Occured !");
            }
        }
        else {
            let id = req.body.prod;
            let prod = await products.findOne({_id : id});
            if(prod){
                res.render("product", {product : prod});
            }
            else{
                res.render("product",{message : 'Could not load product info !'});
            }
        }
    }
    else{
        //search
        var userSearch = req.body.userSearch;
        const results = await products.find({category : userSearch});
        if(results){
            if(results.length){
                res.render("home", {items : results, message : "Search Results for " + userSearch});
                return;
            }
        }
        res.render("home", { message : "No Results found for " + userSearch});
    }
})

app.get('/cart', async (req, res) => {
    if (user) {
        try {
            let cartItems = [];
            let totalPrice = 0;
            const ItemsArray = await carts.findOne({ _id: user });
            if(!ItemsArray.items.length){
                res.render("cart", { message: "Your Cart is empty!", isnotMessage: false });
            }
            else {
                for (var i = 0; i < ItemsArray.items.length; i++) {
                    let item = await products.findOne({ _id: ItemsArray.items[i].id });

                    cartItems.push({
                        prodId: item._id,
                        prodName: item.name,
                        prodDesc: item.description,
                        prodPrice: item.price,
                        prodQuantity : ItemsArray.items[i].quantity,
                        prodStock : ItemsArray.items[i].stock
                    });
                    totalPrice += (item.price) * (ItemsArray.items[i].quantity);
                };
                res.render("cart", { items: cartItems, total: totalPrice, isnotMessage: true });
            }
        }
        catch {
            res.render("cart", { message: "Your Cart is empty!", isnotMessage: false })
        }
    }
    else {
        res.redirect('/login');
    }
})

app.post('/cart', async (req, res) => {
    if(req.body.btn == "placeOrder"){    
        let cartItems = [];
        let totalPrice = 0;
        try {
            const ItemsArray = await carts.findOne({ _id: user });
            for (var i = 0; i < ItemsArray.items.length; i++) {
                let item = await products.findOne({ _id: ItemsArray.items[i].id });

                cartItems.push({
                    prodId: item._id,
                    prodName: item.name,
                    prodDesc: item.description,
                    prodPrice: item.price,
                    prodQuantity : ItemsArray.items[i].quantity
                });
                totalPrice += item.price;
            };

            const check = await carts.deleteOne({ _id: user });
            if (check) {
                let d = new Date();
                var date = d.getDate() + '/' + d.getMonth() + '/' + d.getFullYear();
                await orders.insertMany([{ name: user, order: cartItems, total : totalPrice, orderedDate : date, delivered : false}]);
                res.render("order", { items: cartItems, total: totalPrice,  isnotMessage: true });
                cartEmpty = true;
            }
            else {
                res.render("order", { message: "Failed to place order :(", isnotMessage: false })
            }
        }
        catch {
            res.render("cart",{ message: "Failed to place order :(", isnotMessage: false });
        }
    }
    else if(req.body.btn != "prod"){
        try{
            let id = req.body.id;
            let result = await carts.findOne({_id : user});
            i = 0
            let len = result.items.length;
            while(i < len && result.items[i].id != id) i++;
            let q = result.items[i].quantity;
            let s = result.items[i].stock;
            _old = {
                id : id,
                quantity: q,
                stock : s
            }

            if(req.body.btn == "+")
            q += 1;
            else q -= 1;


            if(q > 0 && q <= s){
                _new = {
                    id : id,
                    quantity: q,
                    stock : s
                }
                await carts.updateOne({_id:user},
                    {$pull : {items : _old}});
                await carts.updateOne({_id:user},
                    {$push : {items : _new}});
                res.redirect("/cart")
            }
            else {
                if(q < 1){
                    await carts.updateOne({_id:user}, {$pull : {items : _old}});
                    res.redirect('/cart');
                }
            }
        }
        catch {
            res.render("cart", {message : "failed to update :("})
        }
    }
    else {
        
    }
})

app.get('/ordersList',async (req,res)=>{
    if(user){
        try {
            let OrderItems = await orders.find({name : user, delivered : false});
            OrderItems = Object.values(OrderItems);
            if(OrderItems.length)
            res.render("ordersList", { Items : OrderItems})
            else
            res.render("ordersList",{ message: "You have not ordered anything yet !"})
        }
        catch {
            res.render("ordersList",{ message: "Could not load your orders :(" })
        }
    } 
    else {
        res.redirect('/login');
    }
})

app.post('/ordersList',async (req,res)=>{
    if(user){
        try {
            await orders.deleteOne({_id : req.body.oid});
            res.redirect("/ordersList")
        }
        catch {
            res.render("ordersList",{ message: "Could not load your orders :(" })
        }
    } 
    else {
        res.redirect('/login');
    }
})

app.get('/userOH',async (req,res)=>{
    if(user){
        try {
            let OrderItems = await orders.find({name : user, delivered : true});
            OrderItems = Object.values(OrderItems);
            if(OrderItems.length)
            res.render("userOH", { Items : OrderItems})
            else
            res.render("userOH",{ message: "Nothing to show !"})
        }
        catch {
            res.render("userOH",{ message: "Could not load your orders :(" })
        }
    } 
    else {
        res.redirect('/login');
    }
})

app.get('/login', (req, res) => {
    if (!user) {
        res.render("login.hbs");
    }
    else {
        res.render('logout', { username: userName });
    }
})

app.post("/login", async (req, res) => {
    if (!user) {
        try {
            const check = await users.findOne({ _id: req.body.id });
            if (check.password == req.body.password) {
                user = check._id;
                userName = check.name;
                if(user != "admin"){
                    if (!cartEmpty) {
                        res.send("/");
                    }
                    else {
                        res.redirect('/cart');
                    }
                }
                else {
                    res.redirect("/adminHome");
                }
            } else {
                res.render("login", { message: 'Incorrect password.' });
            }
        } catch {
            res.render("login", { message: 'User does not exist.' });
        }
    } else {
        res.render('logout', { username : userName });
    }
})

app.post('/logout', (req, res) => {
    user = null;
    userName = null;
    cartEmpty = true;
    res.redirect("/");
})

app.get('/signup', (req, res) => {
    res.render("signup.hbs");
})

app.post("/signup", async (req, res) => {
    const data = {
        _id : req.body.id,
        name: req.body.name,
        password: req.body.password,
        address : req.body.address,
        phone : req.body.phone
    }
    await users.insertMany([data]);
    user = req.body.id;
    userName = req.body.name;
    res.redirect("/");
})

app.listen(8000, () => {
    console.log("Application running on port 8000");
})

