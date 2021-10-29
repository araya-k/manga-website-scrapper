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
const cache = apicache.middleware
app.use(cache('1 day'))

// Initializes application port
const PORT = process.env.PORT || 8000

// Creates variables to store manga data
const mangaListUrl = []
const allMangaData = []
const allChapterData = []

// Getting all necessary information from manga web page
async function getMangaListPage() {
    const mangaListAddress = 'https://www.asurascans.com/manga/list-mode/'
    try {
        const res = await getWebPage.getAllPageElements(mangaListAddress)
        return res
    }
    catch (error) {
        console.error(error)
    }
}

// Getting list of manga URL
async function getAllMangaUrl() {
    const htmlMangaListPage = await getMangaListPage()
    const $ = await cheerio.load(htmlMangaListPage)
    let id = 0
    await $('a.series', 'div.soralist', htmlMangaListPage).each(function () {
        const url = $(this).attr('href')
        const exclude1 = 'https://www.asurascans.com/comics/hero-has-returned/'
        const exclude2 = 'https://www.asurascans.com/comics/join-our-discord/'
        if (url !== exclude1) {
            if (url !== exclude2) {
                mangaListUrl.push({
                    id: id += 1,
                    url: url
                })
            }
        }
    })
    return mangaListUrl
}

// Getting information for all manga
async function getAllMangaDataFromUrl() {
    const allMangaUrlData = await getAllMangaUrl()

    try {
        await allMangaUrlData.reduce(async (prev, i) => {
            await prev
            mangaID =+ 1
            console.log(`Getting information for index ${i.id} from ${i.url}`)

            const htmlMangaPage = await getWebPage.getAllPageElements(i.url)
            const $ = await cheerio.load(htmlMangaPage)

            const seriesGenre = []
            const seriesTitle = await $('h1.entry-title', 'div.infox', htmlMangaPage).text()
            const seriesSlug = i.url.split('/').slice(-2).shift()
            const seriesThumbnailUrl = await $('img', 'div.thumb', htmlMangaPage).attr('src')
            const seriesUrl = await $('a.item', 'div.ts-breadcrumb bixbox', htmlMangaPage).attr('href')
            const seriesSynopsis = await $('p', 'div.entry-content', htmlMangaPage).text()

            await $('a', 'span.mgen', htmlMangaPage).each(function () {
                const genreTitle = $(this).text()
                seriesGenre.push(genreTitle)
            })

            allMangaData.push({
                type: "series",
                id: i.id,
                attributes: {
                    title: seriesTitle,
                    slug: seriesSlug,
                    synopsis: seriesSynopsis,
                    genre: seriesGenre
                },
                links: {
                    sourceUrl: i.url,
                    thumbnailUrl: seriesThumbnailUrl
                }
            })

            await $('a', 'div.eplister', htmlMangaPage).each(function () {
                const chapterTitle = $('span.chapternum', this).text()
                const chapterPublishedDate = $('span.chapterdate', this).text()
                const chapterUrl = $(this).attr('href')

                const chapterID = chapterTitle.split(' ').pop()
                const chapterSlug = `chapter/${chapterId}`

                allChapterData.push({
                    type: "chapters",
                    id: chapterId,
                    attributes: {
                        title: chapterTitle,
                        datePublished: chapterPublishedDate,
                        slug: chapterSlug
                    },
                    links: {
                        sourceUrl: chapterUrl,
                        seriesUrl: i.url
                    },
                    relationships: {
                        seriesTitle: seriesTitle,
                        seriesSlug: seriesSlug,
                        seriesId: mangaID
                    }
                })
            })
        }, undefined)
    }
    catch (error) {
        console.error(error)
    }
}

// Get the data now!
getAllMangaDataFromUrl()

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        hi: 'Welcome to Manga Scrapper API v2',
        availableEndpoints: {
            getAllMangaList: '/series',
            getSpecificMangaChapterList: '/series/{seriesSlug}/chapter',
            getSpecificChapterContentData: '/series/{seriesSlug}/chapter/{chapterSlug}'
        }
    })
})

// No content for favicon request
app.get('/favicon.ico', (req, res) => res.status(204))

// All manga series endpoint
app.get('/series', async (req, res) => {
    allMangaData.forEach(item => {
        item.links.self = `${req.protocol}://${req.get('host')}/series/${item.attributes.slug}`
    })
    await res.json(allMangaData)
})

// Redirect series request with trailing slash
app.get('/series/', (req, res) => {
    res.redirect(301, '/series')
})

// Specific manga endpoint
app.get('/series/:seriesSlug', async (req, res) => {
    const seriesSlug = req.params.seriesSlug

    try {
        // Check whether the requested seriesSlug exist or not
        const seriesSlugCheck = await allMangaData.filter(manga => manga.attributes.slug == seriesSlug)
        if (seriesSlugCheck.length === 0) {return res.status(404).json({error: "Requested Manga Not Found"})}

        // Getting the relevant data for requested manga
        const specificMangaChaptersData = await allChapterData.filter(manga => manga.relationships.seriesSlug == seriesSlug)
        await res.json(specificMangaChaptersData)
    }
    catch (error) {
        console.error(error)
        return res.status(500).json({
            error: "Something went wrong"
        })
    }
})

// Specific chapter endpoint
app.get('/series/:seriesSlug/chapter/:chapterSlug', async (req, res) => {
    const seriesSlug = req.params.seriesSlug
    const chapterSlug = req.params.chapterSlug

    try {
        // Check whether the requested seriesSlug exist or not
        const seriesSlugCheck = await allMangaData.filter(manga => manga.attributes.slug == seriesSlug)
        if (seriesSlugCheck.length === 0) {return res.status(404).json({error: "Requested Manga Not Found"})}

        // Getting the relevant data for requested manga
        const specificMangaChaptersData = await allChapterData.filter(manga => manga.relationships.seriesSlug == seriesSlug)

        // Check whether the requested chapterSlug exist or not
        const chapterSlugCheck = await specificMangaChaptersData.filter(chapter => chapter.id == chapterSlug)
        if (chapterSlugCheck.length === 0) {return res.status(404).json({error: "Requested Chapter Not Found"})}

        // Getting the relevant data for requested chapter
        const specificChapterData = await specificMangaChaptersData.filter(chapter => chapter.id == chapterSlug)
        await res.json(specificChapterData)
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
app.get('/myfavorites', async (req, res) => {
    const favoriteSeriesData = []

    // Fetch manga data from favorite list
    try {
        favoriteSeriesSlug.forEach(favorite => {
            const favoriteSeries = await allMangaData.filter(manga => manga.attributes.slug == favorite)[0]
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

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))