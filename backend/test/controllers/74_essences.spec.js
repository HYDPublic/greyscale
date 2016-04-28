/**
 * Essences tests
 *
 * prerequsites tests: organizations, users
 *
 * used entities: organization, users, essences
 *
 //[ see essencesContent ];
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
var path = '/essences';
var essencesContent = [
    {
        tableName:'Products',
        name:'Products',
        fileName:'products',
        nameField:'title'
    },
    {
        tableName:'UnitOfAnalysisType',
        name:'UnitOfAnalysisType',
        fileName:'uoatypes',
        nameField:'name'
    },
    {
        tableName:'UnitOfAnalysis',
        name:'UnitOfAnalysis',
        fileName:'uoas',
        nameField:'name'
    },
    {
        tableName:'UnitOfAnalysisClassType',
        name:'UnitOfAnalysisClassType',
        fileName:'uoaclasstypes',
        nameField:'name'
    },
    {
        tableName:'UnitOfAnalysisTag',
        name:'UnitOfAnalysisTag',
        fileName:'uoatags',
        nameField:'name'
    },
    {
        tableName:'Projects',
        name:'projects',
        fileName:'projects',
        nameField:'codeName'
    },
    {
        tableName:'Discussions',
        name:'Discussions',
        fileName:'discussions',
        nameField:'name'
    },
    {
        tableName:'Users',
        name:'Users',
        fileName:'users',
        nameField:'email'
    },
    {
        tableName:'Surveys',
        name:'Surveys',
        fileName:'surveys',
        nameField:'title'
    },
    {
        tableName:'SurveyQuestions',
        name:'Survey Questions',
        fileName:'survey_questions',
        nameField:'label'
    },
    {
        tableName:'SurveyQuestionOptions',
        name:'Survey Question Options',
        fileName:'survey_question_options',
        nameField:'label'
    },
    {
        tableName:'SurveyAnswers',
        name:'Survey Answers',
        fileName:'survey_answers',
        nameField:'value'
    },
    {
        tableName:'Groups',
        name:'Groups',
        fileName:'groups',
        nameField:'title'
    },
    {
        tableName:'Organizations',
        name:'Organizations',
        fileName:'organizations',
        nameField:'name'
    },
    {
        tableName:'Tasks',
        name:'Tasks',
        fileName:'tasks',
        nameField:'title'
    },
    {
        tableName:'WorflowSteps',
        name:'WorflowSteps',
        fileName:'worflowSteps',
        nameField:'title'
    },
    {
        tableName:'Notifications',
        name:'notifications',
        fileName:'notifications',
        nameField:'body'
    },
    {
        tableName:'ProductUOA',
        name:'productUoa',
        fileName:'product_uoa',
        nameField:'productId'
    },
    {
        tableName:'Indexes',
        name:'Indexes',
        fileName:'indexes',
        nameField:'title'
    },
    {
        tableName:'Subindexes',
        name:'Subindexes',
        fileName:'subindexes',
        nameField:'title'
    },
    {
        tableName:'IndexQuestionWeights',
        name:'IndexQuestionWeights',
        fileName:'index_question_weights',
        nameField:'type'
    },
    {
        tableName:'IndexSubindexWeights',
        name:'IndexSubindexWeights',
        fileName:'index_subindex_weights',
        nameField:'type'
    },
    {
        tableName:'SubindexWeights',
        name:'SubindexWeights',
        fileName:'subindex_weights',
        nameField:'type'
    },
    {
        tableName:'UnitOfAnalysisTagLink',
        name:'UnitOfAnalysisTagLink',
        fileName:'uoataglinks',
        nameField:'id'
    },
    {
        tableName:'Translations',
        name:'Translations',
        fileName:'translations',
        nameField:'field'
    },
    {
        tableName:'Roles',
        name:'Roles',
        fileName:'roles',
        nameField:'name'
    },
    {
        tableName:'Rights',
        name:'Rights',
        fileName:'rights',
        nameField:'action'
    },
    {
        tableName:'RoleRights',
        name:'RoleRights',
        fileName:'role_rights',
        nameField:'roleId'
    },
    {
        tableName:'Workflows',
        name:'Workflows',
        fileName:'workflows',
        nameField:'name'
    },
    {
        tableName:'WorfklowSteps',
        name:'WorkflowSteps',
        fileName:'workflow_steps',
        nameField:'title'
    },
    {
        tableName:'WorfklowStepGroups',
        name:'WorkflowStepGroups',
        fileName:'workflow_step_groups',
        nameField:'stepId'
    },
    {
        tableName:'Visualizations',
        name:'Visualizations',
        fileName:'visualizations',
        nameField:'title'
    },
    {
        tableName:'AccessMatrices',
        name:'AccessMatrices',
        fileName:'access_matrices',
        nameField:'name'
    },
    {
        tableName:'AccessPermissions',
        name:'AccessPermissions',
        fileName:'access_permissions',
        nameField:'id'
    },
    {
        tableName:'AnswerAttachments',
        name:'AnswerAttachments',
        fileName:'answer_attachments',
        nameField:'filename'
    },
    {
        tableName:'Token',
        name:'Token',
        fileName:'token',
        nameField:'realm'
    },
    {
        tableName:'UserUOA',
        name:'UserUOA',
        fileName:'user_uoa',
        nameField:'UserId'
    },
    {
        tableName:'UserGroups',
        name:'UserGroups',
        fileName:'user_groups',
        nameField:'UserId'
    }
];
var numberOfRecords = essencesContent.length;
var testTitle = 'Essences: ';

describe(testTitle, function () {

    function userTests(user) {
        describe(testTitle+'All of tests for user `' + user.firstName+'`', function () {
            it('Select true number of records', function (done) {
                ithelper.selectCount(testEnv.api_created_realm, path, user.token, 200, numberOfRecords, done);
            });

            it('Select initial content', function (done) {
                ithelper.selectCheckAllRecords(testEnv.api_created_realm, path+'?order=id', user.token, 200, essencesContent, done);
            });
        });
    }

    function adminTests(user) {
        describe(testTitle+'All of tests for admin `' + user.firstName+'`', function () {
            it('(Err) Create new Essence - "tableName, name, fileName and nameField fields are required"', function (done) {
                ithelper.insertOneErrMessage(
                    testEnv.api_created_realm,
                    path,
                    user.token,
                    {},
                    400,
                    403,
                    'tableName, name, fileName and nameField fields are required',
                    done
                );
            });
            it('(Err) Create new Essence - "record with this tableName or(and) fileName has already exist"', function (done) {
                ithelper.insertOneErrMessage(
                    testEnv.api_created_realm,
                    path,
                    user.token,
                    {
                        tableName:'Logs',
                        name:'logs',
                        fileName:'products',
                        nameField:'id'
                    },
                    400,
                    403,
                    'record with this tableName or(and) fileName has already exist',
                    done
                );
            });
            it('(Err) Create new Essence - "Cannot find model file"', function (done) {
                ithelper.insertOneErrMessage(
                    testEnv.api_created_realm,
                    path,
                    user.token,
                    {
                        tableName:'Logs',
                        name:'logs',
                        fileName:'logs*',
                        nameField:'id'
                    },
                    400,
                    403,
                    'Cannot find model file',
                    done
                );
            });
            it('(Err) Create new Essence - "Essence does not have"', function (done) {
                ithelper.insertOneErrMessage(
                    testEnv.api_created_realm,
                    path,
                    user.token,
                    {
                        tableName:'Logs',
                        name:'logs',
                        fileName:'logs',
                        nameField:'id*'
                    },
                    400,
                    403,
                    'Essence does not have',
                    done
                );
            });
            it('CRUD: Create new Essence - "Logs"', function (done) {
                ithelper.insertOne(
                    testEnv.api_created_realm,
                    path,
                    user.token,
                    {
                        tableName:'Logs',
                        name:'logs',
                        fileName:'logs',
                        nameField:'id'
                    },
                    201,
                    obj,
                    'id',
                    done
                );
                numberOfRecords++;
                essencesContent.push(
                    {
                        tableName:'Logs',
                        name:'logs',
                        fileName:'logs',
                        nameField:'id'
                    }
                );
            });
            it('CRUD: Get created Essence', function (done) {
                ithelper.selectOneCheckFields(
                    testEnv.api_created_realm,
                    path + '?tableName=Logs',
                    user.token,
                    200,
                    0,
                    {
                        tableName:'Logs',
                        name:'logs',
                        fileName:'logs',
                        nameField:'id'
                    },
                    done
                );
            });
            it('CRUD: True number of records after insert', function (done) {
                ithelper.selectCount(testEnv.api_created_realm, path, user.token, 200, numberOfRecords, done);
            });
            it('Select new content', function (done) {
                ithelper.selectCheckAllRecords(testEnv.api_created_realm, path+'?order=id', user.token, 200, essencesContent, done);
            });
            it('Delete essence', function (done) {
                ithelper.deleteOne(testEnv.api_created_realm, path+'/' + obj.id, user.token, 204, done);
                    essencesContent.splice(-1,1);
                    numberOfRecords--;
            });
            it('Select content after deleting = initial content', function (done) {
                ithelper.selectCheckAllRecords(testEnv.api_created_realm, path+'?order=id', user.token, 200, essencesContent, done);
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