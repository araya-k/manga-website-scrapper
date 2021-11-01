const mongoose = require('mongoose')
const moment = require('moment')
const Schema = mongoose.Schema

// create series schema & model
const SeriesSchema = new Schema({
    type: {
        type: String,
        required: true,
        lowercase: true
    },
    id: {
        type: Number
    },
    updated: {
        type: String,
        default: moment().format('MMMM Do YYYY, h:mm A')
    },
    attributes: {
        title: {
            type: String,
            required: true
        },
        synopsis: {
            type: String
        },
        slug: {
            type: String,
            required: true,
            lowercase: true
        },
        genre: [{
            type: String
        }]
    },
    links: {
        sourceUrl: {
            type: String,
            required: true
        },
        thumbnailUrl: {
            type: String
        },
        compressedThumbnailUrl: {
            type: String
        },
        chapterUrl: {
            type: String,
            required: true
        },
        self: {
            type: String,
            required: true
        }
    },
    chapters: {
        type: Schema.Types.Array,
        ref: 'Chapters'
    }
})

const Series = mongoose.model('Series', SeriesSchema)

module.exports = Series