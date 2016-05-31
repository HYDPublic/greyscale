var sql = require('sql');

var Comment = sql.define({
    name: 'Comments',
    columns: [
        'id',
        'taskId',
        'questionId',
        'userFromId',
        'userId',
        'stepId',
        'stepFromId',
        'order',
        'entry',
        'isReturn',
        'isResolve',
        'returnTaskId',
        'created',
        'updated',
        'activated',
        'tags',
        'range',
        'commentType'
    ]
});

Comment.insertCols = [
    'taskId',
    'questionId',
    'userFromId',
    'userId',
    'stepId',
    'stepFromId',
    'order',
    'entry',
    'isReturn',
    'isResolve',
    'returnTaskId',
    'activated',
    'tags',
    'range',
    'commentType'
];

Comment.updateCols = [
    'entry',
    'updated',
    'tags',
    'range',
    'commentType'
];

module.exports = Comment;
