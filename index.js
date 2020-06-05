const express = require("express")
const app = express()
const graphqlHTTP = require("express-graphql")
const schema = require("./schema/")
const {ensureUser,verifyToken} = require("./middleware/auth")

const PORT = process.env.PORT || 3000

app.use(verifyToken)
app.use(ensureUser)

app.use("/graphql",graphqlHTTP(req => ({
    schema,
    graphiql:true,
    context:{
        user:req.user
    }
})))

app.get('/',(req,res) => (
    res.send("Welcome back Warrior")
))

app.listen(PORT,() => (
    console.log(`listening on PORT ${PORT}`)
))