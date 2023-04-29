const mongoose = require("mongoose");
const path = require("path");
var fs = require('fs');

mongoose.connect("mongodb://mongo:27017/Ecommerce")
.then(()=>{
    console.log("mongoDB connected");
})
.catch(()=>{
    console.log("Failed to connect");
})

const userSchema = new mongoose.Schema({
    _id : {
        type:String,
        required:true
    }, 
    name : {
        type:String,
        required:true
    },
    password : {
        type:String,
        required:true
    },
    address : {
        type:String,
        required:true
    },
    phone : {
        type:String,
        required:true
    }
})

const productSchema = new mongoose.Schema({
    _id:{
        type:Number,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    category : {
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    stock:{
        type:Number,
        required:true        
    },
    img : {
        data: Buffer,
        contentType: String
    }
})

const cartSchema = new mongoose.Schema({
    _id:{
        type:String,
        required:true
    },
    items:{
        type:Array,
        required:true
    }
})

const orderSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    order:{
        type:Array,
        required:true
    },
    total:{
        type:Number,
        required:true
    },
    orderedDate : {
        type:String,
        required:true
    },
    delivered : {
        type:Boolean,
        required:true
    },
    deliveredDate : {
        type:String
    }
})

const users = new mongoose.model("Users",userSchema);
const products = new mongoose.model("Products",productSchema);
const carts = new mongoose.model("Carts",cartSchema);
const orders = new mongoose.model("Orders",orderSchema);

const addProducts = async () => {
    data  = [{
        _id : 1,
        name : "Red Print Kurta",
        category : "kurta",
        description : "Red Color kurta.\nTailored with three quarter sleeves and a round neck",
        price : 899,
        stock : 2,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/public/products/1.png')),
            contentType: 'image/png'
        }
    }, {
        _id : 2,
        name : "Blue Print Skirt",
        category : "skirt",
        description : "Blue kalidar lehenga skirt in georgette.\nIt features chevron foil print and tassels.\nFinished with a shantoon lining, and a zip closure.",
        price : 3600,
        stock : 2,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/public/products/2.png')),
            contentType: 'image/png'
        }
    }, {
        _id : 3,
        name : "Black Print Kurta",
        category : "kurta",
        description : "Black tiered maxi kurta in viscose.\nTailored with three quarter sleeves and a round neck, it features an all-over boota print, mirror embroidery and a dori tie up on the front.\nFinished with a zip closure and two pockets.",
        price : 799,
        stock : 2,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/public/products/3.png')),
            contentType: 'image/png'
        }
    }, {
        _id : 4,
        name : "Floral Midi Dress",
        category : "dress",
        description : "Blue maxi dress in georgette. Tailored sleeveless with a V-neck, it features all-over floral print.\nFinished with shantoon lining and a zip closure.",
        price : 2599,
        stock : 2,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/public/products/4.png')),
            contentType: 'image/png'
        }
    }, {
        _id : 5,
        name : "Mughal Print Lehenga",
        category : "lehenga",
        description : "Ivory kalidar lehenga in georgette.\nIt features an all-over floral print and mughal border.\nFinished with a shantoon lining and a zip closure.",
        price : 3560,
        stock : 2,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/public/products/5.png')),
            contentType: 'image/png'
        }
    }]
    try{
        for(var i = 0 ; i < 5; i++){
            try{
                let check = await products.create(data[i]);
                if(check){
                    console.log("Uploaded Products Data Successfully.");
                }
            }
            catch {
                console.log("Could not upload file.")
            }
        }
        return;
    }
    catch {
        console.log("Products data already exists !");
    }
    return;
}

const addAdmin = async () => {
    data = {
        _id : "admin",
        name : "admin",
        password : "admin",
        address : " ",
        phone : " "
    };
    try {
        const check = await users.insertMany([data]);
        if(check){
            console.log("Admin Info Added Successfully.");
        }
    }
    catch {
        console.log("Admin data already exists !");
    }
    return;
}

addAdmin();
addProducts();

module.exports={users,products,carts,orders};
