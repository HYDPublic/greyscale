/**
 * Created by igi on 24.05.16.
 */
'use strict';

angular.module('greyscaleApp')
    .directive('gsContextMenu', function (greyscaleSelection) {
        return {
            restrict: 'A',
            transclude: true,
            scope: {
                gsContextMenu: '=',
                qid: '@'
            },
            template: '<ng-transclude></ng-transclude><ul data-toggle="dropdown" id="{{model.menuId}}" class="dropdown-menu" role="menu">' +
            '<li class="dropdown-header" translate="CONTEXT_MENU.TITLE"></li><li class="divider"></li>' +
            '<li ng-repeat="item in gsContextMenu"><a translate="{{item.title}}" ng-click="item.action(model.data)"></a></li></ul>',
            link: function (scope, elem) {
                scope.model = {
                    menuId: 'mnu_' + new Date().getTime(),
                    data: {
                        range: null,
                        selection: {}
                    }
                };

                elem.on('contextmenu', function (evt) {
                    evt.preventDefault();

                    scope.model.data = {
                        range: window.getSelection().getRangeAt(0),
                        selection: greyscaleSelection.get(document.getElementById(scope.qid))
                    };

                    elem.find('#' + scope.model.menuId)
                        .css({
                            left: evt.offsetX,
                            top: evt.offsetY
                        });
                    elem.addClass('open');
                });
            }
        };
    });
