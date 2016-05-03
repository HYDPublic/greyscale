/**
 * Unit of Analisys tests
 *
 * prerequsites tests: organizations, users, uoatypes
 *
 * used entities: organization, users, uoatype (Country)
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
var path = '/uoas';
var numberOfRecords = 0;
var testTitle = 'Subjects (Units of Analisys): ';

describe(testTitle, function () {

    function userTests(user) {
        describe(testTitle+'All of tests for user `' + user.firstName+'`', function () {
            it('Select: correctly sets the X-Total-Count header ', function (done) {
                ithelper.checkHeaderValue(testEnv.api_created_realm, path, user.token, 200, 'X-Total-Count', numberOfRecords, done);
            });
            it('Select: True number of records', function (done) {
                ithelper.selectCount(testEnv.api_created_realm, path, user.token, 200, numberOfRecords, done);
            });
        });
    }

    function adminTests(user) {
        describe(testTitle+'All of tests for admin `' + user.firstName+'`', function () {
            describe(testTitle+'Errors creating uoas ', function () {
                it('Create new UOA tag without specifing `Type` - impossible', function (done) {
                    var insertItem = {name: 'Test UOA'};
                    ithelper.insertOneErr(testEnv.api_created_realm, path, user.token, insertItem, 400, '23502', done);
                });
                it('Create new UOA tag without specifing `Name` - impossible', function (done) {
                    var insertItem = {unitOfAnalysisType: 1};
                    ithelper.insertOneErr(testEnv.api_created_realm, path, user.token, insertItem, 400, '23502', done);
                });
            });
            describe(testTitle+'CRUD', function () {
                it('Create new UOA', function (done) {
                    var insertItem = {name: 'Test Subject New', unitOfAnalysisType: 1};
                    ithelper.insertOne(testEnv.api_created_realm, path, user.token, insertItem, 201, obj, 'uoaId', done);
                    numberOfRecords++;
                });
                it('True number of records', function (done) {
                    ithelper.selectCount(testEnv.api_created_realm, path, user.token, 200, numberOfRecords, done);
                });
                it('Create not unique UOA -impossible', function (done) {
                    //"e": "23502",
                    //повторяющееся значение ключа нарушает ограничение уникальности "UnitOfAnalysis_name_key"
                    var insertItem = {name: 'Test Subject New', unitOfAnalysisType: 1};
                    ithelper.insertOneErr(testEnv.api_created_realm, path, user.token, insertItem, 400, '23505', done);
                });
                it('Get created UOA', function (done) {
                    ithelper.selectOneCheckField(testEnv.api_created_realm, path + '/' + obj.uoaId, user.token, 200, null, 'name', 'Test Subject New', done);
                });
                it('Update UOA', function (done) {
                    var updateItem = {name: 'Test Subject'};
                    ithelper.updateOne(testEnv.api_created_realm, path + '/' + obj.uoaId, user.token, updateItem, 202, done);
                });
                it('Get updated UOA', function (done) {
                    ithelper.selectOneCheckField(testEnv.api_created_realm, path + '/' + obj.uoaId, user.token, 200, null, 'name', 'Test Subject', done);
                });
                it('Delete created/updated UOA', function (done) {
                    ithelper.deleteOne(testEnv.api_created_realm, path + '/' + obj.uoaId, user.token, 204, done);
                    numberOfRecords--;
                });
                it('True number of records after test is completed', function (done) {
                    ithelper.selectCount(testEnv.api_created_realm, path, user.token, 200, numberOfRecords, done);
                });
            });
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
