const mongoose = require("mongoose")
mongoose.set("debug",true)
mongoose.Promise = global.Promise

mongoose.connect("mongodb://localhost/zoniav2",{
    useUnifiedTopology:true
})

module.exports.User = require("./user")
module.exports.Product = require("./product")
module.exports.Review = require("./Review")