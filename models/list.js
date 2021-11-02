// Imports required modules
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Create Chapters schema and model
const ListSchema = new Schema(
    {
        id: Number,
        title: String,
        slug: String,
        series: String,
        url: String
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

// Exports module
const List = mongoose.model('List', ListSchema)
module.exports = List