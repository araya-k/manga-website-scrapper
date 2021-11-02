const schema = require('graphql')
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLSchema } = schema
const Series = require('../models/series')
const Chapters = require("../models/chapters");

const SeriesType = new GraphQLObjectType({
    name: 'Series',
    description: 'Series/comic which are published at Asura Scans website',
    fields: () => ({
        seriesId: { type: GraphQLInt },
        seriesTitle: { type: GraphQLString },
        seriesSlug: { type: GraphQLString },
        coverImage: { type: GraphQLString },
        synopsis: { type: GraphQLString },
        selfUrl: { type: GraphQLString },
        chaptersUrl: { type: GraphQLString },
        sourceUrl: { type: GraphQLString }
    })
})

const ChapterType = new GraphQLObjectType({
    name: 'Chapter',
    description: 'Chapter for each series/comic',
    fields: () => ({
        chapterPublishedDate: { type: GraphQLString },
        chapterTitle: { type: GraphQLString },
        chapterSlug: { type: GraphQLString },
        selfUrl: { type: GraphQLString },
        sourceUrl: { type: GraphQLString },
        seriesId: { type: GraphQLString },
        seriesTitle: { type: GraphQLString },
        seriesSlug: { type: GraphQLString },
        seriesUrl: { type: GraphQLString }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        series: {
            type: new GraphQLList(SeriesType),
            description: 'List of all series/comics which already scraped from Asura Scans website',
            resolve: () => {
                Series.find({}, { '_id': 0, '__v': 0 }).sort({ id: 1 })
            }
        }
    })
})

module.exports = new GraphQLSchema({
    query: RootQueryType
})