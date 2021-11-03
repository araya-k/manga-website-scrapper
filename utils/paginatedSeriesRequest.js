module.exports = {
    paginatedResult: (model) => {
        return async (req, res, next) => {
            const page = parseInt(req.query.page)
            const limit = parseInt(req.query.limit)

            if (isNaN(page) && isNaN(limit)) {
                try {
                    const allResult = await model.find({}, { '_id': 0, '__v': 0 }).sort({ 'seriesId': 1 })
                    if (allResult.length === 0) {
                        return res.status(404).json({ message: 'Series data is not available. Please scrape it first' })
                    }
                    res.result = allResult
                    next()
                }
                catch (err) {
                    res.status(500).json({ message: err.message })
                }
            } else {
                const startIndex = (page - 1) * limit
                const endIndex = page * limit
                const paginatedResult = {
                    links: {},
                    results: {}
                }

                if (startIndex > 0) {
                    paginatedResult.links.previousPage = `${req.originalUrl.split('?').shift()}?page=${page - 1}&limit=${limit}`
                }
                if (endIndex < await model.count()) {
                    paginatedResult.links.nextPage = `${req.originalUrl.split('?').shift()}?page=${page + 1}&limit=${limit}`
                }

                try {
                    paginatedResult.results = await model.find({}, { '_id': 0, '__v': 0 }).sort({ 'seriesId': 1 }).limit(limit).skip(startIndex)
                    res.result = paginatedResult
                    next()
                }
                catch (err) {
                    res.status(500).json({ message: err.message })
                }
            }
        }
    }
}