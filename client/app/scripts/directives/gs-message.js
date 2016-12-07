/**
 * Created by igi on 16.02.16.
 */
'use strict';
angular.module('greyscaleApp')
    .directive('gsMessage', function (i18n, greyscaleUtilsSrv, greyscaleModalsSrv, greyscaleSelection, $timeout,
        greyscaleProfileSrv, greyscaleCommentApi, $sce, $window) {
        var _associate = [];
        return {
            restrict: 'A',
            scope: {
                model: '=gsMessage',
                associate: '=',
                options: '=',
                edit: '&?',
                remove: '&?',
                update: '&?'
            },
            templateUrl: 'views/directives/gs-message.html',
            controller: function ($scope) {
                var _isAdmin = greyscaleProfileSrv.isAdmin();
                $scope.isEdit = false;
                $scope.entry = '';
                $scope.getUserName = function (userId) {
                    return $scope.model.fromUserFullName || _getUserName(userId || $scope.model.userFromId);
                };

                $scope.model.created = $scope.model.created ? $scope.model.created : new Date();
                $scope.isAdmin = _isAdmin;
                $scope.showToggleComment = _showToggleComment;
                $scope.hlSource = function () {
                    _highlightSource($scope);
                };

                if (!$scope.edit || typeof $scope.edit !== 'function') {
                    $scope.edit = function () {
                        $scope.entry = $scope.model.entry;
                        _toggleEdit();
                    };
                }

                $scope.apply = function () {
                    var _backup = $scope.model.entry;
                    $scope.model.entry = $scope.entry;
                    if (typeof $scope.update === 'function') {
                        $scope.update()
                            .catch(function (err) {
                                $scope.model.entry = _backup;
                                greyscaleUtilsSrv.errorMsg(err);
                            })
                            .finally(_toggleEdit);
                    } else {
                        _toggleEdit();
                    }
                };

                $scope.cancel = _toggleEdit;

                $scope.fullview = function () {
                    greyscaleModalsSrv.fullScreenComment($scope.model, $scope.options);
                };

                $scope.resolveFlag = function () {
                    if ($scope.model.isResolve) {
                        return;
                    }
                    var _newComment = {
                        taskId: $scope.model.taskId,
                        stepId: null,
                        questionId: $scope.model.questionId,
                        entry: $scope.model.entry,
                        range: $scope.model.range,
                        tags: $scope.model.tags,
                        commentType: $scope.model.commentType,
                        isReturn: false,
                        isResolve: true,
                        returnTaskId: $scope.model.id
                    };
                    greyscaleCommentApi.add(_newComment).then(function (result) {
                        $scope.model.isResolve = true;
                    });
                };

                $scope.toggleComment = function () {
                    //hide $scope.model
                    greyscaleCommentApi
                        .hide($scope.model.taskId, $scope.model.id, $scope.model.isHidden)
                        .then(function () {
                            $scope.model.isHidden = !$scope.model.isHidden;
                        });
                };

                function _toggleEdit() {
                    $scope.isEdit = !$scope.isEdit;
                }

                _associate = $scope.associate;

                function _showToggleComment() {
                    return _isAdmin && !$scope.options.isVersion && $scope.model.activated;
                }

            },
            link: function (scope, elem) {

                scope.$watch('model', function () {

                    if (scope.model) {
                        scope.model.fromUserFullName = _getUserName(scope.model.userFromId);
                    }
                    /*
                     var msgBody = (elem.find('.gs-message-body'));

                     msgBody.find('.gs-message-fader')
                     .on('click', function (e) {
                     _highlightSource(scope.model, e.type);
                     });
                     */
                });

                scope.getHtml = function (html) {
                    return $sce.trustAsHtml(html);
                };
            }
        };

        function _highlightSource(scope) {
            var _section = angular.element('#Q' + scope.model.questionId).closest('.panel'),
                startNode,
                range = scope.model.range,
                _html,
                _sectionContainer;

            if (_section.length) {
                _section = angular.element(_section[0]);
                _sectionContainer = _section.find('#Q' + scope.model.questionId);
                startNode = greyscaleSelection.restore(_sectionContainer[0], range);
                _html = greyscaleSelection.html(true);

                if (_isSameQuotes(_html, range.entry) && startNode) {
                    scope.options.section.sectionOpen = true;
                    $timeout(function () {
                        var _container = _section.find('.ta-text'),
                            _tb = _section.find('.ta-toolbar'),
                            _startNode, parent, scrollPos;

                        _startNode = greyscaleSelection.restore(
                            _container.length > 0 ? _container[0] : _sectionContainer[0], range);

                        parent = _startNode.parentNode;

                        scrollPos = parent.getBoundingClientRect().top + $window.scrollY - 15;
                        if (_tb.length > 0) {
                            scrollPos -= _tb[0].clientHeight;
                        }
                        $window.scrollTo($window.scrollX, scrollPos);
                    }, 100);
                } else {
                    _notifyEditedQuote();
                }
            } else {
                _notifyEditedQuote();
            }
        }

        function _isSameQuotes(s1, s2) {
            var _e1 = s1 ? angular.element(s1).text() || '' : '',
                _e2 = s2 ? angular.element(s2).text() || '' : '';
            return _e1 === _e2;
        }

        function _notifyEditedQuote() {
            greyscaleUtilsSrv.warningMsg('COMMENTS.QUOTE_CHANGED');
        }

        function _getUser(userId) {
            var user = _associate ? _associate[userId] : null;
            if (!user) {
                user = {
                    userId: userId,
                    firstName: i18n.translate('USERS.ANONYMOUS'),
                    lastName: '',
                    stepName: ''
                };
            }
            return user;
        }

        function _getUserName(userId) {
            return greyscaleUtilsSrv.getUserName(_getUser(userId));
        }
    });
/* message object
 {
 "id": 2,
 "taskId": 14,
 "questionId": 2,
 "userId": 2,
 "entry": "blablabla",
 "isReturn": true,
 "created": "2016-05-16T13:26:32.293Z",
 "updated": "2016-05-16T13:45:00.585Z",
 "isResolve": true,
 "order": 1,
 "returnTaskId": 6,
 "userFromId": 2,
 "stepId": 9,
 "stepFromId": null,
 "activated": false,
 "uoaId": 2,
 "productId": 2,
 "surveyId": 2
 }
 */
