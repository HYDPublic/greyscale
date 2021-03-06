/**
 * Created by igi on 23.12.15.
 */
'use strict';

angular.module('greyscale.rest')
    .factory('greyscaleProjectApi', function (greyscaleRestSrv) {
        function api(realm) {
            return greyscaleRestSrv({}, realm).one('projects');
        }

        function _productsApi(projectId, realm) {
            return api(realm).one(projectId + '').one('products');
        }

        function _surveysApi(projectId) {
            return api().one(projectId + '').one('surveys');
        }

        function _list(params) {
            return api().get(params);
        }

        function _get(id, params) {
            return api().one(id + '').get(params);
        }

        function _add(project) {
            return api().customPOST(project);
        }

        function _upd(project) {
            return api().one(project.id + '').customPUT(project);
        }

        function _del(id) {
            return api().one(id + '').remove();
        }

        function _productsList(projectId, params, realm) {
            return _productsApi(projectId, realm).get(params);
        }

        function _surveysList(projectId, params) {
            return _surveysApi(projectId).get(params);
        }

        return {
            list: _list,
            get: _get,
            add: _add,
            update: _upd,
            delete: _del,
            productsList: _productsList,
            surveysList: _surveysList
        };
    });
