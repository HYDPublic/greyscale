var sql = require('sql');

var columns = [
    'id',
    'organizationId',
    'codeName',
    'description',
    'created',
    'matrixId',
    'startTime',
    'status',
    'closeTime'
];

var Project = sql.define({
    name: 'Projects',
    columns: columns
});

Project.statuses = [
    0, //active
    1 //inactive
];

Project.whereCol = columns;

Project.translate = [
    'codeName',
    'description'
];

module.exports = Project;
