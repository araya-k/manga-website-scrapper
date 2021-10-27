const cloudscraper = require('cloudscraper')

module.exports = {
    getContentPageElements: (chapterURL) => cloudscraper({
        method: 'GET',
        url: chapterURL
    })
}