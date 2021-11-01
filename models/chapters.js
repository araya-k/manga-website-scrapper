const mongoose = require('mongoose')
const moment = require('moment')
const Schema = mongoose.Schema

// create chapter schema & model
const ChaptersSchema = new Schema({
    type: {
        type: String,
        required: true,
        lowercase: true
    },
    id: {
        type: String
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
        slug: {
            type: String,
            required: true,
            lowercase: true
        },
        datePublished: {
            type: String
        }
    },
    links: {
        sourceUrl: {
            type: String,
            required: true
        },
        seriesUrl: {
            type: String,
            required: true
        },
        self: {
            type: String,
            required: true
        }
    },
    relationships: {
        seriesTitle: {
            type: String,
            required: true
        },
        seriesId: {
            type: String,
            required: true
        },
        seriesSlug: {
            type: String,
            required: true
        }
    },
    content: {
        type: Array
    }
})

const Chapters = mongoose.model('Chapters', ChaptersSchema)

module.exports = Chapters