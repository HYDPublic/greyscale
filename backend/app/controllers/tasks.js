var
    _ = require('underscore'),
    BoLogger = require('app/bologger'),
    bologger = new BoLogger(),
    Product = require('app/models/products'),
    Project = require('app/models/projects'),
    Workflow = require('app/models/workflows'),
    EssenceRole = require('app/models/essence_roles'),
    WorkflowStep = require('app/models/workflow_steps'),
    UOA = require('app/models/uoas'),
    Task = require('app/models/tasks'),
    Survey = require('app/models/surveys'),
    co = require('co'),
    Query = require('app/util').Query,
    query = new Query(),
    thunkify = require('thunkify'),
    HttpError = require('app/error').HttpError,
    ProductUOA = require('app/models/product_uoa'),
    thunkQuery = thunkify(query);

module.exports = {

    select: function (req, res, next) {
        var thunkQuery = req.thunkQuery;
        co(function* () {
            return yield thunkQuery(
                Task
                .select(
                    Task.star()
                    //'row_to_json("Workflows".*) as workflow'
                )
                .from(
                    Task
                    //.leftJoin(Workflow)
                    //.on(Product.id.equals(Workflow.productId))
                )
            );
        }).then(function (data) {
            res.json(data);
        }, function (err) {
            next(err);
        });
    },

    selectOne: function (req, res, next) {
        var thunkQuery = req.thunkQuery;
        co(function* () {
            var curStepAlias = 'curStep';
            var task = yield thunkQuery(
                Task
                .select(
                    Task.star(),
                    'CASE ' +
                        'WHEN '+
                            '(' +
                            'SELECT ' +
                            '"Discussions"."id" ' +
                                'FROM "Discussions" ' +
                            'WHERE "Discussions"."returnTaskId" = "Tasks"."id" ' +
                            'AND "Discussions"."isReturn" = true ' +
                            'AND "Discussions"."isResolve" = false ' +
                            'AND "Discussions"."activated" = true ' +
                            'LIMIT 1' +
                            ') IS NULL ' +
                            ' AND (' +
                            'SELECT ' +
                            '"Discussions"."id" ' +
                                'FROM "Discussions" ' +
                            'WHERE "Discussions"."taskId" = "Tasks"."id" ' +
                            'AND "Discussions"."isResolve" = true ' +
                            'AND "Discussions"."activated" = false ' +
                            'LIMIT 1' +
                            ') IS NULL ' +
                        'THEN FALSE ' +
                        'ELSE TRUE ' +
                    'END as flagged',
                    '( '+
                        'SELECT count("Discussions"."id") ' +
                            'FROM "Discussions" ' +
                        'WHERE "Discussions"."returnTaskId" = "Tasks"."id" ' +
                        'AND "Discussions"."isReturn" = true ' +
                            //'AND "Discussions"."isResolve" = false ' +
                        'AND "Discussions"."activated" = true ' +
                    ') as flaggedCount',
                    '(' +
                        'SELECT ' +
                        '"Discussions"."taskId" ' +
                            'FROM "Discussions" ' +
                        'WHERE "Discussions"."returnTaskId" = "Tasks"."id" ' +
                        'AND "Discussions"."isReturn" = true ' +
                        //'AND "Discussions"."isResolve" = false ' +
                        'AND "Discussions"."activated" = true ' +
                        'LIMIT 1' +
                    ') as flaggedFrom',
                    'CASE ' +
                        'WHEN ' +
                            '("' + curStepAlias + '"."position" > "WorkflowSteps"."position") ' +
                            'OR ("ProductUOA"."isComplete" = TRUE) ' +
                        'THEN \'completed\' ' +
                        'WHEN (' +
                            '"' + curStepAlias + '"."position" IS NULL ' +
                            'AND ("WorkflowSteps"."position" = 0) ' +
                            'AND ("Products"."status" = 1)' +
                        ')' +
                        'OR (' +
                            '"' + curStepAlias + '"."position" = "WorkflowSteps"."position" ' +
                            'AND ("Products"."status" = 1)' +
                        ')' +
                        'THEN \'current\' ' +
                        'ELSE \'waiting\'' +
                    'END as status '
                )
                .from(
                    Task
                    .leftJoin(Product)
                    .on(Task.productId.equals(Product.id))
                    .leftJoin(WorkflowStep)
                    .on(Task.stepId.equals(WorkflowStep.id))
                    .leftJoin(ProductUOA)
                    .on(
                        ProductUOA.productId.equals(Task.productId)
                            .and(ProductUOA.UOAid.equals(Task.uoaId))
                    )
                    .leftJoin(WorkflowStep.as(curStepAlias))
                    .on(
                        ProductUOA.currentStepId.equals(WorkflowStep.as(curStepAlias).id)
                    )
                )
                .where(Task.id.equals(req.params.id))
            );
            if (!_.first(task)) {
                throw new HttpError(403, 'Not found');
            }
            return _.first(task);
        }).then(function (data) {
            res.json(data);
        }, function (err) {
            next(err);
        });
    },

    delete: function (req, res, next) {
        var thunkQuery = req.thunkQuery;

        co(function*(){
            return yield thunkQuery(
                Task.delete().where(Task.id.equals(req.params.id))
            );
        }).then(function(data){
            bologger.log({
                req: req,
                user: req.user,
                action: 'delete',
                object: 'tasks',
                entity: req.params.id,
                info: 'Delete task'
            });
            res.status(204).end();
        }, function(err){
            next(err);
        });
    },

    updateOne: function (req, res, next) {
        var thunkQuery = req.thunkQuery;
        co(function* () {
            return yield thunkQuery(
                Task
                .update(_.pick(req.body, Task.editCols))
                .where(Task.id.equals(req.params.id))
            );
        }).then(function (data) {
            bologger.log({
                req: req,
                user: req.user,
                action: 'update',
                object: 'tasks',
                entity: req.params.id,
                info: 'Update task'
            });
            res.status(202).end();
        }, function (err) {
            next(err);
        });
    },

    insertOne: function (req, res, next) {
        var thunkQuery = req.thunkQuery;
        co(function* () {
            yield * checkTaskData(req);
            req.body = _.extend(req.body, {userId: req.user.realmUserId}); // add from realmUserId instead of user id
            var result = yield thunkQuery(
                Task
                .insert(
                    _.pick(req.body, Task.table._initialConfig.columns)
                )
                .returning(Task.id)
            );
            return result;
        }).then(function (data) {
            bologger.log({
                req: req,
                user: req.user,
                action: 'insert',
                object: 'tasks',
                entity: _.first(data).id,
                info: 'Add new task'
            });
            res.status(201).json(_.first(data));
        }, function (err) {
            next(err);
        });
    }

};

function* checkTaskData(req) {
    var thunkQuery = req.thunkQuery;
    if (!req.params.id) {
        if (
            typeof req.body.uoaId === 'undefined' ||
            typeof req.body.stepId === 'undefined' ||
            typeof req.body.userId === 'undefined' ||
            typeof req.body.productId === 'undefined'
        ) {

            throw new HttpError(403, 'uoaId, stepId, userId, productId and title fields are required');
        }
    }

}
