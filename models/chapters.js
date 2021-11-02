// Imports required modules
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Create Chapters schema and model
const ChaptersSchema = new Schema(
    {
        chapterPublishedDate: String,
        chapterTitle: String,
        chapterSlug: String,
        selfUrl: String,
        sourceUrl: String,
        seriesId: String,
        seriesTitle: String,
        seriesSlug: String,
        seriesUrl: String,
        imagesUrl: [String],
        compressedImage: [String]
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

// Exports module
const Chapters = mongoose.model('Chapters', ChaptersSchema)
module.exports = Chapters