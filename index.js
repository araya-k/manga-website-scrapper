// Import needed modules
const express = require('express')
const mongoose = require('mongoose')
const scraper = require('./routes/scraper')

// Creates app
const app = express()

// Initializes application port
const PORT = process.env.PORT || 8000

// Connect to mongodb
const username = 'root'
const password = encodeURIComponent('r?RMxLdbkq1D?Ue*gP$dl&Lq?crLj!7w')
const host = 'zdeee9589-mongodb.heapstack.sh'
const dbport = '27017'

mongoose.connect(
    `mongodb://${username}:${password}@${host}:${dbport}`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Database connection error: "))
db.once("open", function () {
    console.log("Database connected successfully");
})

app.use('/', scraper)

app.get('/delete-db', (req, res) => {
    db.dropDatabase()
    console.log('Database deleted successfully')
    res.redirect('/')
})

/*
// All manga series endpoint
app.get('/series', async (req, res) => {
    mangaListUrl.forEach(item => {
        item.links.self = `${req.protocol}://${req.get('host')}/series/${item.attributes.slug}`
    })
    await res.json(mangaListUrl)
})

// Redirect series request with trailing slash
app.get('/series/', (req, res) => {
    res.redirect(301, '/series')
})

// Specific manga endpoint
app.get('/series/:seriesSlug', async (req, res) => {
    const seriesSlug = req.params.seriesSlug

    // Check whether the requested seriesSlug exist or not
    const seriesSlugCheck = await mangaListUrl.filter(manga => manga.attributes.slug == seriesSlug)
    if (seriesSlugCheck.length === 0) {return res.status(404).json({error: "Requested Manga Not Found"})}
    const specificMangaRequest = seriesSlugCheck[0]

    try {
        // Getting the relevant data for requested manga
        const specificMangaResponse = await getSeries.getAllMangaData(specificMangaRequest)
        const specificMangaData = specificMangaResponse[0]
        specificMangaData.links.chapterUrl = `${req.protocol}://${req.get('host')}/series/${specificMangaData.attributes.slug}/chapter`
        specificMangaData.links.self = `${req.protocol}://${req.get('host')}/series/${specificMangaData.attributes.slug}`
        const specificMangaChapter = specificMangaData.chapters
        specificMangaChapter.forEach(chapter => {
            chapter.links.seriesUrl = `${req.protocol}://${req.get('host')}/series/${chapter.relationships.seriesSlug}`
            chapter.links.self = `${req.protocol}://${req.get('host')}/series/${chapter.relationships.seriesSlug}/${chapter.attributes.slug}`
        })
        await res.json(specificMangaData)
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({
            error: "Something went wrong"
        })
    }
})

// Specific manga chapter endpoint
app.get('/series/:seriesSlug/chapter', async (req, res) => {
    const seriesSlug = req.params.seriesSlug

    // Check whether the requested seriesSlug exist or not
    const seriesSlugCheck = await mangaListUrl.filter(manga => manga.attributes.slug == seriesSlug)
    if (seriesSlugCheck.length === 0) {return res.status(404).json({error: "Requested Manga Not Found"})}
    const specificMangaRequest = seriesSlugCheck[0]

    try {
        // Getting the relevant data for requested manga
        const specificMangaResponse = await getSeries.getAllMangaData(specificMangaRequest)
        const specificMangaData = specificMangaResponse[0]
        const specificMangaChapter = specificMangaData.chapters
        specificMangaChapter.forEach(chapter => {
            chapter.links.seriesUrl = `${req.protocol}://${req.get('host')}/series/${chapter.relationships.seriesSlug}`
            chapter.links.self = `${req.protocol}://${req.get('host')}/series/${chapter.relationships.seriesSlug}/${chapter.attributes.slug}`
        })
        await res.json(specificMangaChapter)
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({
            error: "Something went wrong"
        })
    }
})

app.get('/series/:seriesSlug/chapter/', async (req, res) => {
    const seriesSlug = req.params.seriesSlug
    res.redirect(301, `/series/${seriesSlug}/chapter`)
})

// Specific chapter endpoint
app.get('/series/:seriesSlug/chapter/:chapterSlug', async (req, res) => {
    const seriesSlug = req.params.seriesSlug
    const chapterSlug = req.params.chapterSlug

    // Check whether the requested seriesSlug exist or not
    const seriesSlugCheck = await mangaListUrl.filter(manga => manga.attributes.slug == seriesSlug)
    if (seriesSlugCheck.length === 0) {return res.status(404).json({error: "Requested Manga Not Found"})}
    const specificMangaRequest = seriesSlugCheck[0]

    try {
        // Getting the relevant data for requested manga
        const specificMangaResponse = await getSeries.getAllMangaData(specificMangaRequest)
        const specificMangaData = specificMangaResponse[0]
        const specificMangaChapter = specificMangaData.chapters

        // Check whether the requested chapterSlug exist or not
        const chapterSlugCheck = specificMangaChapter.filter(chapter => chapter.id == chapterSlug)
        if (chapterSlugCheck.length === 0) {return res.status(404).json({error: "Requested Chapter Not Found"})}
        const specificChapterRequest = chapterSlugCheck[0]
        const specificChapterUrl = specificChapterRequest.links.sourceUrl

        // Getting the relevant data for requested chapter
        const pureImagesUrl = await getContent.getAllImagesUrl(specificChapterUrl)
        specificChapterRequest.contentUrl = pureImagesUrl
        specificChapterRequest.links.seriesUrl = `${req.protocol}://${req.get('host')}/series/${specificChapterRequest.relationships.seriesSlug}`
        specificChapterRequest.links.self = `${req.protocol}://${req.get('host')}/series/${specificChapterRequest.relationships.seriesSlug}/${specificChapterRequest.attributes.slug}`

        await res.json(specificChapterRequest)
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({
            error: "Something went wrong"
        })
    }
})

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