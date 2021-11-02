const cheerio = require('cheerio')

module.exports = {
    cheerioLoadHtml: async (html) => {
        const $ = await cheerio.load(html)
        const elementData = []
        await $('img', 'div#readerarea', html).each(function () {
            const url = $(this).attr('src')
            elementData.push(url)
        })
        return elementData.slice(1, -1)
    }
}

