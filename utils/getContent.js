const getWebPage = require("./getWebPage")
const cheerio = require("cheerio")

module.exports = {
    getAllImagesUrl: async (specificChapterUrl) => {
        console.log(`Getting web page element from ${specificChapterUrl}`)
        const htmlAllChapterContentPage = await getWebPage.getAllPageElements(specificChapterUrl)
        const $ = await cheerio.load(htmlAllChapterContentPage)

        const allImagesUrl = []

        // Get every image's url from website
        $('img', 'div#readerarea', htmlAllChapterContentPage).each(function () {
            const url = $(this).attr('src')

            // Store the data to array
            allImagesUrl.push(url)
        })
        return allImagesUrl.slice(1, -1)
    }
}