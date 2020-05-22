const express = require("express")
const app = express()
const graphqlHTTP = require("express-graphql")
const schema = require("./schema/")

const PORT = process.env.PORT || 3000

app.use("/graphql",graphqlHTTP({
    schema,
    graphiql:true
}))

app.get('/',(req,res) => (
    res.send("Welcome back Warrior")
))

app.listen(PORT,() => (
    console.log(`listening on PORT ${PORT}`)
))