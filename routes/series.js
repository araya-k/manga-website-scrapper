const express = require('express')
const router = express.Router()
const List = require('../models/list')
const Series = require('../models/series')
const Chapters = require('../models/chapters')
const findSpecificSeries = require('../utils/findSpecificSeries')
const findSpecificChapter = require('../utils/findSpecificChapter')

// Endpoint to fetch all available series data from the database
router.get('/', async (req, res) => {
    try {
        const series = await Series.find({}, { '_id': 0, '__v': 0 }).sort({ id: 1 })
        if (series.length === 0) {
            return res.status(404).json({ message: 'Series data is not available. Please scrape it first' })
        }
        res.json(series)
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Endpoint to fetch list of available series from the database
router.get('/list', async (req,res) => {
    try {
        const seriesList = await List.find({}, { '_id': 0, '__v': 0 }).sort({id: 1})
        if (seriesList.length === 0) {
            return res.status(404).json({ message: 'List data is not available. Please scrape it first' })
        }
        res.json(seriesList)
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Endpoint to fetch a specific series data from the database
router.get('/:slug', findSpecificSeries.findTheSeries, (req, res) => {
    res.json(res.series)
})

// Endpoint to fetch chapters data of a specific series from the database
router.get('/:slug/chapters', findSpecificSeries.findTheSeries, async (req, res) => {
    try {
        const theChapters = await Chapters.find({ 'seriesSlug': req.params.slug }, { '_id': 0, '__v': 0 })
        if (theChapters.length === 0) {
            return res.status(404).json({ message: 'Chapter data is not available. Please scrape it first' })
        }
        res.json(theChapters)
    }
    catch (err) {
        res.status(500).json({ message: err.message })
    }
})

// Endpoint to fetch a specific chapter data from the database
router.get('/:slug/chapter/:id', findSpecificChapter.findTheChapter, (req, res) => {
    res.json(res.chapter)
})

module.exports = router