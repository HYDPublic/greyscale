/**
 * Created by igi on 09.11.15.
 */
'use strict';

angular.module('greyscaleApp')
    .controller('LoginCtrl', function ($scope, $state, $stateParams, greyscaleProfileSrv, greyscaleRealmSrv) {
        var _realm = $stateParams.realm;

        if (_realm) {
            greyscaleRealmSrv.init(_realm);
        }

        $scope.model = {
            state: $state.current.name,
            token: $stateParams.token
        };

        greyscaleProfileSrv.getAccessLevel()
            .then(function (_level) {
                if (_level > 1) {
                    $state.go('home', {});
                }
            });
    });
