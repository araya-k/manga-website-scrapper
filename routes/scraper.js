const express = require('express')
const router = express.Router()
const cheerio = require('cheerio')
const List = require('../models/list')
const Series = require('../models/series')
const Chapters = require('../models/chapters')
const getWebPage = require('../utils/getWebPage')
const getListPageElement = require('../utils/getListPageElement')
const getChapterPageElement = require('../utils/getChapterPageElement')
const getContentPageElement = require('../utils/getContentPageElement')

router.get('/', (req, res) => {
    res.json({
        hi: 'Welcome to Manga Scrapper API v2',
        availableEndpoints: {
            getAllMangaList: '/series',
            getSpecificMangaData: '/series/{seriesSlug}',
            getSpecificMangaChapterList: '/series/{seriesSlug}/chapter',
            getSpecificChapterContentData: '/series/{seriesSlug}/chapter/{chapterSlug}'
        }
    })
})

router.get('/favicon.ico', (req, res) => res.status(204))

// get a list of manga from the database
router.get('/list', function(req,res,next){
    List.find().sort({id: 1})
        .then(function(list){
            res.json(list)
        }).catch(next)
})

// get manga data list from the database
router.get('/series', function(req, res, next){
    Series.find({}, {'chapters':0}).sort({id: 1})
        .then(function(series){
            res.json(series)
        }).catch(next)
})

// get a manga data from the database
router.get('/series/:seriesSlug', (req, res) => {
    const seriesSlug = req.params.seriesSlug
    Series.findOne({'attributes.slug': seriesSlug}, {'chapters': 0})
    .then(function(series){
        if (!series) return res.status(404).json(`Data for '${seriesSlug}' does not exist in the database`)
        res.json(series)
    })
    .catch(error => {
        console.log(error)
        return res.status(500).json({
            error: "Something went wrong"
        })
    })
})

// get a manga chapter data from the database
router.get('/series/:seriesSlug/chapter', (req, res) => {
    const seriesSlug = req.params.seriesSlug
    Chapters.find({'relationships.seriesSlug': seriesSlug}, {'content':0}).sort({id: 1})
    .then(function(chapters){
        if (chapters.length === 0) return res.status(404).json(`Data for '${seriesSlug}' does not exist in the database`)
        res.json(chapters)
    })
    .catch(error => {
        console.log(error)
        return res.status(500).json({
            error: "Something went wrong"
        })
    })
})

// get a chapter data from the database
router.get('/series/:seriesSlug/chapter/:chapterId', (req, res) => {
    const seriesSlug = req.params.seriesSlug
    const chapterId = req.params.chapterId
    Chapters.findOne({
        $and: [
            {'relationships.seriesSlug': seriesSlug},
            {'id': chapterId}
        ]
    })
    .then(function(chapter){
        if (!chapter) return res.status(404).json(`Chapter ${chapterId} does not exist in the database`)
        res.json(chapter)
    })
    .catch(error => {
        console.log(error)
        return res.status(500).json({
            error: "Something went wrong"
        })
    })
})

router.post('/scrape/list', async (req, res) => {
    const mangaListAddress = 'https://www.asurascans.com/manga/list-mode/'
    console.log(`Getting web page element from ${mangaListAddress}`)

    const htmlMangaListPage = await getWebPage.getAllPageElements(mangaListAddress)
    const elementData = await getListPageElement.cheerioLoadHtml(htmlMangaListPage)
    let id = 0

    const excludeList = [
        'https://www.asurascans.com/comics/hero-has-returned/',
        'https://www.asurascans.com/comics/join-our-discord/'
    ]

    for (const item of elementData) {
        if (excludeList.includes(item.listSourceUrl)) {
            console.log(`'${item.listSourceUrl}' will not be saved to the database`)
            continue
        }
        if (item.listTitle === "") {
            console.log(`'${item.listSlug}' was missing parts, it will not be saved to the database`)
            continue
        }
        const listData = {
            type: 'list',
            id: id += 1,
            attributes: {
                title: item.listTitle,
                slug: item.listSlug
            },
            links: {
                sourceUrl: item.listSourceUrl,
                seriesUrl: `${req.protocol}://${req.get('host')}/series/${item.listSlug}`
            }
        }

        const listEntry = new List(listData)
        listEntry.save().then(() => {
            console.log(`Data list for ${item.listSlug} is being updated in the database`)
        })
    }
    await res.redirect('/list')
})

