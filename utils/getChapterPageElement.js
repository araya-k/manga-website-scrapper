const cheerio = require('cheerio')

module.exports = {
    cheerioLoadHtml: async (seriesSlug, html) => {
        const $ = await cheerio.load(html)
        const elementData = []
        await $('a', 'div.eplister', html).each(function () {
            const chapterTitle = $('span.chapternum', this).text()
            const chapterPublishedDate = $('span.chapterdate', this).text()
            const chapterUrl = $(this).attr('href')
            const chapterSlug = chapterUrl.split('/').slice(-2).shift().replace(`${seriesSlug}-chapter-`, '')
            elementData.push({
                chapterTitle,
                chapterPublishedDate,
                chapterUrl,
                chapterSlug
            })
        })
        return elementData
    }
}

