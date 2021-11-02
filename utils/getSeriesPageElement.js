const cheerio = require('cheerio')

module.exports = {
    cheerioLoadHtml: async (html) => {
        const $ = await cheerio.load(html)
        const elementData = []
        const mangaGenre = []

        const thumbnail = $('img', 'div.thumb', html).attr('src')
        const synopsis = $('p', 'div.entry-content', html).text()
        $('a', 'span.mgen', html).each(function () {
            const genreTitle = $(this).text()
            mangaGenre.push(genreTitle)
        })
        elementData.push({
            thumbnail,
            synopsis,
            mangaGenre
        })
        return elementData
    }
}

