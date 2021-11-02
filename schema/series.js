const { SeriesTC } = require('../models/series')

const SeriesQuery = {
    seriesById: SeriesTC.getResolver('findById'),
    seriesByIds: SeriesTC.getResolver('findByIds'),
    seriesOne: SeriesTC.getResolver('findOne'),
    seriesMany: SeriesTC.getResolver('findMany'),
    seriesCount: SeriesTC.getResolver('count'),
    seriesConnection: SeriesTC.getResolver('connection'),
    seriesPagination: SeriesTC.getResolver('pagination'),
}

const SeriesMutation = {
    seriesCreateOne: SeriesTC.getResolver('createOne'),
    seriesCreateMany: SeriesTC.getResolver('createMany'),
    seriesUpdateById: SeriesTC.getResolver('updateById'),
    seriesUpdateOne: SeriesTC.getResolver('updateOne'),
    seriesUpdateMany: SeriesTC.getResolver('updateMany'),
    seriesRemoveById: SeriesTC.getResolver('removeById'),
    seriesRemoveOne: SeriesTC.getResolver('removeOne'),
    seriesRemoveMany: SeriesTC.getResolver('removeMany'),
}

module.exports = { SeriesQuery, SeriesMutation }