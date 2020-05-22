const mongoose = require("mongoose")
mongoose.set("debug",true)
mongoose.Promise = global.Promise

mongoose.connect("mongodb://localhost/zoniav1",{
    keepAlive:true,
    useNewUrlParser:true,
    useUnifiedTopology:true
})

module.exports.User = require("./user")
module.exports.Product = require("./product")