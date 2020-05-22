require("dotenv").config()
const graphql = require("graphql")
const mongoose = require("mongoose")
const db = require("../models")
const jwt = require("jsonwebtoken")

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLNonNull,
    GraphQLID,
} = graphql




const UserType = new GraphQLObjectType({
    name:"User",
    fields:() =>({
        id:{type:GraphQLID},
        username:{type:GraphQLString},
        email:{type:GraphQLString},
        profileImg:{type:GraphQLString},
        token:{type:GraphQLString},
        products:{
            type:ProductType,
            async resolve(parents,args){
                const foundProduct = db.products.find({owner:parents.id})
                return foundProduct
            }
        }
    })
})

const ProductType = new GraphQLObjectType({
    name:"Product",
    fields:() => ({
        name:{type:GraphQLString},
        owner:{
            type:UserType,
            async resolve(parents,args){
                const foundUser = db.User.findById(parents.id)
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
        }
    }
})

module.exports = new GraphQLSchema({
    query:RootQuery,
    mutation:Mutation
})