// Imports required modules
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Create Series schema and model
const SeriesSchema = new Schema(
    {
        seriesId: Number,
        seriesTitle: String,
        seriesSlug: String,
        coverImage: String,
        synopsis: String,
        genre: [String],
        selfUrl: String,
        chaptersUrl: String,
        sourceUrl: String
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

// Exports module
const Series = mongoose.model('Series', SeriesSchema)
module.exports = Series