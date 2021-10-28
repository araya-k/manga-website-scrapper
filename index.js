// Import needed modules
const cheerio = require('cheerio')
const cloudscraper = require('cloudscraper')
const express = require('express')
const apicache = require('apicache')
const bodyParser = require('body-parser')
const getWebPage = require('./getWebPage')

// Creates app
const app = express()
app.use(bodyParser.json())
let cache = apicache.middleware
app.use(cache('1 day'))

// Initializes application port
const PORT = process.env.PORT || 8000

// Creates variable to store all manga list data
const jsonAllMangaData = []

// Getting all necessary information from manga web page
async function getAllMangaData() {
    const allMangaListAddress = 'https://www.asurascans.com/manga/list-mode/'
    try {
        const htmlAllMangaPage = await getWebPage.getAllPageElements(allMangaListAddress)
        const $ = cheerio.load(htmlAllMangaPage)
        let id = 0

        // Get every manga's title and url from website
        $('a.series', 'div.soralist', htmlAllMangaPage).each(function () {
            const title = $(this).text()
            const url = $(this).attr('href')

            // Store that data to array
            jsonAllMangaData.push({
                type: "series",
                id: id += 1,
                attributes: {
                    title,
                    slug: url.split('/').reverse()[1]
                },
                links: {
                    source: url
                }
            })
        })
    }
    catch (error) {
        console.error(error)
    }
}

// Get all manga list data
getAllMangaData()

// Root endpoint
app.get('/', (req, res) => {
    res.json('Welcome to Manga Scrapper API!')
})

// remove that favicon request which causing headache
app.get('/favicon.ico', (req, res) => res.status(204));

// All manga series endpoint
app.get('/series', async (req, res) => {
    jsonAllMangaData.forEach(item => {
        item.links.self = `${req.protocol}://${req.get('host')}/series/${item.attributes.slug}`
    })
    await res.json(jsonAllMangaData)
})

// Specific manga endpoint
app.get('/series/:mangaID', async (req, res) => {
    const mangaID = req.params.mangaID

    // Check whether the requested mangaID exist or not
    const mangaIDCheck = jsonAllMangaData.filter(manga => manga.attributes.slug == mangaID)
    if (mangaIDCheck.length === 0) {return res.status(404).json({error: "Requested Manga Not Found"})}

    // Getting the specific manga address
    const specificMangaAddress = jsonAllMangaData.filter(manga => manga.attributes.slug == mangaID)[0].links.source

    // Creates variable to store specific manga chapters data
    const specificMangaChaptersData = []

    // Trying to get the chapter list data for a specific manga
    try {
        const htmlAllChaptersPage = await getWebPage.getAllPageElements(specificMangaAddress)
        const $ = cheerio.load(htmlAllChaptersPage)

        // Get every chapter's title and url from website
        $('a', 'div.eplister', htmlAllChaptersPage).each(function () {
            const title = $('span.chapternum', this).text()
            const url = $(this).attr('href')
            const tempSlug = url.split('/').reverse()[1]
            const id = tempSlug.split('-').pop()
            const slug = `chapter/${id}`

            // Store that data to array
            specificMangaChaptersData.push({
                type: "chapters",
                id,
                attributes: {
                    title,
                    slug
                },
                links: {
                    source: url,
                    self: `${req.protocol}://${req.get('host')}/series/${mangaID}/${slug}`
                }
            })
        })
        await res.json(specificMangaChaptersData)
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({
            error: "Something went wrong"
        })
    }
})

app.get('/series/:mangaID/chapter/:chapterID', async (req, res) => {
    const mangaID = req.params.mangaID
    const chapterID = req.params.chapterID

    // Check whether the requested mangaID exist or not
    const mangaIDCheck = jsonAllMangaData.filter(manga => manga.attributes.slug == mangaID)
    if (mangaIDCheck.length === 0) {return res.status(404).json({error: "Requested Manga Not Found"})}

    // Getting the specific manga address
    const specificMangaAddress = jsonAllMangaData.filter(manga => manga.attributes.slug == mangaID)[0].links.source

    // Creates variable to store specific manga chapters data
    const specificMangaChaptersData = []

    // Trying to get the chapter list data for a specific manga
    try {
        const htmlAllChaptersPage = await getWebPage.getAllPageElements(specificMangaAddress)
        const $ = cheerio.load(htmlAllChaptersPage)

        // Get every chapter's title and url from website
        $('a', 'div.eplister', htmlAllChaptersPage).each(function () {
            const title = $('span.chapternum', this).text()
            const url = $(this).attr('href')
            const tempSlug = url.split('/').reverse()[1]
            const id = tempSlug.split('-').pop()
            const slug = `chapter/${id}`

            // Store that data to array
            specificMangaChaptersData.push({
                type: "chapters",
                id,
                attributes: {
                    title,
                    slug
                },
                links: {
                    source: url,
                    self: `${req.protocol}://${req.get('host')}/series/${mangaID}/${slug}`
                }
            })
        })

        // Check whether the requested chapterID exist or not
        const chapterIDCheck = specificMangaChaptersData.filter(chapter => chapter.id == chapterID)
        if (chapterIDCheck.length === 0) {return res.status(404).json({error: "Requested Chapter Not Found"})}

        // Getting the specific chapter address
        const specificChapterAddress = specificMangaChaptersData.filter(chapter => chapter.id == chapterID)[0].links.source

        // Creates variable to store specific manga chapters data
        const specificChapterData = []

        // Trying to get the image list data for a specific chapter
        try {
            const htmlAllChapterContentPage = await getWebPage.getAllPageElements(specificChapterAddress)
            const $$ = cheerio.load(htmlAllChapterContentPage)
            const allImagesUrl = []

            // Get every image's url from website
            $$('img', 'div#readerarea', htmlAllChapterContentPage).each(function () {
                const url = $$(this).attr('src')

                // Store the data to array
                allImagesUrl.push(url)
            })

            // Arrange the data to array
            specificChapterData.push({
                type: "images",
                id: chapterID,
                content: allImagesUrl.slice(1,-1),
                relationship: {
                    series: `${req.protocol}://${req.get('host')}/series/${mangaID}`
                }
            })
            await res.json(specificChapterData)
        }
        catch (error) {
            console.error(error)
            return res.status(500).json({
                error: "Something went wrong"
            })
        }
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

app.get('/myfavorites', async (req, res) => {
    const favoriteSeriesData = []

    // Fetch manga data from favorite list
    try {
        favoriteSeriesSlug.forEach(favorite => {
            const jsonFavoriteData = jsonAllMangaData.filter(manga => manga.attributes.slug == favorite)[0]
            favoriteSeriesData.push(jsonFavoriteData)
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

/*app.post('/myfavorites', (req, res) => {
    const { newMangaFavoriteSlug } = req.body
    const mangaExist = favoriteSeriesSlug.find(manga => manga === newMangaFavoriteSlug)
    if (mangaExist) {
        return res.status(400).json({ error: 'Manga already exists in favorite list' })
    }
    res.json(req.body)
})*/

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))