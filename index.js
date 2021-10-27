// Import needed modules
const cheerio = require('cheerio')
const express = require('express')
const getMangaListPage = require('./getMangaListPage')
const getAllChapterListPage = require('./getAllChapterListPage')
const getChapterPage = require('./getChapterPage')

// Creates app
const app = express()

// Initializes application port
const PORT = process.env.PORT || 8000

// Creates variable to store data
const allManga = []

// Getting all manga list data
async function getAllManga() {
    const mangaListPageElement = await getMangaListPage.getAllElements()

    const $ = cheerio.load(mangaListPageElement)

    // get every manga's title and url from website
    $('a.series', 'div.soralist', mangaListPageElement).each(function () {
        const title = $(this).text()
        const url = $(this).attr('href')

        // store the manga data to array
        allManga.push({
            title,
            sourceURL: url,
            slug: url.split('/').reverse()[1]
        })
    })
}
getAllManga()

// home page shows the list of available manga
app.get('/', (req, res) => {
    return res.json(allManga)
})

// remove that favicon request which causing headache
app.get('/favicon.ico', (req, res) => res.status(204));

// specific manga page to show its chapter list
app.get('/:mangaId', async (req, res) => {
    const mangaId = req.params.mangaId

    try {
        // Check whether the requested mangaId exist or not
        const mangaIdCheck = allManga.filter(manga => manga.slug == mangaId)
        if (mangaIdCheck.length === 0) {return res.status(404).json({error: "Request Not Found"})}
        const mangaAddress = allManga.filter(manga => manga.slug == mangaId)[0].sourceURL
        const mangaChapters = []

        const mangaChapterPageElement = await getAllChapterListPage.getChapterPageElements(mangaAddress)

        const $ = cheerio.load(mangaChapterPageElement)

        // get every chapter's title and url from website
        $('a', 'div.eplister', mangaChapterPageElement).each(function () {
            const title = $('span.chapternum', this).text()
            const url = $(this).attr('href')

            // store the chapter data to array
            mangaChapters.push({
                title,
                sourceURL: url,
                slug: url.split('/').reverse()[1]
            })
        })
        res.json(mangaChapters)
    }
    catch(e) {
        console.log(e)

        return res.status(500).json({
            error: "Something went wrong"
        })
    }
})

// specific chapter page to show its content (chapter images)
app.get('/:mangaId/:chapterId', async (req, res) => {
    const mangaId = req.params.mangaId
    const chapterId = req.params.chapterId

    try {
        // Check whether the requested mangaId exist or not
        const mangaIdCheck = allManga.filter(manga => manga.slug == mangaId)
        if (mangaIdCheck.length === 0) {return res.status(404).json({error: "Request Not Found"})}
        const mangaAddress = allManga.filter(manga => manga.slug == mangaId)[0].sourceURL
        const mangaChapters = []

        const mangaChapterPageElement = await getAllChapterListPage.getChapterPageElements(mangaAddress)

        const $ = cheerio.load(mangaChapterPageElement)

        // get every chapter's title and url from website
        $('a', 'div.eplister', mangaChapterPageElement).each(function () {
            const title = $('span.chapternum', this).text()
            const url = $(this).attr('href')

            // store the chapter data to array
            mangaChapters.push({
                title,
                sourceURL: url,
                slug: url.split('/').reverse()[1]
            })
        })

        const chapterIdCheck = mangaChapters.filter(chapter => chapter.slug == chapterId)
        if (chapterIdCheck.length === 0) {return res.status(404).json({error: "Request Not Found"})}

        const chapterAddress = mangaChapters.filter(chapter => chapter.slug == chapterId)[0].sourceURL
        const chapterImages = []

        const specificChapterPageElement = await getChapterPage.getContentPageElements(chapterAddress)
        const $$ = cheerio.load(specificChapterPageElement)

        // get every chapter's title and url from website
        $$('img', 'div#readerarea', specificChapterPageElement).each(function () {
            const url = $$(this).attr('src')

            // store the data to array
            chapterImages.push(url)
        })
        res.json(chapterImages.slice(1,-1))
    }
    catch(e) {
        console.log(e)

        return res.status(500).json({
            error: "Something went wrong"
        })
    }
})

app.get('*', (req, res) => {
    res.redirect('/')
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))