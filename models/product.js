const mongoose = require("mongoose")
const User = require("./user")

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{
    timestamps:true
})

productSchema.pre("remove",async function(next){
    try{
        const foundUser = await User.findById(this.seller)
        foundUser.products.remove(this._id)
        await foundUser.save()
        return next()
    }catch(e){
        return next(e)
    }
})


const Product = mongoose.model("Product",productSchema)
module.exports = Product