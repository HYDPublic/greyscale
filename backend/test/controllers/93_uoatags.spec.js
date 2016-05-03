/**
 * Unit of Analisys Tags tests
 *
 * prerequsites tests: organizations, users, uoaclasstypes
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
var _ = require('underscore');

var testEnv = {};
testEnv.backendServerDomain = 'http://localhost'; // ToDo: to config

testEnv.api_base          = testEnv.backendServerDomain + ':' + config.port + '/';
testEnv.api               = request.agent(testEnv.api_base + config.pgConnect.adminSchema + '/v0.2');
testEnv.api_created_realm = request.agent(testEnv.api_base + config.testEntities.organization.realm + '/v0.2');

var token;
var obj ={};
var path = '/uoatags';
var pathClassType = '/uoaclasstypes';
var testTitle = 'Subject`s tags (Unit of Analisys Tags): ';

describe(testTitle, function () {

    function userTests(user) {
        describe(testTitle+'All of tests for user `' + user.firstName+'`', function () {
            it('Select: correctly sets the X-Total-Count header ', function (done) {
                ithelper.checkHeaderValue(testEnv.api_created_realm, path, user.token, 200, 'X-Total-Count', 0, done);
            });
            it('Select: true number of records', function (done) {
                ithelper.selectCount(testEnv.api_created_realm, path, user.token, 200, 0, done);
            });
        });
    }

    function adminTests(user) {
        it('CRUD: Create new UOA tag without creating classtype - impossible', function (done) {
            var insertItem = {name: 'Test UOA tag'};
            ithelper.insertOne(testEnv.api_created_realm, path, user.token, insertItem, 400, obj, 'id', done);
        });
        it('CRUD: Create new UOA classtype', function (done) {
            var insertItem = {name: 'Test UOA classtype'};
            ithelper.insertOne(testEnv.api_created_realm, pathClassType, user.token, insertItem, 201, obj, 'classTypeId', done);
        });
        it('CRUD: Create new UOA tag after creating classtype', function (done) {
            var insertItem = {name: 'Test UOA tag', classTypeId: obj.classTypeId};
            ithelper.insertOne(testEnv.api_created_realm, path, user.token, insertItem, 201, obj, 'id', done);
        });
        it('CRUD: True number of records', function (done) {
            ithelper.selectCount(testEnv.api_created_realm, path, user.token, 200, 1, done);
        });
        it('CRUD: Get created UOA tag', function (done) {
            ithelper.selectOneCheckField(testEnv.api_created_realm, path + '/' + obj.id, user.token, 200, null, 'name', 'Test UOA tag', done);
        });
        it('CRUD: Update UOA tag', function (done) {
            var updateItem = {name: 'Test UOA tag --- updated'};
            ithelper.updateOne(testEnv.api_created_realm, path + '/' + obj.id, user.token, updateItem, 202, done);
        });
        it('CRUD: Get updated UOA tag', function (done) {
            ithelper.selectOneCheckField(testEnv.api_created_realm, path + '/' + obj.id, user.token, 200, null, 'name', 'Test UOA tag --- updated', done);
        });
        it('CRUD: Delete created/updated UOA tag', function (done) {
            ithelper.deleteOne(testEnv.api_created_realm, path + '/' + obj.id, user.token, 204, done);
        });
        it('CRUD: True number of records after delete', function (done) {
            ithelper.selectCount(testEnv.api_created_realm, path, user.token, 200, 0, done);
        });
        it('CRUD: Delete created UOA classtype', function (done) {
            ithelper.deleteOne(testEnv.api_created_realm, pathClassType + '/' + obj.classTypeId, user.token, 204, done);
        });
    }

    userTests(config.testEntities.superAdmin);
    adminTests(config.testEntities.superAdmin);
    userTests(config.testEntities.admin);
    adminTests(config.testEntities.admin);
    for (var i = 0; i < config.testEntities.users.length; i++) {
        userTests(config.testEntities.users[i]);
    }

});
