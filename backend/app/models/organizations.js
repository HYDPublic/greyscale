var sql = require('sql');

var columns = [
    'id',
    'name',
    'address',
    'adminUserId',
    'url',
    'enforceApiSecurity',
    'isActive',
    'realm'
];

var Organization = sql.define({
    name: 'Organizations',
    columns: columns
});

Organization.editCols = ['name','address','url','adminUserId','enforceApiSecurity','isActive'];

Organization.whereCol = columns;

Organization.translate = ['name', 'address'];

module.exports = Organization;
