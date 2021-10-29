const getWebPage = require("./getWebPage")
const cheerio = require("cheerio")

module.exports = {
    getAllMangaData: async (specificMangaUrl) => {
        const id = specificMangaUrl.id
        const url = specificMangaUrl.links.url

        console.log(`Getting web page element from ${url}`)
        const htmlSpecificMangaPage = await getWebPage.getAllPageElements(url)
        const $ = await cheerio.load(htmlSpecificMangaPage)

        const specificMangaData = []
        const allChapterData = []
        const mangaGenre = []

        const mangaTitle = $('h1.entry-title', 'div.infox', htmlSpecificMangaPage).text()
        const mangaSlug = url.split('/').slice(-2).shift()
        const mangaThumbnailUrl = $('img', 'div.thumb', htmlSpecificMangaPage).attr('src')
        const mangaSynopsis = $('p', 'div.entry-content', htmlSpecificMangaPage).text()

        $('a', 'span.mgen', htmlSpecificMangaPage).each(function () {
            const genreTitle = $(this).text()
            mangaGenre.push(genreTitle)
        })

        $('a', 'div.eplister', htmlSpecificMangaPage).each(function () {
            const chapterTitle = $('span.chapternum', this).text()
            const chapterPublishedDate = $('span.chapterdate', this).text()
            const chapterUrl = $(this).attr('href')

            const chapterId = chapterTitle.split(' ').slice(1).join(' ')
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
        })

        specificMangaData.push({
            type: "series",
            id: id,
            attributes: {
                title: mangaTitle,
                slug: mangaSlug,
                synopsis: mangaSynopsis,
                genre: mangaGenre
            },
            links: {
                sourceUrl: url,
                thumbnailUrl: mangaThumbnailUrl
            },
            chapters: allChapterData
        })
        return specificMangaData
    }
}