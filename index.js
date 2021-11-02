// Import needed modules
const express = require('express')
const scrape = require('./routes/scrape')
const series = require('./routes/series')
const { graphqlHTTP } = require('express-graphql')
const schema = require('./schema/schema')
const mongoose = require('mongoose')
require('dotenv').config()

// Creates app
const app = express()
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use('/scrape', scrape)
app.use('/series', series)
app.use('/graphql', graphqlHTTP({schema: schema, graphiql: true}))

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
    res.json('Welcome to Manga Scrapper API v2')
})

app.get('/favicon.ico', (req, res) => res.status(204))

/*
// List of my favorite manga
const favoriteSeriesSlug = [
    'auto-hunting',
    'doctors-rebirth',
    'i-the-strongest-demon-have-regained-my-youth',
    'im-the-only-one-loved-by-the-constellations',
    'legend-of-asura-the-venom-dragon',
    'limit-breaker',
    'max-level-returner',
    'player-who-cant-level-up',
    'reformation-of-the-deadbeat-noble',
    'regressor-instruction-manual',
    'reincarnation-of-the-suicidal-battle-god',
    'return-of-the-8th-class-magician',
    'return-of-the-unrivaled-spear-knight',
    'rise-from-the-rubble',
    'seoul-stations-necromancer',
    'solo-bug-player',
    'solo-leveling',
    'solo-max-level-newbie',
    'solo-spell-caster',
    'sss-class-gacha-hunter',
    'sss-class-suicide-hunter',
    'starting-today-im-a-player',
    'the-constellation-that-returned-from-hell',
    'the-dark-magician-transmigrates-after-66666-years',
    'the-game-that-i-came-from',
    'the-immortal-emperor-luo-wuji-has-returned',
    'the-king-of-bug',
    'the-lords-coins-arent-decreasing',
    'the-max-level-hero-has-returned',
    'the-second-coming-of-gluttony',
    'the-tutorial-is-too-hard',
    'the-tutorial-tower-of-the-advanced-player',
    'villain-to-kill',
    'worn-and-torn-newbie',
    'your-talent-is-mine'
]
// My favorite series endpoint
app.get('/favorite', async (req, res) => {
    const favoriteSeriesData = []

    try {
        // Fetch manga data from favorite list
        await favoriteSeriesSlug.forEach(async (favorite) => {
            const favoriteSeries = await mangaListUrl.filter(manga => manga.attributes.slug == favorite)[0]
            favoriteSeriesData.push(favoriteSeries)
        })
        for (const item of favoriteSeriesData) {
            item.links.self = `${req.protocol}://${req.get('host')}/series/${item.attributes.slug}`
        }
        await res.json(favoriteSeriesData)
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({
            error: "Something went wrong"
        })
    }
})
*/

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))