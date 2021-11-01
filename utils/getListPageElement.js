const cheerio = require('cheerio')

module.exports = {
    cheerioLoadHtml: async (html) => {
        const $ = await cheerio.load(html)
        const elementData = []
        $('a.series', 'div.soralist', html).each(function () {
            const listTitle = $(this).text().trim() + ""
            const listSourceUrl = $(this).attr('href')
            const listSlug = listSourceUrl.split('/').slice(-2).shift()
            elementData.push({
                listTitle,
                listSourceUrl,
                listSlug
            })
        })
        return elementData
    }
}

