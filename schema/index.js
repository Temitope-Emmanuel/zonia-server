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
        addUser:{
            type:UserType,
            args:{
                username:{type:new GraphQLNonNull(GraphQLString)},
                email:{type:new GraphQLNonNull(GraphQLString)},
                password:{type:new GraphQLNonNull(GraphQLString)},
                profileImg:{type: GraphQLString}
            },
            async resolve(parents,{username,email,password,profileImg}){
                const newUser = await db.User.create({
                    _id:new mongoose.Types.ObjectId(),
                    username,
                    email,
                    password,
                    profileImg
                })
                const {id} = await newUser
                await newUser.save()

                let token = jwt.sign({
                    id,username,email
                },process.env.SECRET_KEY,{expiresIn:"2d"})
                const payload = {token,username,email,id,profileImg}
                return payload
            }
        },
    }
})

module.exports = new GraphQLSchema({
    query:RootQuery,
    mutation:Mutation
})