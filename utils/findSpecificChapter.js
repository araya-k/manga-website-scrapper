const Chapters = require('../models/chapters')

module.exports = {
    findTheChapter: async (req, res, next) => {
        let theChapter
        try {
            theChapter = await Chapters.find({
                $and: [
                    { 'seriesSlug': req.params.slug },
                    { 'chapterSlug': req.params.id }
                ]
            }, { '_id': 0, '__v': 0 })
            if (theChapter.length === 0) {
                return res.status(404).json({ message: 'Cannot find the chapter' })
            }
        }
        catch (err) {
            return res.status(500).json({ message: err.message })
        }
        res.chapter = theChapter
        next()
    }
}