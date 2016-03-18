/**
 * Created by igi on 29.02.16.
 */
'use strict';
angular.module('greyscaleApp')
    .directive('attachments', function ($log) {
        return {
            restrict: 'AE',
            scope: {
                answerId: '@',
                model: '=model',
                options: '='
            },
            template: '<div class="panel attachments"><p translate="SURVEYS.ATTACHMENTS" class="panel-title"></p>' +
                '<div class="panel-body"><div class="row">' +
                '<attached-file attached-item="item" ng-repeat="item in model track by $index" remove-file="remove($index)"></attached-file>' +
                '</div><form ng-show="!uploader.progress" class="row"><input type="file" class="form-control input-file" name="file" nv-file-select uploader="uploader" ng-hide="options.readonly">' +
                '</form>' +
                '<div class="progress" ng-if="uploader.progress">' +
                '  <div class="progress-bar" role="progressbar" ng-style="{ \'width\': uploader.progress + \'%\' }"></div>' +
                '</div>' +
                '</div></div>',

            controller: function ($scope, $element, greyscaleUtilsSrv, FileUploader, $timeout, greyscaleTokenSrv, greyscaleAttachmentApi) {
                var _url = greyscaleUtilsSrv.getApiBase() + '/attachments',
                    _token = greyscaleTokenSrv();

                $scope.remove = removeAttach;

                $scope.inProgress = [];

                var uploader = $scope.uploader = new FileUploader({
                    url: _url,
                    withCredentials: false,
                    method: 'POST',
                    removeAfterUpload: true,
                    autoUpload: true
                });

                uploader.onBeforeUploadItem = function (item) {
                    item.headers.token = _token;
                    item.formData = [{
                        answerId: $scope.answerId
                    }];
                    item.idx = $scope.inProgress.length;
                    $scope.inProgress.push(item);
                };

                uploader.onCompleteItem = function (item, data) {
                    if (!item.isError) {
                        $log.debug('completed', item, data);
                        $scope.model.push({
                            id: data.id,
                            filename: item.file.name,
                            mimeType: item.file.mimetype
                        });
                    }

                    uploader.clearQueue();
                    $element.find('form')[0].reset();
                    $scope.inProgress.splice(item.idx, 1);
                    $timeout(function () {
                        $scope.$digest();
                    });
                };

                uploader.onErrorItem = function (file, response, status, headers) {
                    greyscaleUtilsSrv.errorMsg(response || 'File too big', 'Upload file');
                };

                function removeAttach(idx) {
                    var deleted = $scope.model.splice(idx, 1);
                    greyscaleAttachmentApi.delete(deleted[0].id)
                        .catch(function(err){
                            greyscaleUtilsSrv.errorMsg(err, 'Delete attachment');
                        });
                }
            }
        };
    });
