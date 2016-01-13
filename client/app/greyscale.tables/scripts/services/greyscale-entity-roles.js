/**
 * Created by igi on 28.12.15.
 */
"use strict";
angular.module('greyscale.tables')
    .factory('greyscaleEntityRoles', function ($q, _, greyscaleUtilsSrv, greyscaleProfileSrv, greyscaleModalsSrv,
                                               greyscaleEntityTypeRoleSrv, greyscaleUserSrv, greyscaleRoleSrv,
                                               greyscaleEntityTypeSrv, greyscaleRestSrv) {
        var _dicts = {
            users: [],
            roles: [],
            entTypes: [],
            ents: {}
        };

        var _tableRestSrv = greyscaleEntityTypeRoleSrv;

        var _fields = [
            {
                field: 'roleId',
                show: true,
                title: 'Role',
                dataRequired: true,
                dataFormat: 'option',
                dataSet: {
                    keyField: 'id',
                    valField: 'name',
                    getData: getRoles
                }
            },
            {
                field: 'userId',
                show: true,
                title: 'User',
                dataRequired: true,
                dataFormat: 'option',
                dataSet: {
                    keyField: 'id',
                    valField: 'email',
                    getData: getUsers
                }
            },
            {
                field: 'essenceId',
                show: true,
                title: 'Entity Type',
                dataReadOnly: 'both',
                dataRequired: true,
                dataFormat: 'option',
                dataSet: {
                    keyField: 'id',
                    valField: 'name',
                    getData: getEntityTypes
                }
            },
            {
                field: 'entityId',
                show: true,
                title: 'Entity Title',
                dataRequired: true,
                dataFormat: 'option',
                dataSet: {
                    keyField: 'id',
                    valField: 'title',
                    dataPromise: getEntity
                }
            },
            {
                field: '',
                title: '',
                show: true,
                dataFormat: 'action',
                actions: [
                    {
                        icon: 'fa-pencil',
                        class: 'info',
                        handler: _editRecord
                    },
                    {
                        icon: 'fa-trash',
                        class: 'danger',
                        handler: _delRecord
                    }
                ]
            }
        ];

        var _table = {
            dataFilter: {},
            title: 'Project roles',
            formTitle: 'project role',
            /*
             formTitle: 'entity role',
             title: 'Entity roles',
             */
            icon: 'fa-group',
            cols: _fields,
            dataPromise: getData,
            pageLength: 10,
            add: {
                title: 'Add',
                handler: _editRecord
            }

        };

        function getUsers() {
            return _dicts.users;
        }

        function getRoles() {
            return _dicts.roles;
        }

        function getEntityTypes() {
            return _dicts.entTypes;
        }

        function getEntity(rec) {
            var dicId = rec.essenceId;
            var res = [];
            if (!_dicts.ents[dicId]) {
                _dicts.ents[dicId] = {
                    promise: greyscaleEntityTypeSrv.get(rec.essenceId)
                        .then(function (eType) {
                            var apiName = eType[0].fileName;
                            var fieldName = eType[0].nameField;
                            var params = {
                                fields: 'id,' + fieldName
                            };

                            return greyscaleRestSrv().one(apiName)
                                .get(params)
                                .then(function (items) {
                                    var res = [];
                                    for (var i = 0; i < items.length; i++) {
                                        res.push(
                                            {
                                                id: items[i].id,
                                                title: items[i][fieldName]
                                            }
                                        );
                                    }
                                    _dicts.ents[dicId].data = res;
                                    return _dicts.ents[dicId].data;
                                });
                        }),
                    data: null
                };
                res = _dicts.ents[dicId].promise;
            } else if (!_dicts.ents[dicId].data) {
                res = _dicts.ents[dicId].promise;
            } else {
                res = $q.resolve(_dicts.ents[dicId].data);
            }
            return res;
        }

        function _delRecord(rec) {
            _tableRestSrv.delete(rec.id)
                .then(reloadTable)
                .catch(function (err) {
                    errorHandler(err, 'deleting');
                });
        }

        function _editRecord(rec) {
            var action = (typeof rec === 'undefined') ? 'adding' : 'editing';
            if (!rec) {
                rec = {};
            }
            rec = angular.extend(rec, _table.dataFilter);
            return greyscaleModalsSrv.editRec(rec, _table)
                .then(function (newRec) {
                    if (action === 'editing') {
                        return _tableRestSrv.update(newRec);
                    } else {
                        return _tableRestSrv.add(newRec);
                    }
                })
                .then(reloadTable)
                .catch(function (err) {
                    errorHandler(err, action);
                });
        }

        function getData() {
            return greyscaleEntityTypeSrv.list({fields: 'id,name'}).then(function (types) {
                _table.dataFilter = {essenceId: _.get(_.find(types, {name: 'projects'}), 'id')};
                return greyscaleProfileSrv.getProfile()
                    .then(function (profile) {
                        var reqs = {
                            data: _tableRestSrv.list(_table.dataFilter),
                            users: greyscaleUserSrv.list({organizationId: profile.organizationId}),
                            roles: greyscaleRoleSrv.list({isSystem: false}),
                            entTypes: greyscaleEntityTypeSrv.list()
                        };

                        return $q.all(reqs).then(function (promises) {
                            _dicts.users = promises.users;
                            _dicts.roles = promises.roles;
                            _dicts.entTypes = promises.entTypes;

                            greyscaleUtilsSrv.prepareFields(promises.data, _fields);
                            return promises.data;
                        });
                    })
                    .catch(errorHandler);
            });
        }

        function reloadTable() {
            _table.tableParams.reload();
        }

        function errorHandler(err, action) {
            var msg = _table.formTitle;
            if (action) {
                msg += ' ' + action;
            }
            msg += ' error';
            greyscaleUtilsSrv.errorMsg(err, msg)
        }

        return _table;
    });