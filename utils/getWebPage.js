const cloudscraper = require('cloudscraper')

module.exports = {
    getAllPageElements: (requestedURL) => cloudscraper({
        method: 'GET',
        url: requestedURL
    })
}