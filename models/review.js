const mongoose = require("mongoose")
const Product = require("./product")
const User = require("./user")

const reviewSchema = new mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    product:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Product"
    }
})

reviewSchema.pre("remove",async function(next){
    try{
        const foundProduct = await Product.findById(this.product)
        await foundProduct.review.remove(this.product)
        await foundProduct.save()
        const foundUser = await User.findById(this.author)
        await foundUser.review.remove(this.author)
        await foundUser.save()
    }catch(e){
        return next(e)
    }finally{
        console.log("done with the review schema")
    }
})

const Review = mongoose.model("Review",reviewSchema)
module.exports = Review