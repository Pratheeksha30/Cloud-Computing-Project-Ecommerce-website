const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/Ecommerce")
.then(()=>{
    console.log("mongoDB connected");
})
.catch(()=>{
    console.log("Failed to connect");
})

const loginSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    password:{
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
    }
})

const cartSchema = new mongoose.Schema({
    name:{
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
    }
})

const users = new mongoose.model("Users",loginSchema);
const products = new mongoose.model("Products",productSchema);
const carts = new mongoose.model("Carts",cartSchema);
const orders = new mongoose.model("Orders",orderSchema);

const addProducts = async () => {
    data  = [{
        _id : 1,
        name : "Kurti",
        description : "Red Color",
        price : 899,
        stock : 2
    }, {
        _id : 2,
        name : "Jeans",
        description : "Blue Ripped Long",
        price : 999,
        stock : 2
    }, {
        _id : 3,
        name : "Skirt",
        description : "Long Red",
        price : 599,
        stock : 2
    }, {
        _id : 4,
        name : "Denim",
        description : "Blue Jacket",
        price : 799,
        stock : 2
    }]
    try{
        const check = await products.insertMany(data);
        if(check){
            console.log("Uploaded Successfully !");
        }
        return;
    }
    catch {
        console.log("Error uploading data to database !");
    }
    return;
}

addProducts();

module.exports={users,products,carts,orders};