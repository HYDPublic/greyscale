var
    _ = require('underscore'),
    config = require('config'),
    Product = require('app/models/products'),
    ProductUOA = require('app/models/product_uoa'),
    Project = require('app/models/projects'),
    Workflow = require('app/models/workflows'),
    Essence = require('app/models/essences'),
    EssenceRole = require('app/models/essence_roles'),
    WorkflowStep = require('app/models/workflow_steps'),
    UOA = require('app/models/uoas'),
    Task = require('app/models/tasks'),
    Survey = require('app/models/surveys'),
    SurveyQuestion = require('app/models/survey_questions'),
    Discussion = require('app/models/discussions'),
    Notification = require('app/models/notifications'),
    Organization = require('app/models/organizations'),
    User = require('app/models/users'),
    co = require('co'),
    sql = require('sql'),
    Query = require('app/util').Query,
    query = new Query(),
    thunkify = require('thunkify'),
    HttpError = require('app/error').HttpError,
    thunkQuery = thunkify(query);

function* getEntityById(req, id, model, key) {
    var thunkQuery = req.thunkQuery;
    return yield thunkQuery(model.select().from(model).where(model[key].equals(parseInt(id))));
}

var getTask = function* (req, taskId) {
    var thunkQuery = req.thunkQuery;
    var result = yield * getEntityById(req, taskId, Task, 'id');
    if (!_.first(result)) {
        throw new HttpError(403, 'Task with id `'+parseInt(taskId).toString()+'` does not exist');
    }
    return result[0];
};
exports.getTask = getTask;

var getDiscussionEntry = function* (req, entryId) {
    var result = yield * getEntityById(req, entryId, Discussion, 'id');
    if (!_.first(result)) {
        throw new HttpError(403, 'Entry with id `'+parseInt(userId).toString()+'` does not exist in discussions');
    }
    return result[0];
};
exports.getDiscussionEntry = getDiscussionEntry;

var getUser = function* (req, userId) {
    var result = yield * getEntityById(req, userId, User, 'id');
    if (!_.first(result)) {
        throw new HttpError(403, 'User with id `'+parseInt(userId).toString()+'` does not exist');
    }
    return result[0];
};
exports.getUser = getUser;

var getEssenceId = function* (req, essenceName) {
    var thunkQuery = (req) ?  req.thunkQuery : thunkQuery;
    var result = yield thunkQuery(Essence.select().from(Essence).where([sql.functions.UPPER(Essence.tableName).equals(essenceName.toUpperCase())]));
    if (!_.first(result)) {
        throw new HttpError(403, 'Error find Essence for table name `'+essenceName+'`');
    }
    return result[0].id;
};
exports.getEssenceId = getEssenceId;

var getNotification = function* (req, notificationId) {
    var thunkQuery = req.thunkQuery;
    var result = yield thunkQuery(Notification.select().from(Notification).where(Notification.id.equals(notificationId)));
    if (!_.first(result)) {
        throw new HttpError(403, 'Notification with id `'+parseInt(notificationId).toString()+'` does not exist');
    }
    return result[0];
};
exports.getNotification = getNotification;

var getOrganization = function* (req, orgId) {
    var thunkQuery = req.thunkQuery;
    var result = yield thunkQuery(Organization.select().from(Organization).where(Organization.id.equals(orgId)));
    if (!_.first(result)) {
        throw new HttpError(403, 'Organization with id `'+parseInt(orgId).toString()+'` does not exist');
    }
    return result[0];
};
exports.getOrganization = getOrganization;

var getEssence = function* (req, essenceId) {
    var thunkQuery = req.thunkQuery;
    // get Essence info
    var result = yield thunkQuery(Essence.select().from(Essence).where(Essence.id.equals(essenceId)));
    if (!_.first(result)) {
        throw new HttpError(403, 'Essence with id `'+parseInt(essenceId).toString()+'` does not exist');
    }
    return result[0];
};
exports.getEssence = getEssence;

