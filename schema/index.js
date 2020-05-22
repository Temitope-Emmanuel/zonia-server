require("dotenv").config()
const graphql = require("graphql")
const mongoose = require("mongoose")
const db = require("../models")
const jwt = require("jsonwebtoken")

const {
    GraphQLObjectType,
    GraphQLInt,
    GraphQLString,
    GraphQLSchema,
    GraphQLNonNull,
    GraphQLID,
    GraphQLList
} = graphql




const UserType = new GraphQLObjectType({
    name:"User",
    fields:() =>({
        profileImg:{type:GraphQLString},
        username:{type:GraphQLString},
        email:{type:GraphQLString},
        token:{type:GraphQLString},
        products:{
            type:new GraphQLList(ProductType),
            async resolve(parents,args){
                const foundProduct = db.Product.find({owner:parents.id})
                return foundProduct
            }
        },
        id:{type:GraphQLID},
        createdAt:{type:GraphQLString},
        updatedAt:{type:GraphQLString}
    })
})

const ProductType = new GraphQLObjectType({
    name:"Product",
    fields:() => ({
        price:{type:GraphQLInt},
        name:{type:GraphQLString},
        _id:{type:GraphQLID},
        createdAt:{type:GraphQLString},
        updatedAt:{type:GraphQLString},
        owner:{
            type:UserType,
            async resolve(parents,args){
                const foundUser = db.User.findById(parents.owner)
                return foundUser
            }
        }
    })
})


const RootQuery = new GraphQLObjectType({
    name:"RootQueryType",
    fields:{
        user:{
            type:UserType,
            args:{id:{type:GraphQLID}},
            async resolve(_,{id}){
                return await db.User.findById(id)
            }
        },
        getAllUser:{
            type:new GraphQLList(UserType),
            async resolve(_,args){
                return await db.User.find({})
            }
        },
        getProduct:{
            type:ProductType,
            args:{
                name:{type:GraphQLString},
                id:{type:GraphQLString}
            },
            async resolve(parents,{name,id}){
                if(id){
                    return await db.Product.findById(id)
                }else if(name){
                    return await db.Product.findOne({name:name})
                }
            }
        },
        getAllProduct:{
            type:new GraphQLList(ProductType),
            async resolve(_,args){
                return await db.Product.find()
            }
        }
    }
})

const Mutation = new GraphQLObjectType({
    name:"Mutation",
    fields:{
        signup:{
            type:UserType,
            args:{
                username:{type:new GraphQLNonNull(GraphQLString)},
                email:{type:new GraphQLNonNull(GraphQLString)},
                password:{type:new GraphQLNonNull(GraphQLString)},
                profileImg:{type: GraphQLString}
            },
            async resolve(parents,{username,email,password,profileImg}){
                const id = new mongoose.Types.ObjectId()
                const newUser = await db.User.create({
                    _id:id,
                    username,
                    email,
                    password,
                    profileImg
                })
                await newUser.save()

                let token = jwt.sign({
                    id,username,email
                },process.env.SECRET_KEY,{expiresIn:"2d"})
                const payload = {token,username,email,id,profileImg}
                return payload
            }
        },
        login:{
            type:UserType,
            args:{
                email:{type:GraphQLString},
                password:{type:GraphQLString}
            },
            async resolve(parents,{email,password}){
                const foundUser = await db.User.findOne({
                    email:email
                })
                console.log(foundUser)
                let {_id,username,profileImg} = foundUser
                let isMatch = await foundUser.comparePassword(password)
                if(isMatch){
                    let token = jwt.sign({
                        _id,username,profileImg
                    },process.env.SECRET_KEY,{expiresIn:"2d"})
                    return {id:_id,username,profileImg,token}

                }else{
                    // Add a way to send error
                    throw new Error({message:"Credentials Validation Failed"})
                }
            }
        },
        addProduct:{
            type:ProductType,
            args:{
                owner:{type:new GraphQLNonNull(GraphQLString)},
                name:{type:new GraphQLNonNull(GraphQLString)},
                price:{type:new GraphQLNonNull(GraphQLInt)}
            },
            async resolve(parents,{name,owner,price}){
                const id = new mongoose.Types.ObjectId()
                const newProduct = await db.Product.create({
                    _id:id,
                    owner,
                    name,
                    price
                })
                await newProduct.save()
                return newProduct
            }
        },
        removeProduct:{
            type:ProductType,
            args:{
                id:{type:GraphQLID},
                name:{type:GraphQLString}
            },
            async resolve(parents,{id,name}){
                let foundProduct;
                if(id){
                    foundProduct = await db.Product.findById(id)
                    await foundProduct.remove()
                }else if(name){
                    foundProduct = await db.Product.findOne({name:name})
                    await foundProduct.remove()    
                }
                return foundProduct
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query:RootQuery,
    mutation:Mutation
})