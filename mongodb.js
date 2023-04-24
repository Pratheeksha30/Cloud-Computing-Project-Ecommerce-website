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
        description : "Red Color kurti.\nTailored with three quarter sleeves and a round neck",
        price : 899,
        stock : 2
    }, {
        _id : 2,
        name : "Blue Print Skirt",
        description : "Blue kalidar lehenga skirt in georgette.\nIt features chevron foil print and tassels.\nFinished with a shantoon lining, and a zip closure.",
        price : 3600,
        stock : 2
    }, {
        _id : 3,
        name : "Black Print Kurta",
        description : "Black tiered maxi kurta in viscose.\nTailored with three quarter sleeves and a round neck, it features an all-over boota print, mirror embroidery and a dori tie up on the front.\nFinished with a zip closure and two pockets.",
        price : 599,
        stock : 2
    }, {
        _id : 4,
        name : "Floral Midi Dress",
        description : "Blue maxi dress in georgette.\nTailored sleeveless with a V-neck, it features all-over floral print.\nFinished with shantoon lining and a zip closure.",
        price : 2599,
        stock : 2
    }, {
        _id : 5,
        name : "Mughal Print Lehenga",
        description : "Ivory kalidar lehenga in georgette.\nIt features an all-over floral print and mughal border.\nFinished with a shantoon lining and a zip closure.",
        price : 3560,
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