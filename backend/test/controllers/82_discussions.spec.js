/**
 * Discussions tests
 *
 * prerequsites tests: organizations, users
 *
 * used entities: organization, users
 *
 * created:
 *
 **/

var chai = require('chai');
var expect = chai.expect;
var assert = chai.assert;
var config = require('../../config');
var ithelper = require('./itHelper');
var request = require('supertest');
var async = require('async');
var _ = require('underscore');

var testEnv = {};
testEnv.backendServerDomain = 'http://localhost'; // ToDo: to config

testEnv.api_base          = testEnv.backendServerDomain + ':' + config.port + '/';
testEnv.api               = request.agent(testEnv.api_base + config.pgConnect.adminSchema + '/v0.2');
testEnv.api_created_realm = request.agent(testEnv.api_base + config.testEntities.organization.realm + '/v0.2');

var allUsers  = [];
var tokenSuperAdmin;
var tokenAdmin;
var tokenUser1;
var tokenUser2;
var tokenUser3;

var token;
var obj ={};
var path = '/discussions';
var testTitle='Discussions: ';

// entities for tests
var errTaskId = 'abc';
var notExistTaskId = 9999;
var taskId = [2, 3, 4, 5];
var errQuestionId = 'abc';
var notExistQuestionId = 9999;
var questionId = [2, 3];

var errUserId = 'abc';
var notExistUserId = 9999;
var userId = [3, 4, 5];
var adminId = 2;

var productId = 2;
var uoaId = 66;

var getUser4task2 = [
    {
        firstName : 'Anonymous',
        lastName : '',
        role : 'Role 1',
        stepId : 2,
        stepName : 'Step1',
        userId : 3
    },
    {
        firstName : 'User2',
        lastName : 'Test',
        role : 'Role 2',
        stepId : 3,
        stepName : 'Step 2',
        userId : 4
    },
    {
        firstName : 'Anonymous',
        lastName : '',
        role : 'Role 3',
        stepId : 4,
        stepName : 'Step 3',
        userId : 5
    },
    {
        firstName : 'Anonymous',
        lastName : '',
        role : 'Role 4',
        stepId : 5,
        stepName : 'Step 4',
        userId : 2
    }
];

var getUser4task1 = [
    {
        firstName : 'User1',
        lastName : 'Test',
        role : 'Role 1',
        stepId : 2,
        stepName : 'Step1',
        userId : 3
    },
    {
        firstName : 'User2',
        lastName : 'Test',
        role : 'Role 2',
        stepId : 3,
        stepName : 'Step 2',
        userId : 4
    },
    {
        firstName : 'User3',
        lastName : 'Test',
        role : 'Role 3',
        stepId : 4,
        stepName : 'Step 3',
        userId : 5
    },
    {
        firstName : 'Test',
        lastName : 'Admin',
        role : 'Role 4',
        stepId : 5,
        stepName : 'Step 4',
        userId : 2
    }
];

var getUser4task1Anonymous = [
    {
        firstName : 'User1',
        lastName : 'Test',
        role : 'Role 1',
        stepId : 2,
        stepName : 'Step1',
        userId : 3
    },
    {
        firstName : 'User2',
        lastName : 'Test',
        role : 'Role 2',
        stepId : 3,
        stepName : 'Step 2',
        userId : 4
    },
    {
        firstName : 'Anonymous',
        lastName : '',
        role : 'Role 3',
        stepId : 4,
        stepName : 'Step 3',
        userId : 5
    },
    {
        firstName : 'Test',
        lastName : 'Admin',
        role : 'Role 4',
        stepId : 5,
        stepName : 'Step 4',
        userId : 2
    }
];

var getUser4task2ReturnList = [
    {
        firstName : 'Anonymous',
        lastName : '',
        role : 'Role 1',
        stepId : 2,
        stepName : 'Step1',
        userId : 3
    }
];

var getUser4task1ResolveList = [
    {
        firstName : 'User2',
        lastName : 'Test',
        role : 'Role 2',
        stepId : 3,
        stepName : 'Step 2',
        userId : 4
    }
];

