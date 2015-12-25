var client = require('app/db_bootstrap'),
  _ = require('underscore'),
  config = require('config'),
  Project = require('app/models/projects'),
  AccessMatrix = require('app/models/access_matrices'),
  Translation = require('app/models/translations'),
  Language = require('app/models/languages'),
  Essence = require('app/models/essences'),
  Organization = require('app/models/organizations'),
  User = require('app/models/users'),
  co = require('co'),
  Query = require('app/util').Query,
  getTranslateQuery = require('app/util').getTranslateQuery,
  query = new Query(),
  thunkify = require('thunkify'),
  HttpError = require('app/error').HttpError,
  thunkQuery = thunkify(query);

module.exports = {

    select: function (req, res, next) {
        co(function* (){
            return yield thunkQuery(Project.select().from(Project), _.omit(req.query, 'offset', 'limit', 'order'));
        }).then(function(data){
            res.json(data);
        },function(err){
            next(err);
        })
    },

    selectOne: function (req, res, next) {
        co(function* (){
            var project =  yield thunkQuery(Project.select().from(Project).where(Project.id.equals(req.params.id)));
            if (!_.first(project)) {
                throw new HttpError(404, 'Not found');
            }else{
                return _.first(project);
            }
        }).then(function(data){
            res.json(data);
        },function(err){
            next(err);
        })
    },

    delete: function (req, res, next) {
        var q = Project.delete().where(Project.id.equals(req.params.id));
        query(q, function (err, data) {
            if (err) {
                return next(err);
            }
            res.status(204).end();
        });
    },

    editOne: function (req, res, next) {
        co(function* () {
            yield* checkProjectData(req);
            var result = yield thunkQuery(Project.update(req.body).where(Project.id.equals(req.params.id)));
            return result;
        }).then(function () {
            res.status(202).end();
        }, function (err) {
            next(err);
        });
    },



    insertOne: function (req, res, next) {
        co(function* () {
            yield* checkProjectData(req);
            var result = yield thunkQuery(Project.insert(req.body).returning(Project.id));
            return result;
        }).then(function (data) {
            res.status(201).json(_.first(data));
        }, function (err) {
            next(err);
        });
    },

};

function* checkProjectData(req) {
    var isExistMatrix = yield thunkQuery(AccessMatrix.select().where(AccessMatrix.id.equals(req.body.matrixId)));
    if (!_.first(isExistMatrix)) {
        throw new HttpError(403, 'Matrix with this id does not exist');
    }

    if (req.params.id){ // update
        if(req.body.codeName){
            var isExistCode = yield thunkQuery(
                Project.select().from(Project)
                .where(Project.codeName.equals(req.body.codeName)
                .and(Project.id.notEquals(req.params.id)))
            );
            if (_.first(isExistCode)){
                throw new HttpError(403, 'Project with this code has already exist');
            }
        }
    } else { // create
        if(req.body.codeName){
            var isExistCode = yield thunkQuery(Project.select().from(Project).where(Project.codeName.equals(req.body.codeName)));
            if (_.first(isExistCode)){
                throw new HttpError(403, 'Project with this code has already exist');
            }
        }
    }

    var isExistOrg = yield thunkQuery(Organization.select().where(Organization.id.equals(req.user.organizationId)));
    if (!_.first(isExistOrg)) {
        throw new HttpError(403, 'By some reason cannot find your organization');
    }

    var isExistAdmin = yield thunkQuery(User.select().where(User.id.equals(req.body.adminUserId)));
    if (!_.first(isExistAdmin)) {
        throw new HttpError(403, 'User with this id does not exist (admin user id)');
    }

    if (_.first(isExistAdmin).organizationId != req.user.organizationId) {
        throw new HttpError(403, 'This user cannot be an admin of this project, because he is not a member of project organization')
    }

    req.body.organizationId = req.user.organizationId;

}