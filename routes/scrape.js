const express = require('express')
const router = express.Router()
const List = require('../models/list')
const Series = require('../models/series')
const Chapters = require('../models/chapters')
const getWebPage = require('../utils/getWebPage')
const getListPageElement = require('../utils/getListPageElement')
const getSeriesPageElement = require('../utils/getSeriesPageElement')
const getChapterPageElement = require('../utils/getChapterPageElement')
const getContentPageElement = require('../utils/getContentPageElement')

// Endpoint to scrape the list of series which are available in Asura Scans website
router.post('/list', async (req, res) => {
    const mangaListAddress = 'https://www.asurascans.com/manga/list-mode/'
    const excludeList = [
        'https://www.asurascans.com/comics/hero-has-returned/',
        'https://www.asurascans.com/comics/join-our-discord/'
    ]
    try {
        console.log(`Getting web page element from ${mangaListAddress}`)
        const htmlMangaListPage = await getWebPage.getAllPageElements(mangaListAddress)
        const elementData = await getListPageElement.cheerioLoadHtml(htmlMangaListPage)
        let id = 0

        const scrapeResult = []
        for await (const item of elementData) {
            if (excludeList.includes(item.listSourceUrl)) {
                console.log(`'${item.listTitle}' will not be saved to the database`)
                continue
            }
            if (item.listTitle === "") {
                console.log(`'${item.listSlug}' was missing parts, it will not be saved to the database`)
                continue
            }
            const listData = {
                id: id += 1,
                title: item.listTitle,
                slug: item.listSlug,
                series: `/series/${item.listSlug}`,
                url: item.listSourceUrl
            }
            const entry = new List(listData)
            const newList = await entry.save()
            scrapeResult.push(newList)
            console.log(`'${item.listTitle}' has been saved to the database`)
        }
        await res.status(201).json(scrapeResult)
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Endpoint to scrape all series data from the list available in the database
router.post('/series', async (req, res) => {
    const listCount = await List.count()
    const seriesCount = await Series.count()
    if (listCount === seriesCount) {
        res.status(403).json({ message: 'Series data is already up to date with the list from the database.' })
    }
    try {
        const scrapeResult = []
        const seriesList = await List.find()
        for await (const item of seriesList) {
            const seriesData = {
                seriesId: item.id,
                seriesTitle: item.title,
                synopsis: undefined,
                coverImage: undefined,
                genre: undefined,
                seriesSlug: item.slug,
                selfUrl: item.series,
                chaptersUrl: `${item.series}/chapter`,
                sourceUrl: item.url
            }

            console.log(`Getting web page element of ${item.title} from '${item.url}'`)
            const html = await getWebPage.getAllPageElements(item.url)
            const elementData = await getSeriesPageElement.cheerioLoadHtml(html)

            seriesData.coverImage = elementData[0].thumbnail
            seriesData.synopsis = elementData[0].synopsis
            seriesData.genre = elementData[0].mangaGenre

            const entry = new Series(seriesData)
            const newSeries = await entry.save()
            scrapeResult.push(newSeries)
            console.log(`Series data of ${item.title} has been saved to the database`)

            const elementChaptersData = await getChapterPageElement.cheerioLoadHtml(item.slug, html)
            for await (const chapter of elementChaptersData) {
                const chapterData = {
                    chapterPublishedDate: chapter.chapterPublishedDate,
                    chapterTitle: chapter.chapterTitle,
                    chapterSlug: chapter.chapterSlug,
                    selfUrl: `${item.series}/chapter/${chapter.chapterSlug}`,
                    sourceUrl: chapter.chapterUrl,
                    seriesId: item.id,
                    seriesTitle: item.title,
                    seriesSlug: item.slug,
                    seriesUrl: item.series
                }

                const chapterEntry = new Chapters(chapterData)
                const newChapter = await chapterEntry.save()
                console.log(`Chapter data of ${chapter.chapterTitle} has been saved to the database:\n${newChapter}`)
            }
        }
        await res.status(201).json(scrapeResult)
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Endpoint to scrape all chapters' image data of a specific series
router.post('/series/:slug/chapters', async (req, res) => {
    try {
        const theChapters = await Chapters.find({ 'seriesSlug': req.params.slug })
        if (theChapters.length === 0) {
            return res.status(404).json({ message: 'Chapter data is not available. Please scrape it first' })
        }
        const scrapeResult = []
        for await (const chapter of theChapters) {
            console.log(`Getting web page element of ${chapter.seriesTitle} - ${chapter.chapterTitle} from '${chapter.sourceUrl}'`)
            const html = await getWebPage.getAllPageElements(chapter.sourceUrl)
            const elementData = await getContentPageElement.cheerioLoadHtml(html)

            chapter.imagesUrl = elementData
            console.log(chapter)
            const updatedImagesUrl = await chapter.save()
            scrapeResult.push(updatedImagesUrl)
            console.log(`Chapter data of ${chapter.chapterTitle} in the database has been updated:\n${updatedImagesUrl}`)
        }
        await res.status(201).json(scrapeResult)
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

/*// Endpoint to patch the chapters data of a specific series
router.patch('/series/:slug', findSpecificSeries.findTheSeries, async (req, res) => {
    const seriesSlug = req.params.slug

    List.findOne({
        'attributes.slug': seriesSlug
    })
    .then(async data => {
        const seriesUrl = data.links.sourceUrl
        const seriesId = data.id
        const seriesTitle = data.attributes.title

        const seriesResult = {
            type: 'series',
            id: seriesId,
            attributes: {
                title: seriesTitle,
                slug: seriesSlug,
            },
            links: {
                sourceUrl: seriesUrl,
                chapterUrl: `${req.protocol}://${req.get('host')}/series/${seriesSlug}/chapter`,
                self: `${req.protocol}://${req.get('host')}/series/${seriesSlug}`
            }
        }

        console.log(`Getting web page element of '${seriesTitle}' from '${seriesUrl}'`)
        const htmlSpecificMangaPage = await getWebPage.getAllPageElements(seriesUrl)
        const elementData = await getSeriesPageElement.cheerioLoadHtml(htmlSpecificMangaPage)

        seriesResult.attributes.synopsis = elementData.seriesSynopsis
        seriesResult.attributes.genre = elementData.mangaGenre
        seriesResult.links.thumbnailUrl = elementData.seriesThumbnailUrl

        const seriesEntry = new Series (seriesResult)
        seriesEntry.save().then(() => {
            res.redirect(`../series/${seriesSlug}`)
        })
    })
    .catch(error => {
        console.log(error)
        return res.status(500).json({
            error: 'Something went wrong'
        })
    })
})

// Endpoint to patch the images data of a specific chapter
router.patch('/series/:slug/chapter/:id', async (req, res) => {
    const seriesSlug = req.params.slug
    const chapterId = req.params.id

    Chapters.findOne({
        $and: [
            {'id': chapterId},
            {'relationship.seriesSlug':seriesSlug}
        ]
    })
    .then(async data => {
        const chapterUrl = data.links.sourceUrl

        console.log(`Getting web page element of '${seriesSlug}-chapter-${chapterId}' from '${chapterUrl}'`)
        const htmlSpecificChapterPage = await getWebPage.getAllPageElements(chapterUrl)
        const elementData = await getContentPageElement.cheerioLoadHtml(htmlSpecificChapterPage)

        await Chapters.findOneAndUpdate({
            $and: [
                {'id': chapterId},
                {'relationship.seriesSlug':seriesSlug}
            ]
        }, {$set: {'content': elementData}})
        await res.redirect(`../series/${seriesSlug}/chapter/${chapterId}`)
    })
    .catch(error => {
        console.log(error)
        return res.status(500).json({
            error: 'Something went wrong'
        })
    })
})*/

module.exports = router