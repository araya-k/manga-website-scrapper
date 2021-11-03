const express = require('express')
const router = express.Router()
const List = require('../models/list')
const Series = require('../models/series')
const Chapters = require('../models/chapters')
const findSpecificSeries = require('../utils/findSpecificSeries')
const findSpecificChapter = require('../utils/findSpecificChapter')
const paginatedSeriesRequest = require('../utils/paginatedSeriesRequest')
const paginatedChaptersRequest = require('../utils/paginatedChaptersRequest')

// Endpoint to fetch all available series data (or paginated) from the database
router.get('/', paginatedSeriesRequest.paginatedResult(Series), (req, res) => {
    res.json(res.result)
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

// Endpoint to fetch all chapters data of a specific series (or paginated) from the database
router.get('/:slug/chapters', paginatedChaptersRequest.paginatedResult(Chapters), (req, res) => {
    res.json(res.result)
})

// Endpoint to fetch a specific chapter data from the database
router.get('/:slug/chapter/:id', findSpecificChapter.findTheChapter, (req, res) => {
    res.json(res.chapter)
})

// Endpoint to fetch data of my favorite series (or paginated) from database
router.get('/favorite', async (req, res) => {
    try {
        const favoriteSeriesSlug = [
            'auto-hunting',
            'doctors-rebirth',
            'i-the-strongest-demon-have-regained-my-youth',
            'im-the-only-one-loved-by-the-constellations',
            'legend-of-asura-the-venom-dragon',
            'limit-breaker',
            'max-level-returner',
            'player-who-cant-level-up',
            'reformation-of-the-deadbeat-noble',
            'regressor-instruction-manual',
            'reincarnation-of-the-suicidal-battle-god',
            'return-of-the-8th-class-magician',
            'return-of-the-unrivaled-spear-knight',
            'rise-from-the-rubble',
            'seoul-stations-necromancer',
            'solo-bug-player',
            'solo-leveling',
            'solo-max-level-newbie',
            'solo-spell-caster',
            'sss-class-gacha-hunter',
            'sss-class-suicide-hunter',
            'starting-today-im-a-player',
            'the-constellation-that-returned-from-hell',
            'the-dark-magician-transmigrates-after-66666-years',
            'the-game-that-i-came-from',
            'the-immortal-emperor-luo-wuji-has-returned',
            'the-king-of-bug',
            'the-lords-coins-arent-decreasing',
            'the-max-level-hero-has-returned',
            'the-second-coming-of-gluttony',
            'the-tutorial-is-too-hard',
            'the-tutorial-tower-of-the-advanced-player',
            'villain-to-kill',
            'worn-and-torn-newbie',
            'your-talent-is-mine'
        ]
        const seriesData = []
        for await (const item of favoriteSeriesSlug) {
            const theSeries = await Series.find({ 'seriesSlug': item }, { '_id': 0, '__v': 0 })
            if (theSeries.length === 0) {
                console.log(`Cannot fetch data for '${item}' from the database`)
                continue
            }
            seriesData.push(theSeries[0])
        }
        await res.json(seriesData)
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

module.exports = router