describe(testTitle, function () {


    before(function(done){
        // authorize users
        // allUsers.concat(config.testEntities.users);
        allUsers = ithelper.getAllUsersList(config.testEntities, ['superAdmin', 'admin', 'users']);
        ithelper.getTokens(allUsers).then(
            (res) => {
                allUsers = res;
                tokenSuperAdmin = ithelper.getUser(allUsers,1).token;
                tokenAdmin = ithelper.getUser(allUsers,2).token;
                tokenUser1 = ithelper.getUser(allUsers,3,1).token;
                tokenUser2 = ithelper.getUser(allUsers,3,2).token;
                tokenUser3 = ithelper.getUser(allUsers,3,3).token;
                // correct user names
                getUser4task1ResolveList[0].firstName = ithelper.getUser(allUsers,3,2).firstName;
                getUser4task1ResolveList[0].lastName = ithelper.getUser(allUsers,3,2).lastName;

                getUser4task2[1].firstName = ithelper.getUser(allUsers,3,2).firstName;
                getUser4task2[1].lastName = ithelper.getUser(allUsers,3,2).lastName;

                getUser4task1[0].firstName = ithelper.getUser(allUsers,3,1).firstName;
                getUser4task1[0].lastName = ithelper.getUser(allUsers,3,1).lastName;
                getUser4task1[1].firstName = ithelper.getUser(allUsers,3,2).firstName;
                getUser4task1[1].lastName = ithelper.getUser(allUsers,3,2).lastName;
                getUser4task1[2].firstName = ithelper.getUser(allUsers,3,3).firstName;
                getUser4task1[2].lastName = ithelper.getUser(allUsers,3,3).lastName;
                getUser4task1[3].firstName = ithelper.getUser(allUsers,2).firstName;
                getUser4task1[3].lastName = ithelper.getUser(allUsers,2).lastName;


                getUser4task1Anonymous[0].firstName = ithelper.getUser(allUsers,3,1).firstName;
                getUser4task1Anonymous[0].lastName = ithelper.getUser(allUsers,3,1).lastName;
                getUser4task1Anonymous[1].firstName = ithelper.getUser(allUsers,3,2).firstName;
                getUser4task1Anonymous[1].lastName = ithelper.getUser(allUsers,3,2).lastName;
                getUser4task1Anonymous[3].firstName = ithelper.getUser(allUsers,2).firstName;
                getUser4task1Anonymous[3].lastName = ithelper.getUser(allUsers,2).lastName;

                done();
            },
            (err) => done(err)
        );
    });

    function allTests() {

        describe(testTitle+'Prepare for test', function () {
            it('Do prepare SQL script ', function (done) {
                ithelper.doSql('test/preDiscussions.sql', config.testEntities.organization.realm, done);
            });
        });
        describe(testTitle+'Select empty (before testing) ', function () {
            it('(Err) taskId must be specified', function (done) {
                ithelper.selectErrMessage(testEnv.api_created_realm, path, tokenSuperAdmin, 400, 403, 'taskId must be specified', done);
            });
            it('(Err) taskId must be integer', function (done) {
                ithelper.selectErrMessage(testEnv.api_created_realm, path+'?taskId='+errTaskId, tokenSuperAdmin, 400, 403, 'taskId must be integer', done);
            });
            it('(Err) taskId does not exist', function (done) {
                ithelper.selectErrMessage(testEnv.api_created_realm, path+'?taskId='+notExistTaskId, tokenSuperAdmin, 400, 403, 'does not exist', done);
            });
            it('True number of records (superAdmin) = 0', function (done) {
                ithelper.selectCount(testEnv.api_created_realm, path+'?taskId='+taskId[0], tokenSuperAdmin, 200, 0, done);
            });
            it('True number of records (admin) = 0', function (done) {
                ithelper.selectCount(testEnv.api_created_realm, path+'?taskId='+taskId[0], tokenAdmin, 200, 0, done);
            });
            it('True number of records (user1) = 0', function (done) {
                ithelper.selectCount(testEnv.api_created_realm, path+'?taskId='+taskId[0], tokenUser1, 200, 0, done);
            });
        });
        describe(testTitle+'Add discussion`s entry (not flagged) ', function () {
            describe('Errors:', function () {
                it('(Err) questionId must be specified', function (done) {
                    var insertItem = {};
                    ithelper.insertOneErrMessage(testEnv.api_created_realm, path, tokenAdmin, insertItem, 400, 403, 'questionId must be specified', done);
                });
                it('(Err) questionId must be integer', function (done) {
                    var insertItem = {questionId: errQuestionId};
                    ithelper.insertOneErrMessage(testEnv.api_created_realm, path, tokenAdmin, insertItem, 400, 403, 'questionId must be integer', done);
                });
                it('(Err) questionId does not exist', function (done) {
                    var insertItem = {questionId: notExistQuestionId};
                    ithelper.insertOneErrMessage(testEnv.api_created_realm, path, tokenAdmin, insertItem, 400, 403, 'does not exist', done);
                });
                it('(Err) taskId must be specified', function (done) {
                    var insertItem = {questionId: questionId[0]};
                    ithelper.insertOneErrMessage(testEnv.api_created_realm, path, tokenAdmin, insertItem, 400, 403, 'taskId must be specified', done);
                });
                it('(Err) taskId must be integer', function (done) {
                    var insertItem = {questionId: questionId[0], taskId: errTaskId};
                    ithelper.insertOneErrMessage(testEnv.api_created_realm, path, tokenAdmin, insertItem, 400, 403, 'taskId must be integer', done);
                });
                it('(Err) taskId does not exist', function (done) {
                    var insertItem = {questionId: questionId[0], taskId: notExistTaskId};
                    ithelper.insertOneErrMessage(testEnv.api_created_realm, path, tokenAdmin, insertItem, 400, 403, 'does not exist', done);
                });
                it('(Err) userId must be specified', function (done) {
                    var insertItem = {questionId: questionId[0], taskId: taskId[0]};
                    ithelper.insertOneErrMessage(testEnv.api_created_realm, path, tokenAdmin, insertItem, 400, 403, 'userId must be specified', done);
                });
                it('(Err) userId must be integer', function (done) {
                    var insertItem = {questionId: questionId[0], taskId: taskId[0], userId: errUserId};
                    ithelper.insertOneErrMessage(testEnv.api_created_realm, path, tokenAdmin, insertItem, 400, 403, 'userId must be integer', done);
                });
                it('(Err) userId does not exist', function (done) {
                    var insertItem = {questionId: questionId[0], taskId: taskId[0], userId: notExistUserId};
                    ithelper.insertOneErrMessage(testEnv.api_created_realm, path, tokenAdmin, insertItem, 400, 403, 'does not exist', done);
                });
                it('(Err) discussion`s entry must be specified', function (done) {
                    var insertItem = {questionId: questionId[0], taskId: taskId[0], userId: userId[1]};
                    ithelper.insertOneErrMessage(testEnv.api_created_realm, path, tokenAdmin, insertItem, 400, 403, 'Entry must be specified', done);
                });
            });
            describe('Success:', function () {
                it('Simple discussion entry from Admin to User2 (q1, t1)', function (done) {
                    var insertItem = {questionId: questionId[0], taskId: taskId[0], userId: userId[1], entry: 'simple discussion entry from Admin to User2 (q1, t1)'};
                    ithelper.insertOne(testEnv.api_created_realm, path, tokenAdmin, insertItem, 201, obj, 'discussionId1', done);
                });
                it('Get entry update for added entry', function (done) {
                    ithelper.selectOneCheckField(testEnv.api_created_realm, path+'/entryscope/'+obj.discussionId1, tokenAdmin, 200, null, 'canUpdate', true, done);
                });
                it('Update simple discussion entry from Admin to User2 (q1, t1)', function (done) {
                    var updateItem = {questionId: questionId[0], taskId: taskId[0], userId: userId[1], entry: 'UPDATED simple discussion entry from Admin to User2 (q1, t1)'};
                    ithelper.updateOne(testEnv.api_created_realm, path+'/'+obj.discussionId1, tokenAdmin, updateItem, 202, done);
                });
                it('Simple discussion entry from User1 to User2 (q1, t1)', function (done) {
                    var insertItem = {questionId: questionId[0], taskId: taskId[0], userId: userId[1], entry: 'simple discussion entry from User1 to User2 (q1, t1)'};
                    ithelper.insertOne(testEnv.api_created_realm, path, tokenUser1, insertItem, 201, obj, 'discussionId2', done);
                });
                it('Get entry update for added entry (next entry exist)', function (done) {
                    ithelper.selectOneCheckField(testEnv.api_created_realm, path+'/entryscope/'+obj.discussionId1, tokenAdmin, 200, null, 'canUpdate', false, done);
                });
                it('(Err) Entry with id=<id> cannot be updated, there are have following entries', function (done) {
                    var updateItem = {questionId: questionId[0], taskId: taskId[0], userId: userId[1], entry: 'ERROR UPDATED Entry with id=<id> cannot be updated, there are have following entries'};
                    ithelper.updateOneErrMessage(testEnv.api_created_realm, path+'/'+obj.discussionId1, tokenAdmin, updateItem, 400, 403, 'Entry with id=.* cannot be updated, there are have following entries', done);
                });
                it('True number of discussion`s entries = 2', function (done) {
                    ithelper.selectCount(testEnv.api_created_realm, path+'?taskId='+taskId[0], tokenUser1, 200, 2, done);
                });
                it('Delete created discussion entry (2)', function (done) {
                    ithelper.deleteOne(testEnv.api_created_realm, path + '/' + obj.discussionId2, tokenAdmin, 204, done);
                });
                it('True number of discussion`s entries = 1', function (done) {
                    ithelper.selectCount(testEnv.api_created_realm, path+'?taskId='+taskId[0], tokenUser1, 200, 1, done);
                });
            });
        });
        describe(testTitle+'Errors when add discussion`s entry (flagged - return to previous step) ', function () {
            it('(Err) "It is not possible to post entry with "return" flag, because there are not previous steps"', function (done) {
                var insertItem = {questionId: questionId[0], taskId: taskId[0], userId: userId[1], entry: 'Error - there are not previous steps', isReturn: true};
                ithelper.insertOneErrMessage(testEnv.api_created_realm, path, tokenAdmin, insertItem, 400, 403, 'It is not possible to post entry with .* flag, because there are not previous steps', done);
            });
        });
        describe('Survey next step:', function () {
            it('Move to the  next step', function (done) {
                ithelper.selectCheckAllRecords(testEnv.api_created_realm, '/products/'+productId+'/move/'+uoaId, tokenAdmin, 200, [], done);
            });
            it('Check current step', function (done) {
                ithelper.selectCheckAllRecords(testEnv.api_created_realm, '/products/'+productId+'/uoa', tokenAdmin, 200, [{currentStepId: 3}], done);
            });
            it('get Entryscope for task2 (availList)', function (done) {
                ithelper.selectCheckAllRecords4Key(testEnv.api_created_realm, path+'/entryscope?taskId='+taskId[1], tokenAdmin, 200, getUser4task2, 'availList', done);
            });
            it('get Entryscope for task2 (returnList)', function (done) {
                ithelper.selectCheckAllRecords4Key(testEnv.api_created_realm, path+'/entryscope?taskId='+taskId[1], tokenAdmin, 200, getUser4task2ReturnList, 'returnList', done);
            });
        });
        describe(testTitle+'Add discussion`s entry (flagged - return to previous step) ', function () {
            it('(Err) "It is not possible to post entry with "return" flag, because Task stepId=<id> does not equal currentStepId=<id>"', function (done) {
                var insertItem = {questionId: questionId[0], taskId: taskId[0], userId: userId[1], entry: 'Error - invalid stepId', isReturn: true};
                ithelper.insertOneErrMessage(testEnv.api_created_realm, path, tokenAdmin, insertItem, 400, 403, 'It is not possible to post entry with "return" flag, because Task stepId=.* does not equal currentStepId=.*', done);
            });
            it('(Err) "User with userId=<id> does not available user for this survey`s discussion entry', function (done) {
                var insertItem = {questionId: questionId[0], taskId: taskId[1], userId: userId[2], entry: 'Error - not available user', isReturn: true};
                ithelper.insertOneErrMessage(testEnv.api_created_realm, path, tokenAdmin, insertItem, 400, 403, 'User with userId=.* does not available user for this survey`s discussion entry', done);
            });
            it('(Err) "No available users for this survey`s discussion entry"', function (done) {
                var insertItem = {questionId: questionId[0], taskId: taskId[1], userId: userId[2], entry: 'Error - No available users for this survey`s discussion entry', isResolve: true};
                ithelper.insertOneErrMessage(testEnv.api_created_realm, path, tokenAdmin, insertItem, 400, 403, 'No available users for this survey`s discussion entry', done);
            });
            it('Discussion entry (flagged - with return flag) from Admin to User1 (q1, t2)', function (done) {
                var insertItem = {questionId: questionId[0], taskId: taskId[1], userId: userId[0], entry: 'Discussion entry (flagged - with return flag) from Admin to User1 (q1, t2)', isReturn: true};
                ithelper.insertOne(testEnv.api_created_realm, path, tokenAdmin, insertItem, 201, obj, 'discussionId3', done);
            });
            it('Check current step', function (done) {
                ithelper.selectCheckAllRecords(testEnv.api_created_realm, '/products/'+productId+'/uoa', tokenAdmin, 200, [{currentStepId: 2}], done);
            });
            it('get Entryscope for task1 (availList)', function (done) {
                ithelper.selectCheckAllRecords4Key(testEnv.api_created_realm, path+'/entryscope?taskId='+taskId[0], tokenAdmin, 200, getUser4task1, 'availList', done);
            });
            it('get Entryscope for task1 (resolveList)', function (done) {
                ithelper.selectCheckAllRecords4Key(testEnv.api_created_realm, path+'/entryscope?taskId='+taskId[0], tokenAdmin, 200, getUser4task1ResolveList, 'resolveList', done);
            });
        });
        describe(testTitle+'Add discussion`s entry (flagged - resolve) ', function () {
            it('(Err) "User with userId=<id> does not available user for this survey`s discussion entry"', function (done) {
                var insertItem = {questionId: questionId[0], taskId: taskId[0], userId: userId[2], entry: 'Error - User with userId=<id> does not available user for this survey`s discussion entry', isResolve: true};
                ithelper.insertOneErrMessage(testEnv.api_created_realm, path, tokenUser1, insertItem, 400, 403, 'User with userId=.* does not available user for this survey`s discussion entry', done);
            });
            it('Discussion entry (flagged - resolve)', function (done) {
                var insertItem = {questionId: questionId[0], taskId: taskId[0], userId: userId[1], entry: 'Discussion entry (flagged - resolve) ', isResolve: true};
                ithelper.insertOne(testEnv.api_created_realm, path, tokenUser1, insertItem, 201, obj, 'discussionId4', done);
            });
            it('Check current step', function (done) {
                ithelper.selectCheckAllRecords(testEnv.api_created_realm, '/products/'+productId+'/uoa', tokenAdmin, 200, [{currentStepId: 3}], done);
            });
        });
        describe(testTitle+'get Users ', function () {
            it('(Err) taskId must be integer', function (done) {
                ithelper.selectErrMessage(testEnv.api_created_realm, path+'/users/'+errTaskId, tokenSuperAdmin, 400, 403, 'taskId must be integer', done);
            });
            it('(Err) taskId does not exist', function (done) {
                ithelper.selectErrMessage(testEnv.api_created_realm, path+'/users/'+notExistTaskId, tokenSuperAdmin, 400, 403, 'does not exist', done);
            });
            it('for task2 with blindReview flag', function (done) {
                ithelper.selectCheckAllRecords(testEnv.api_created_realm, path+'/users/'+taskId[1], tokenAdmin, 200, getUser4task2, done);
            });
            it('for task1 without blindReview flag - Admin request', function (done) {
                ithelper.selectCheckAllRecords(testEnv.api_created_realm, path+'/users/'+taskId[0], tokenAdmin, 200, getUser4task1, done);
            });
            it('for task1 without blindReview flag - User1 request', function (done) {
                ithelper.selectCheckAllRecords(testEnv.api_created_realm, path+'/users/'+taskId[0], tokenUser1, 200, getUser4task1, done);
            });
            it('Update User3 as Anonymous', function (done) {
                ithelper.updateOne(testEnv.api_created_realm, '/users/self', tokenUser3, {isAnonymous: true}, 202, done);
            });
            it('for task1 without blindReview flag - User3=Anonymous, Admin request', function (done) {
                ithelper.selectCheckAllRecords(testEnv.api_created_realm, path+'/users/'+taskId[0], tokenAdmin, 200, getUser4task1, done);
            });
            it('for task1 without blindReview flag - User3=Anonymous, User1 request', function (done) {
                ithelper.selectCheckAllRecords(testEnv.api_created_realm, path+'/users/'+taskId[0], tokenUser1, 200, getUser4task1Anonymous, done);
            });
            it('Clear Anonymous flag for User3', function (done) {
                ithelper.updateOne(testEnv.api_created_realm, '/users/self', tokenUser3, {isAnonymous: false}, 202, done);
            });
        });
        describe(testTitle+'get Entryscope ', function () {
            it('(Err) taskId must be specified', function (done) {
                ithelper.selectErrMessage(testEnv.api_created_realm, path+'/entryscope', tokenAdmin, 400, 403, 'taskId must be specified', done);
            });
            it('(Err) taskId must be integer', function (done) {
                ithelper.selectErrMessage(testEnv.api_created_realm, path+'/entryscope?taskId='+errTaskId, tokenAdmin, 400, 403, 'taskId must be integer', done);
            });
            it('(Err) taskId does not exist', function (done) {
                ithelper.selectErrMessage(testEnv.api_created_realm, path+'/entryscope?taskId='+notExistTaskId, tokenAdmin, 400, 403, 'does not exist', done);
            });
            it('for task1', function (done) {
                ithelper.selectCheckAllRecords4Key(testEnv.api_created_realm, path+'/entryscope?taskId='+taskId[0], tokenAdmin, 200, getUser4task1, 'availList', done);
            });
            it('for task2', function (done) {
                ithelper.selectCheckAllRecords4Key(testEnv.api_created_realm, path+'/entryscope?taskId='+taskId[0], tokenAdmin, 200, getUser4task1, 'availList', done);
            });
        });
        describe(testTitle+'Clean up', function () {
            it('Do clean up SQL script ', function (done) {
                ithelper.doSql('test/postDiscussions.sql', config.testEntities.organization.realm, done);
            });
        });
    }

    allTests();

});