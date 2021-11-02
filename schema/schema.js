const schema = require('graphql')
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLSchema } = schema
const Series = require('../models/series')
const Chapters = require('../models/chapters');

const SeriesType = new GraphQLObjectType({
    name: 'Series',
    description: 'A series/comic which is published at Asura Scans website',
    fields: () => ({
        seriesId: { type: GraphQLInt },
        seriesTitle: { type: GraphQLString },
        seriesSlug: { type: GraphQLString },
        coverImage: { type: GraphQLString },
        synopsis: { type: GraphQLString },
        genre: { type: new GraphQLList(GraphQLString) },
        selfUrl: { type: GraphQLString },
        chaptersUrl: { type: GraphQLString },
        sourceUrl: { type: GraphQLString }
    })
})

const ChapterType = new GraphQLObjectType({
    name: 'Chapter',
    description: 'A chapter of a specific series/comic',
    fields: () => ({
        chapterPublishedDate: { type: GraphQLString },
        chapterTitle: { type: GraphQLString },
        chapterSlug: { type: GraphQLString },
        selfUrl: { type: GraphQLString },
        sourceUrl: { type: GraphQLString },
        seriesId: { type: GraphQLString },
        seriesTitle: { type: GraphQLString },
        seriesSlug: { type: GraphQLString },
        seriesUrl: { type: GraphQLString },
        imagesUrl: { type: new GraphQLList(GraphQLString) },
        compressedImage: { type: new GraphQLList(GraphQLString) }
    })
})

const ContentType = new GraphQLObjectType({
    name: 'Content',
    description: 'An URL of an image object from a specific chapter',
    fields: () => ({
        imagesUrl: { type: new GraphQLList(GraphQLString) },
        compressedImage: { type: new GraphQLList(GraphQLString) }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        series: {
            type: new GraphQLList(SeriesType),
            description: 'Get a list of all series/comics which already scraped from Asura Scans website',
            resolve: () => {
                return Series.find()
            }
        },
        seriesBySlug: {
            type: new GraphQLList(SeriesType),
            description: 'Find a series/comic using its slug',
            args: {
                seriesSlug: { type: GraphQLString }
            },
            resolve: (root, { seriesSlug }) => {
                if (seriesSlug !== undefined) {
                    return Series.find({'seriesSlug': seriesSlug })
                } else { return Series.find() }
            }
        },
        chapters: {
            type: new GraphQLList(ChapterType),
            description: 'Get a list of all chapters from a specific series',
            args: {
                seriesSlug: { type: GraphQLString }
            },
            resolve: (root, { seriesSlug }) => {
                return Chapters.find({ 'seriesSlug': seriesSlug })
            }
        },
        chapterContent: {
            type: new GraphQLList(ContentType),
            description: 'Get the content of a scpecific chapter',
            args: {
                chapterSlug: { type: GraphQLString },
                seriesSlug: { type: GraphQLString }
            },
            resolve: (root, { chapterSlug, seriesSlug }) => {
                return Chapters.find({
                    $and: [
                        { 'chapterSlug': chapterSlug },
                        { 'seriesSlug': seriesSlug }
                    ]
                }, { 'imagesUrl': 1 })
            }
        }
    })
})

module.exports = new GraphQLSchema({
    query: RootQueryType
})