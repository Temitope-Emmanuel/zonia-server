require("dotenv").config()

const jwt = require("jsonwebtoken");

exports.verifyToken = function(req,res,next){
    try{
        req.isAuthenticated = false 
        const token = req.headers.authorization.split(" ")[1]
        jwt.verify(token,process.env.SECRET_KEY,function(err,decoded){
            if(decoded){
                console.log(decoded)
                req.isAuthenticated = true
            }
        })
    }finally{
        return next()   
    }
}

exports.ensureUser = function(req,res,next){
    try{
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token,process.env.SECRET_KEY,function(err,decoded){
            if(decoded && decoded.id){
                req.user = decoded               
            }
        })
    }finally{
        return next()
    }
}