const express = require("express")
const passport = require('passport')
const userRoute = require('./routes/user.route')
require('./db.js').connectToMongoDB()
require("./authentication/auth")
require("dotenv").config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/', userRoute)
app.get('/callback', (req, res) => {
    const authorizationCode = req.query.code; 
    console.log(authorizationCode)
    res.send(`Authorization code received successfully ${authorizationCode}`);
  });




PORT = process.env.PORT

app.listen(PORT,()=>{
    console.log(`Server is running on PORT ${PORT}`)
})