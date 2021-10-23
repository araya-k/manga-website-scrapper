const PORT = process.env.PORT || 8000
const cheerio = require('cheerio')
const express = require('express')
const cloudscraper = require('cloudscraper')
const app = express()

// list of websites to download manga - for now it's only one XD
const mangaWebsites = [
    {
        name: 'asurascans',
        address: 'https://www.asurascans.com/manga/list-mode'
    }
]

const mangaSeries = []

mangaWebsites.forEach(mangaWebsite => {
    cloudscraper.get(mangaWebsite.address)
        .then(response => {
            const html = response
            const $ = cheerio.load(html)

            // get every manga's title and url from website
            $('a.series', 'div.soralist', html).each(function () {
                const title = $(this).text()
                const url = $(this).attr('href')

                // store the manga data to array
                mangaSeries.push({
                    title,
                    source: url
                })
            })
        }).catch(err => console.log(err))
})

// home page shows the list of available manga and its data
app.get('/', (req, res) => {
    mangaSeries.forEach(manga => {
        manga.chapterList = `${req.protocol}://${req.get('host')}/${encodeURIComponent(manga.title)}`
    })

    res.json(mangaSeries)

})

// specific manga page to show its chapter list
app.get('/:mangaId', (req, res) => {
    const mangaId = req.params.mangaId
    const mangaAdd = mangaSeries.filter(manga => manga.title == mangaId)[0].source
    const mangaChapters = []

    cloudscraper.get(mangaAdd)
        .then(response => {
            const html = response
            const $ = cheerio.load(html)

            // get every chapter's title and url from website
            $('a', 'div.eplister', html).each(function () {
                const title = $('span.chapternum', this).text()
                const url = $(this).attr('href')

                // store the chapter data to array
                mangaChapters.push({
                    title,
                    source: url,
                    imageList: `${req.protocol}://${req.get('host')}${req.originalUrl}/${encodeURIComponent(title)}`
                })
            })
            res.json(mangaChapters)
        }).catch(err => console.log(err))
})

// specific chapter page to show its content (chapter images)
app.get('/:mangaId/:chapterId', (req, res) => {
    const mangaId = req.params.mangaId
    const mangaAdd = mangaSeries.filter(manga => manga.title == mangaId)[0].source
    const mangaChapters = []

    cloudscraper.get(mangaAdd)
        .then(response => {
            const html = response
            const $ = cheerio.load(html)

            // get every chapter's title and url from website
            $('a', 'div.eplister', html).each(function () {
                const title = $('span.chapternum', this).text()
                const url = $(this).attr('href')

                // store the chapter data to array
                mangaChapters.push({
                    title,
                    source: url,
                    imageList: `${req.protocol}://${req.get('host')}${req.originalUrl}/${encodeURIComponent(title)}`
                })
            })
            const chapterId = req.params.chapterId
            const chapterAddress = mangaChapters.filter(chapter => chapter.title == chapterId)[0].source
            const chapterImages = []

            cloudscraper.get(chapterAddress)
                .then(response => {
                    const html = response
                    const $ = cheerio.load(html)

                    // get all chapter's images from website
                    $('img', 'div#readerarea', html).each(function () {
                        const url = $(this).attr('src')

                        // store the data to array
                        chapterImages.push(url)
                    })
                    res.json(chapterImages.slice(1,-1))
                }).catch(err => console.log(err))
        }).catch(err => console.log(err))
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))