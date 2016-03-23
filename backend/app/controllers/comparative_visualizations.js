var _ = require('underscore'),
    ComparativeVisualization = require('app/models/comparative_visualizations'),
    ComparativeVisualizationProduct = require('app/models/comparative_visualization_products'),
    HttpError = require('app/error').HttpError,
    Query = require('app/util').Query,
    query = new Query(),
    co = require('co'),
    thunkify = require('thunkify'),
    thunkQuery = thunkify(query);

module.exports = {
    select: function (req, res, next) {
        co(function* () {
            var results = yield thunkQuery(
                ComparativeVisualization
                .select(
                    ComparativeVisualization.id,
                    ComparativeVisualization.title,
                    "format('[%s]', " +
                        "string_agg(format('{ \"productId\": %s, \"indexId\": %s }', " + 
                            '"ComparativeVisualizationProducts"."productId", ' +
                            '"ComparativeVisualizationProducts"."indexId" ' +
                        "), ',')" +
                    ') AS products'
                )
                .where(
                    ComparativeVisualization.organizationId.equals(req.params.organizationId)
                )
                .from(
                    ComparativeVisualization
                    .leftJoin(ComparativeVisualizationProduct)
                    .on(ComparativeVisualization.id.equals(ComparativeVisualizationProduct.visualizationId))
                )
                .group(
                    ComparativeVisualization.id
                )
            );
            return results.map(function (viz) {
                viz.products = parseProductsString(viz.products);
                return viz;
            });
        }).then(function (data) {
            res.json(data);
        }, function (err) {
            next(err);
        });
    },

    insertOne: function (req, res, next) {
        co(function* () {
            if (req.user.roleID != 1 && (req.user.organizationId != req.params.organizationId)) {
                throw new HttpError(400, 'You cannot save visualizations to other organizations');
            }

            // insert ComparativeVisualization
            var viz = {
                title: req.body.title,
                organizationId: req.params.organizationId
            };
            var result = yield thunkQuery(ComparativeVisualization.insert(viz).returning(ComparativeVisualization.id));
            console.log("VIZID", result[0].id);

            // insert ComparativeVisualizationProducts
            var products = req.body.products || [];
            for (var i = 0; i < products.length; i++) {
                yield thunkQuery(ComparativeVisualizationProduct.insert({
                    visualizationId: result[0].id,
                    productId: products[i].productId,
                    indexId: products[i].indexId
                }));
            }

            return result;
        }).then(function (data) {
            res.status(201).json(_.first(data));
        }, function (err) {
            next(err);
        });
    },

    updateOne: function (req, res, next) {
        co(function* () {
            if (req.user.roleID != 1 && (req.user.organizationId != req.params.organizationId)) {
                throw new HttpError(400, 'You cannot save visualizations to other organizations');
            }

            // check viz and organization id
            var viz = yield thunkQuery(ComparativeVisualization.select(ComparativeVisualization.organizationId).where(
                ComparativeVisualization.id.equals(req.params.id).and(ComparativeVisualization.organizationId.equals(req.params.organizationId))
            ));
            if (!viz) {
                throw new HttpError(400, 'You cannot save visualizations to other organizations');
            }

            // update ComparativeVisualization
            yield thunkQuery(ComparativeVisualization.update({ title: req.body.title }).where(
                ComparativeVisualization.id.equals(req.params.id)
            ));

            // drop existing ComparativeVisualizationProducts
            yield thunkQuery(ComparativeVisualizationProduct.delete().where(
                ComparativeVisualizationProduct.visualizationId.equals(req.params.id)
            ));

            // insert new ones
            var products = req.body.products || [];
            for (var i = 0; i < products.length; i++) {
                yield thunkQuery(ComparativeVisualizationProduct.insert({
                    visualizationId: req.params.id,
                    productId: products[i].productId,
                    indexId: products[i].indexId
                }));
            }
        }).then(function () {
            res.status(202).end();
        }, function (err) {
            next(err);
        });
    },

    deleteOne: function (req, res, next) {
        co(function* () {
            return yield thunkQuery(
                ComparativeVisualization.delete().where(
                    ComparativeVisualization.id.equals(req.params.id).and(ComparativeVisualization.organizationId.equals(req.params.organizationId))
                )
            );
        }).then(function (data) {
            res.status(204).end();
        }, function (err) {
            next(err);
        });
    },

    selectOne: function (req, res, next) {
        co(function* () {
            var result = yield thunkQuery(
                ComparativeVisualization
                .select(
                    ComparativeVisualization.id,
                    ComparativeVisualization.title,
                    "format('[%s]', " +
                        "string_agg(format('{ \"productId\": %s, \"indexId\": %s }', " + 
                            '"ComparativeVisualizationProducts"."productId", ' +
                            '"ComparativeVisualizationProducts"."indexId" ' +
                        "), ',')" +
                    ') AS products'
                )
                .where(
                    ComparativeVisualization.id.equals(req.params.id)
                    .and(ComparativeVisualization.organizationId.equals(req.params.organizationId))
                )
                .from(
                    ComparativeVisualization
                    .leftJoin(ComparativeVisualizationProduct)
                    .on(ComparativeVisualization.id.equals(ComparativeVisualizationProduct.visualizationId))
                )
                .group(
                    ComparativeVisualization.id
                )
            );
            if (!result[0]) {
                throw new HttpError(404, 'Not found');
            }
            result[0].products = parseProductsString(result[0].products);
            return result[0];
        }).then(function (data) {
            res.json(data);
        }, function (err) {
            next(err);
        });
    }
};

function parseProductsString(productsString) {
    // parse JSON products string into js object
    // due to postgres quirks, [] represented as '[,]'
    try {
        return JSON.parse(productsString);
    } catch (e) {
        return []
    }
}

