const Series = require('../models/series')

module.exports = {
    findTheSeries: async (req, res, next) => {
        let theSeries
        try {
            theSeries = await Series.find({ 'seriesSlug': req.params.slug }, { '_id': 0, '__v': 0 })
            if (theSeries.length === 0) {
                return res.status(404).json({ message: 'Cannot find the series' })
            }
        }
        catch (err) {
            return res.status(500).json({ message: err.message })
        }
        res.series = theSeries
        next()
    }
}