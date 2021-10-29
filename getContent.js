const getWebPage = require("./getWebPage")
const cheerio = require("cheerio")

module.exports = {
    getAllImagesUrl: async (specificChapterUrl) => {
        const htmlAllChapterContentPage = await getWebPage.getAllPageElements(specificChapterUrl)
        const $ = await cheerio.load(htmlAllChapterContentPage)
        const allImagesUrl = []

        // Get every image's url from website
        await $('img', 'div#readerarea', htmlAllChapterContentPage).each(async function () {
            const url = await $(this).attr('src')
            // Store the data to array
            allImagesUrl.push(url)
        })
        const pureImagesUrl = allImagesUrl.slice(1,-1)
        return pureImagesUrl
    }
}