var sql = require('sql');

var Log = sql.define({
    name: 'Logs',
    columns: [
        'id',
        'created',
        'userid',
        'action',
        'essence',
        'entity',
        'entities',
        'quantity',
        'info',
        'error',
        'result'
    ]
});
Log.insertCols = [
    'id',
    'created',
    'userid',
    'action',
    'essence',
    'entity',
    'entities',
    'quantity',
    'info',
    'error',
    'result'
];

module.exports = Log;
