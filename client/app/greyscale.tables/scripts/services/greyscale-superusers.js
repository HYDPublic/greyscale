/**
 * Created by igi on 23.12.15.
 */
'use strict';

angular.module('greyscale.tables')
    .factory('greyscaleSuperusersTbl', function (_, $q, greyscaleModalsSrv, greyscaleUserApi, greyscaleGroupApi, greyscaleUtilsSrv,
        greyscaleProfileSrv, greyscaleGlobals, greyscaleRoleApi, i18n, greyscaleNotificationApi, inform) {
        var accessLevel;

        var tns = 'USERS.';

        var dicts = {};

        var _fields = [{
            field: 'id',
            title: 'ID',
            show: false,
            sortable: 'id',
            dataReadOnly: 'both',
            dataHide: _isProfileEdit
        }, {
            field: 'email',
            title: tns + 'EMAIL',
            show: false,
            sortable: 'email',
            dataRequired: true
        }, {
            field: 'firstName',
            title: tns + 'FIRST_NAME',
            show: true,
            sortable: 'firstName',
            dataRequired: true
        }, {
            field: 'lastName',
            title: tns + 'LAST_NAME',
            show: true,
            sortable: 'lastName'
        }, {
            field: 'lastActive',
            title: tns + 'LAST_ACTIVE',
            show: true,
            sortable: 'lastActive',
            dataReadOnly: 'both',
            cellTemplate: '<span ng-hide="cell" translate="USERS.NOT_LOGGED"></span>{{cell|date:\'medium\'}}'
        }, {
            field: 'isActive',
            title: tns + 'IS_ACTIVE',
            show: true,
            sortable: 'isActive',
            dataFormat: 'boolean',
            dataReadOnly: 'new'
        }, {
            field: 'isAnonymous',
            title: tns + 'ANONYMOUS',
            show: true,
            sortable: 'isAnonymous',
            dataFormat: 'boolean'
        }, {
            title: '',
            show: false,
            dataHide: true,
            cellTemplate: '<span ng-show="!row.isActive"><a ng-click="ext.resendActivation(row)" class="btn btn-primary" translate="' + tns + 'RESEND_ACTIVATION"></a></span>',
            cellTemplateExtData: {
                resendActivation: _resendActivation
            }
        }, {
            title: 'COMMON.SEND_MESSAGE',
            viewHide: true,
            cellTemplate: '<div class="text-center">' +
                '   <a ng-click="ext.sendMessageTo(row); $event.stopPropagation()" class="action">' +
                '       <i ng-if="ext.anotherUser(row)" class="fa fa-envelope"></i>' +
                '   </a></div>',
            dataHide: true,
            cellTemplateExtData: {
                anotherUser: _isAnotherUser,
                sendMessageTo: _sendMessageTo
            }
        }, {
            field: '',
            title: '',
            show: true,
            dataFormat: 'action',
            actions: [{
                icon: 'fa-pencil',
                tooltip: 'COMMON.EDIT',
                handler: _editRecord
            }, {
                icon: 'fa-lock',
                tooltip: tns + 'CHANGE_PASSWORD',
                handler: _changePassword
            }, {
                icon: 'fa-trash',
                tooltip: 'COMMON.DELETE',
                handler: _delRecord
            }]
        }];

        var _table = {
            dataFilter: {},
            formTitle: tns + 'USER',
            cols: _fields,
            dataPromise: _getUsers,
            pageLength: 10,
            showAllButton: true,
            selectable: true,
            sorting: {
                created: 'desc'
            },
            add: {
                handler: _editRecord
            }
        };

        function _getRoles() {
            if (_isSuperAdmin()) {
                return dicts.roles;
            } else {
                return _.filter(dicts.roles, function (o) {
                    return o.id >= dicts.profile.roleID;
                });
            }
        }

        function _getGroups(user) {
            return _.map(_.filter(dicts.groups, function (o) {
                return ~user.usergroupId.indexOf(o.id);
            }), 'title').join(', ');
        }

        function _delRecord(rec) {
            greyscaleModalsSrv.confirm({
                message: tns + 'DELETE_CONFIRM',
                user: rec,
                okType: 'danger',
                okText: 'COMMON.DELETE'
            }).then(function () {
                greyscaleUserApi.delete(rec.id)
                    .then(reloadTable)
                    .catch(function (err) {
                        errorHandler(err, 'deleting');
                    });
            });
        }

        function _isAnotherUser(user) {
            return user.id !== dicts.profile.id;
        }

        function _sendMessageTo(user) {
            greyscaleModalsSrv.sendNotification(user);
        }

        function _changePassword(user) {
            greyscaleModalsSrv.changePassword(user);
        }

        function _editRecord(user) {
            var action = 'adding';
            return greyscaleModalsSrv.editRec(user, _table)
                .then(function (newRec) {
                    if (newRec.password) {
                        delete(newRec.password);
                    }
                    if (newRec.id) {
                        action = 'editing';
                        return greyscaleUserApi.update(newRec);
                    } else {
                        newRec.organizationId = _getOrganizationId();
                        if (_isSuperAdmin()) {
                            return greyscaleUserApi.inviteAdmin(newRec);
                        } else if (_isAdmin()) {
                            return greyscaleUserApi.inviteUser(newRec);
                        }
                    }
                })
                .then(reloadTable)
                .catch(function (err) {
                    errorHandler(err, action);
                });
        }

        function _resendActivation(user) {
            greyscaleNotificationApi.resendUserInvite(user.id)
                .then(function () {
                    inform.add(i18n.translate(tns + 'RESEND_ACTIVATION_DONE'), {
                        type: 'success'
                    });
                })
                .catch(function (err) {
                    greyscaleUtilsSrv.errorMsg(err, 'Resend Activation');
                });
        }

        function _editGroups(user) {
            greyscaleModalsSrv.userGroups(user)
                .then(function (selectedGroupIds) {
                    user.usergroupId = selectedGroupIds;
                    greyscaleUserApi.update(user);
                });
        }

        function reloadTable() {
            _table.tableParams.reload();
        }

        function _isSuperAdmin() {
            return ((accessLevel & greyscaleGlobals.userRoles.superAdmin.mask) !== 0);
        }

        function _isAdmin() {
            return ((accessLevel & greyscaleGlobals.userRoles.admin.mask) !== 0);
        }

        function _getOrganizationId() {
            return _table.dataFilter.organizationId;
        }

        function _getUsers() {

            return greyscaleProfileSrv.getProfile().then(function (profile) {

                dicts.profile = profile;

                var reqs = {
                    users: greyscaleUserApi.list({}, 'public'),
                };

                return $q.all(reqs).then(function (promises) {
                    greyscaleUtilsSrv.prepareFields(promises.users, _fields);
                    return promises.users;
                });

            }).catch(errorHandler);
        }

        function _addTitles(roles) {
            angular.forEach(roles, function (role) {
                role.title = i18n.translate('GLOBALS.ROLES.' + role.name.toUpperCase());
            });
            return roles;
        }

        function errorHandler(err, action) {
            var msg = _table.formTitle;
            if (action) {
                msg += ' ' + action;
            }
            msg += ' error';
            greyscaleUtilsSrv.errorMsg(err, msg);
        }

        function _isProfileEdit() {
            return (!!_table.profileMode);
        }

        return _table;
    });