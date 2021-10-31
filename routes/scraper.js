const express = require('express')
const router = express.Router()
const cheerio = require('cheerio')
const List = require('../models/list')
const Series = require('../models/series')
const getWebPage = require("../utils/getWebPage")

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
router.get('/manga-list', function(req,res,next){
    List.find().sort({id: 1})
        .then(function(list){
            res.json(list)
        }).catch(next)
})

// get a manga data from the database
router.get('/series/:seriesSlug', function(req,res,next){
    const seriesSlug = req.params.seriesSlug
    Series.findOne({ 'attributes.slug': seriesSlug })
        .then(function(series){
            res.json(series)
        }).catch(next)
})

router.get('/scrape/manga-list', async (req, res) => {
    const mangaListAddress = 'https://www.asurascans.com/manga/list-mode/'
    console.log(`Getting web page element from ${mangaListAddress}`)

    const htmlMangaListPage = await getWebPage.getAllPageElements(mangaListAddress)
    const $ = await cheerio.load(htmlMangaListPage)

    let id = 0
    $('a.series', 'div.soralist', htmlMangaListPage).each(function () {
        const result = {
            type: 'list',
            id: id += 1,
            attributes: {},
            links: {}
        }
        const listTitle = $(this).text().trim() + ""
        const listSourceUrl = $(this).attr('href')
        const listSlug = listSourceUrl.split('/').slice(-2).shift()

        result.attributes.title = listTitle
        result.attributes.slug = listSlug
        result.links.sourceUrl = listSourceUrl
        result.links.seriesUrl = `${req.protocol}://${req.get('host')}/series/${listSlug}`

        const excludeList = [
            'https://www.asurascans.com/comics/hero-has-returned/',
            'https://www.asurascans.com/comics/join-our-discord/'
        ]

        if (listTitle !== "" && listSourceUrl !== excludeList.includes(listSourceUrl)) {
            List.count({ title: listTitle}, function (err, test) {
                if(test === 0) {
                    const entry = new List (result)
                    entry.save(function(err, doc) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(doc)
                        }
                    })
                } else {console.log(`${listTitle} already exist in database`)}
            })
        } else {console.log('The content was missing parts. Not saved to database.')}
    })
    await res.redirect('/manga-list')
})

router.get('/scrape/series/:seriesSlug', async (req, res) => {
    const seriesSlug = req.params.seriesSlug

    List.count({ 'attributes.slug': seriesSlug }, function (err, test) {
        if (test !== 0) {
            List.findOne({ 'attributes.slug': seriesSlug }, async function (err, data){
                if (err) return console.error(err)
                const seriesUrl = data.links.sourceUrl
                const seriesId = data.id
                const seriesTitle = data.attributes.title

                console.log(`Getting web page element of '${seriesTitle}' from '${seriesUrl}'`)

                const seriesResult = {
                    type: 'series',
                    id: seriesId,
                    attributes: {
                        title: seriesTitle,
                        slug: seriesSlug,
                    },
                    links: {
                        sourceUrl: seriesUrl,
                        self: `${req.protocol}://${req.get('host')}/series/${seriesSlug}`
                    },
                    chapters: []
                }

                const mangaGenre = []

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

                /*const chaptersResult = {
                    type: 'chapters',
                    attributes: {},
                    links: {},
                    relationships: {
                        seriesTitle: seriesTitle,
                        seriesId: seriesId,
                        seriesSlug: seriesSlug
                    }
                }

                $('a', 'div.eplister', htmlSpecificMangaPage).each(function () {
                    const chapterTitle = $('span.chapternum', this).text()
                    const chapterPublishedDate = $('span.chapterdate', this).text()
                    const chapterUrl = $(this).attr('href')

                    const chapterId = chapterTitle.split(' ').reverse().slice(1).pop()
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
                            sourceUrl: chapterUrl
                        },
                        relationships: {
                            seriesTitle: mangaTitle,
                            seriesSlug: mangaSlug,
                            seriesId: id
                        }
                    })
                })*/
                const entry = new Series (seriesResult)
                entry.save(function(err, doc) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log(doc)
                    }
                })
            })
        } else {console.log(`Manga '${seriesSlug}' already exist in database`)}
    })
    await res.redirect(`/series/${seriesSlug}`)
})

module.exports = router