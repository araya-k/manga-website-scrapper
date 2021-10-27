const cloudscraper = require('cloudscraper')

const BASE_URL = 'https://www.asurascans.com/manga/list-mode/'

module.exports = {
    getAllElements: () => cloudscraper({
        method: 'GET',
        url: BASE_URL
    })
}