router.post('/scrape/series', async (req, res) => {
    const seriesSlug = req.body.slug
    const seriesSlugCheck = await Series.count({'attributes.slug': seriesSlug})
    if (seriesSlugCheck) return res.json(`Data for '${seriesSlug}' already exist in the database`)

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

        const mangaGenre = []

        console.log(`Getting web page element of '${seriesTitle}' from '${seriesUrl}'`)
        const htmlSpecificMangaPage = await getWebPage.getAllPageElements(seriesUrl)
        const $ = await cheerio.load(htmlSpecificMangaPage)

        const seriesThumbnailUrl = $('img', 'div.thumb', htmlSpecificMangaPage).attr('src')
        const seriesSynopsis = $('p', 'div.entry-content', htmlSpecificMangaPage).text()
        $('a', 'span.mgen', htmlSpecificMangaPage).each(function () {
            const genreTitle = $(this).text()
            mangaGenre.push(genreTitle)
        })

        seriesResult.attributes.synopsis = seriesSynopsis
        seriesResult.attributes.genre = mangaGenre
        seriesResult.links.thumbnailUrl = seriesThumbnailUrl

        const seriesEntry = new Series (seriesResult)
        seriesEntry.save().then(() => {
            res.redirect(`/series/${seriesSlug}`)
        })
    })
    .catch(error => {
        console.log(error)
        return res.status(500).json({
            error: 'Something went wrong'
        })
    })
})

router.post('/scrape/chapter', async (req, res) => {
    const seriesSlug = req.body.slug
    const seriesSlugCheck = await Series.findOne({'attributes.slug': seriesSlug})
    if (!seriesSlugCheck) return res.status(404).json(`Data for '${seriesSlug}' does not exist in the database`)

    List.findOne({
        'attributes.slug': seriesSlug
    })
    .then(async data => {
        const seriesUrl = data.links.sourceUrl
        const seriesId = data.id
        const seriesTitle = data.attributes.title

        console.log(`Getting web page element of '${seriesSlug}' from '${seriesUrl}'`)
        const htmlSpecificMangaPage = await getWebPage.getAllPageElements(seriesUrl)
        const elementData = await getChapterPageElement.cheerioLoadHtml(seriesSlug, htmlSpecificMangaPage)

        for (const item of elementData) {
            const chapterCheck = await Chapters.findOne({
                $and: [
                    {'relationships.seriesTitle': seriesTitle},
                    {'attributes.title': item.chapterTitle}
                ]
            })
            if (chapterCheck) {
                console.log(`Data for '${item.chapterTitle}' already exist in database`)
                continue
            }
            console.log(`Saving chapter data for '${item.chapterTitle}' of '${seriesTitle}'to the database`)
            const chapterData = {
                type: 'chapters',
                id: item.chapterId,
                attributes: {
                    title: item.chapterTitle,
                    slug: item.chapterSlug,
                    datePublished: item.chapterPublishedDate
                },
                links: {
                    sourceUrl: item.chapterUrl,
                    seriesUrl: seriesUrl,
                    self: `${req.protocol}://${req.get('host')}/series/${seriesSlug}/${item.chapterSlug}`
                },
                relationships: {
                    seriesTitle: seriesTitle,
                    seriesSlug: seriesSlug,
                    seriesId: seriesId
                }
            }
            const chapterEntry = new Chapters(chapterData)
            chapterEntry.save().then(async doc => {
                try {
                    await Series.findOneAndUpdate({'attributes.slug': seriesSlug}, {$push: {'chapters': doc}}, {new: true})
                }
                catch (error) {
                    console.error(error)
                }
            })
        }
        await res.redirect(`/series/${seriesSlug}/chapter`)
    })
    .catch(error => {
        console.log(error)
        return res.status(500).json({
            error: 'Something went wrong'
        })
    })
})

router.post('/scrape/content', async (req, res) => {
    const seriesSlug = req.body.slug
    const chapterId = req.body.id

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
        await res.redirect(`/series/${seriesSlug}/chapter/${chapterId}`)
    })
    .catch(error => {
        console.log(error)
        return res.status(500).json({
            error: 'Something went wrong'
        })
    })
})

module.exports = router