const schema = require('graphql')
const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLID, GraphQLList, GraphQLSchema, GraphQLNonNull } = schema
const Series = require('../models/series')

const ListAttributesType = new GraphQLObjectType({
    name: 'ListAttributes',
    fields: () => ({
        title: { type: GraphQLString },
        slug: { type: GraphQLString }
    })
})

const SeriesType = new GraphQLObjectType({
    name: 'Series',
    description: 'Serial/comics which are published at Asura Scans website',
    fields: () => ({
        type: { type: GraphQLString },
        id: { type: GraphQLInt },
        title: { type: GraphQLString },
        updated: { type: GraphQLString },
        slug: { type: GraphQLString },
        source: { type: GraphQLString },
        chapters: {
            type: new GraphQLList(ChaptersType),

        }
    })
})

const ChaptersType = new GraphQLObjectType({
    name: 'Chapters',
    description: 'Collection of chapter for each serial/comic',
    fields: () => ({
        type: { type: GraphQLString },
        id: { type: GraphQLInt },
        title: { type: GraphQLString },
        updated: { type: GraphQLString },
        slug: { type: GraphQLString },
        source: { type: GraphQLString },
        content: {
            type: new GraphQLList(ImagesType),
        }
    })
})

const ImagesType = new GraphQLObjectType({
    name: 'Images',
    description: 'Collection of image url for each chapter',
    fields: () => ({
        type: { type: GraphQLString },
        id: { type: GraphQLInt },
        title: { type: GraphQLString },
        updated: { type: GraphQLString },
        slug: { type: GraphQLString },
        source: { type: GraphQLString },
        content: {
            type: new GraphQLList(ImagesType),
        }
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
                Series.find()
            }
        }
    })
})

module.exports = new GraphQLSchema({
    query: RootQueryType
})