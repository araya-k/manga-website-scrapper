const mongoose = require('mongoose')
const moment = require('moment')
const Schema = mongoose.Schema

// create chapter schema & model
const ListSchema = new Schema({
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
        slug: {
            type: String,
            required: true,
            lowercase: true
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
        }
    }
})

const List = mongoose.model('List', ListSchema)

module.exports = List