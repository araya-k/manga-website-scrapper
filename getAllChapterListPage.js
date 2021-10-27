const cloudscraper = require('cloudscraper')

module.exports = {
    getChapterPageElements: (mangaURL) => cloudscraper({
        method: 'GET',
        url: mangaURL
    })
}