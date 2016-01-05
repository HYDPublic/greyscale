/**
 * Created by igi on 25.12.15.
 */
'use strict';

angular.module('greyscaleApp')
    .directive('widgetTableCell', function ($filter, $compile) {

        function decode(_set, dict, value) {
            var res = value;
            var _expr = {};
            _expr[_set.keyField] = value;
            var _data = $filter('filter')(dict, _expr);

            if (_data.length > 0) {
                res = _data[0][_set.valField];
            }

            return res;
        }

        return {
            restrict: 'A',
            scope: {
                widgetCell: '=widgetTableCell',
                rowValue: '='
            },
            link: function ($scope, elem) {
                var cell = $scope.widgetCell;
                if (cell.show) {
                    var _field = cell.field;
                    $scope.model = $scope.rowValue[_field];

                    switch (cell.dataFormat) {
                        case 'action':
                            elem.addClass('text-right');
                            elem.append('<button ng-repeat="act in widgetCell.actions" class="btn btn-xs btn-{{act.class}}" ' +
                                'ng-click="act.handler(rowValue)"><i class="fa {{act.icon}}" ng-show="act.icon"> </i>{{act.title}}</button>');
                            $compile(elem.contents())($scope);
                            break;

                        case 'option':
                            var _set = cell.dataSet;
                            if (_set.getData) {
                                elem.append(decode(_set, _set.getData($scope.rowValue), $scope.rowValue[_field]));
                            } else if (_set.dataPromise) {
                                elem.append('{{model}}');
                                $compile(elem.contents())($scope);
                                _set.dataPromise($scope.rowValue).then(function (dict) {
                                    $scope.model = decode(_set, dict, $scope.model);
                                });
                            }
                            break;

                        case 'boolean':
                            elem.addClass('text-center');
                            if ($scope.rowValue[_field] === true) {
                                elem.append('<span class="text-success"><i class="fa fa-check"></i></span>');
                            } else if ($scope.rowValue[_field] === false) {
                                elem.append('<span class="text-danger"><i class="fa fa-warning"></i></span>');
                            }
                            break;

                        case 'text':
                        case 'textarea':
                            elem.append($scope.rowValue[_field]);
                            break;

                        default:
                            elem.append((cell.dataFormat) ? $filter(cell.dataFormat)($scope.rowValue[_field]) : $scope.rowValue[_field]);
                    }
                }
            }
        };
    });
