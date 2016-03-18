/**
 * Created by igi on 16.11.15.
 */
'use strict';

angular.module('greyscale.core')
    .service('greyscaleProfileSrv', function ($q, greyscaleTokenSrv, greyscaleUserApi, greyscaleEntityTypeRoleApi,
        greyscaleUtilsSrv, greyscaleGlobals, i18n, $log, $rootScope) {

        var _profile = null;
        var _profilePromise = null;
        var _userRoles = [];
        var _accessLevel = greyscaleUtilsSrv.getRoleMask(-1, true);
        var _messages = [];
        var _associate = {};
        var _associateArray = [];

        this.isSuperAdmin = _isSuperAdmin;

        this.isAdmin = _isAdmin;

        this.getProfile = function (force) {
            var self = this;

            return greyscaleUserApi.isAuthenticated().then(function (isAuth) {
                var res;

                if (isAuth) {
                    if (_profile && !force) {
                        self._setAccessLevel();
                        res = $q.resolve(_profile);
                    } else {
                        if (!_profilePromise || force) {
                            _profilePromise = greyscaleUserApi.get()
                                .then(function (profileData) {
                                    _profile = profileData;
                                    return _profile;
                                })
                                .then(self._setAccessLevel)
                                /*.then(self._setAssociate)*/
                                .finally(function () {
                                    _profilePromise = null;
                                });
                        }
                        res = _profilePromise;
                    }
                } else {
                    _profile = null;
                    _profilePromise = null;
                    res = $q.reject('not logged in');
                }

                return res;
            });
        };

        this._setAccessLevel = function () {
            if (_profile) {
                _accessLevel = greyscaleUtilsSrv.getRoleMask(_profile.roleID, true);
                $rootScope.checkAccessRole = _checkAccessRole;
                return _profile;
            } else {
                return $q.reject('no user data loaded');
            }
        };

        this.getAccessLevelMask = function () {
            return _accessLevel;
        };

        this.getAccessLevel = function () {
            return this.getProfile()
                .then(this.getAccessLevelMask)
                .catch(function (err) {
                    $log.debug('getAccessLevel says:', err);
                    return greyscaleUtilsSrv.getRoleMask(-1, true);
                });
        };

        this.login = function () {
            return this.getProfile(true);
        };

        this.logout = function () {
            return greyscaleUserApi.logout().finally(function () {
                greyscaleTokenSrv(null);
                _profile = null;
                _profilePromise = null;
                _accessLevel = greyscaleUtilsSrv.getRoleMask(-1, true);
            });
        };

        function _isSuperAdmin() {
            return (_accessLevel & greyscaleGlobals.userRoles.superAdmin.mask) === greyscaleGlobals.userRoles.superAdmin.mask;
        }

        function _isAdmin() {
            return (_accessLevel & greyscaleGlobals.userRoles.admin.mask) === greyscaleGlobals.userRoles.admin.mask;
        }

        function _checkAccessRole() {
            if (!_profile) {
                return;
            }
            var checkRoles = Array.from(arguments);
            var hasAccess = false;
            angular.forEach(checkRoles, function (role) {
                if (hasAccess) {
                    return;
                }
                if (role === 'nobody') {
                    return;
                }
                if (role === 'all') {
                    hasAccess = true;
                    return;
                }
                var roleData = greyscaleGlobals.userRoles[role];
                if (!roleData) {
                    throw 'Unknown role "' + role + '"!';
                }
                if (roleData.id === _profile.roleID) {
                    hasAccess = true;
                }
            });
            return hasAccess;
        }
    });
