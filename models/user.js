const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")


const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    profileImg:{
        type:String
    },
    products:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product"
        }
    ],
    reviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Review"
        }
    ]
},
{
    timestamps:true
}
)

userSchema.pre("save",async function(next){
    try{
        if(!this.isModified("password")){
            return next()
        }
        let hashedPassword = await bcrypt.hash(this.password,11);
        this.password = hashedPassword
    }catch(err){
        console.log(err)
    }finally{
        console.log("finished in the save function")
    }
})

userSchema.methods.comparePassword = async function(candidatePassword,next){
    try{
        let isMatch = await bcrypt.compare(candidatePassword,this.password)
        return isMatch
    }catch(err){
        return console.log(err)
    }finally{
        console.log("done with compare password")
    }
}

const User = mongoose.model("User",userSchema)
module.exports = User