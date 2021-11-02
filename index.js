// Import needed modules
const express = require('express')
const scrape = require('./routes/scrape')
const series = require('./routes/series')
// const { graphqlHTTP } = require('express-graphql')
// const schema = require('./schema/schema')
const mongoose = require('mongoose')
require('dotenv').config()

// Creates app
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/scrape', scrape)
app.use('/series', series)
// app.use('/graphql', graphqlHTTP({schema: schema, graphiql: true}))

// Initializes application port and database information
const PORT = process.env.PORT
const USER = process.env.MONGODB_USER
const PASSWORD = process.env.MONGODB_PASSWORD
const HOST = process.env.MONGODB_HOST

// Connect to the database
mongoose.connect(`mongodb://${USER}:${encodeURIComponent(PASSWORD)}@${HOST}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.connection.once('open', () => {
    console.log("Connected to MongoDB")
})

app.get('/', (req, res) => {
    res.json('Welcome to Manga Scrapper API v3')
})

app.get('/favicon.ico', (req, res) => res.status(204))

app.delete('/db', (req, res) => {
    mongoose.connection.dropDatabase()
    console.log('Database deleted successfully')
    res.redirect('/')
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))