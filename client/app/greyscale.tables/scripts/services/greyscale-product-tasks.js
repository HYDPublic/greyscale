'use strict';

angular.module('greyscale.tables')
    .factory('greyscaleProductTasksTbl', function (_, $q, $sce, greyscaleProductApi, greyscaleProductWorkflowApi,
        greyscaleUserApi, greyscaleGroupApi, greyscaleModalsSrv) {

        var tns = 'PRODUCT_TASKS.';

        var _dicts = {
            uoas: [],
            users: [],
            steps: [],
            tasks: [],
            groups: []
        };

        var _cols = [{
            title: tns + 'UOA',
            field: 'uoa.name',
            sortable: 'uoa.name'
        }, {
            title: tns + 'PROGRESS',
            cellClass: 'text-center',
            cellTemplate: '<span class="progress-blocks">' +
                '<span class="progress-block status-{{item.status}}" popover-trigger="mouseenter" ' +
                'uib-popover-template="item.user && \'views/controllers/pm-dashboard-product-tasks-progress-popover.html\'" ' +
                'ng-class="{active:item.active, delayed: !item.onTime}" ng-repeat="item in row.progress track by $index">' +
                '<i ng-show="!item.user && item.active" class="text-danger fa fa-exclamation"></i>' +
                '<i ng-show="item.flagClass" class="fa fa-{{item.flagClass}}"></i>' +
                '<span class="counter" ng-show="item.flagged && item.status != \'completed\'">{{item.flaggedcount}}</span>' +
                '</span></span>'
        }, {
            title: tns + 'DEADLINE',
            sortable: 'endDate',
            cellTemplate: '<span ng-class="{\'text-danger\': ext.deadline(row).isOverdue }">{{ext.deadline(row).endDate|date}}</span>',
            cellTemplateExtData: {
                deadline: _getDeadlineInfo
            }
        }, {
            title: tns + 'LAST_UPDATE',
            field: 'lastVersionDate',
            sortable: 'lastVersionDate',
            cellTemplate: '{{cell|date:\'short\'}}'
        }, {
            show: true,
            titleTemplate: '<div class="text-right"><a class="action expand-all"><i class="fa fa-eye"></i></a></div>',
            cellTemplate: '<div class="text-right" ng-if="!row.subjectCompleted"><a class="action"><i class="fa fa-eye"></i></a></div>' +
                '<div class="text-right" ng-if="row.subjectCompleted" title="{{\'' + tns + 'UOA_TASKS_COMPLETED\'|translate}}"><i class="fa fa-check text-success"></i></div>'
        }];

        var _table = {
            title: tns + 'TITLE',
            icon: 'fa-tasks',
            cols: _cols,
            dataFilter: {},
            dataShare: {},
            sorting: {
                'uoa.name': 'asc',
                'step.position': 'asc'
            },
            classes: 'table-hover',
            rowClass: 'action-expand-row',
            //expandedRowShow: true,
            dataPromise: _getData
                //delegateClick: {
                //    '.progress-block': _handleProgressBlockClick
                //}
        };

        function _getProductId() {
            return _table.dataFilter.productId;
        }

        function _getData() {

            var productId = _getProductId();
            if (!productId) {
                return $q.reject();
            }

            return greyscaleProductApi.get(productId)
                .then(_getProductTasksData);
        }

        function _getProductTasksData(product) {

            if (!product.workflow) {
                return $q.when([]);
            }

            var reqs = {
                users: greyscaleUserApi.list(),
                uoas: greyscaleProductApi.product(product.id).uoasList(),
                tasks: greyscaleProductApi.product(product.id).tasksList(),
                steps: greyscaleProductWorkflowApi.workflow(product.workflow.id).stepsList()
            };

            return $q.all(reqs)
                .then(function (data) {
                    angular.extend(_dicts, {
                        product: product,
                        uoas: data.uoas,
                        users: data.users,
                        steps: data.steps,
                        tasks: data.tasks,
                        groups: []
                    });
                    return _extendTasksWithRelations(data.tasks)
                        .then(_getSubjectRowsData);
                });
        }

        function _extendTasksWithRelations(tasks) {
            var i, qty;
            angular.forEach(tasks, function (task) {
                task.uoa = _.find(_dicts.uoas, {
                    id: task.uoaId
                });
                task.step = _.find(_dicts.steps, {
                    id: task.stepId
                });
                task.users = [];
                if (task.userIds) {
                    qty = task.userIds.length;
                    for (i = 0; i < qty; i++) {
                        task.users.push(_.find(_dicts.users, {
                            id: task.userIds[i]
                        }));
                    }
                }
                task.groups = [];
                if (task.groupIds) {
                    qty = task.groupIds.length;
                    for (i = 0; i < qty; i++) {
                        task.groups.push(_.find(_dicts.groups, {
                            id: task.userIds[i]
                        }));

                    }
                }
                if (task.userIds && task.userIds.length) {
                    task.user = _.find(_dicts.users, {
                        id: task.userIds[0]
                    });
                    //task.users.unshift(task.user);
                }
            });
            _table.dataShare.tasks = tasks;
            return $q.when(tasks);
        }

        function _getSubjectRowsData(tasks) {
            var subjectRowsData = [];
            var tasksBySubject = _.groupBy(tasks, 'uoaId');
            angular.forEach(tasksBySubject, function (uoaTasks) {
                uoaTasks = _.sortBy(uoaTasks, 'position');
                var rowData;
                angular.forEach(uoaTasks, function (task) {
                    if (!rowData && task.uoa && task.stepId === task.uoa.currentStepId) {
                        rowData = task;
                    }
                });
                if (!rowData) {
                    rowData = uoaTasks[0];
                    rowData.noActiveTask = true;
                }
                if (_dicts.product.status === 0) {
                    rowData.planningMode = true;
                }
                rowData = _getSubjectRowDataWithProgress(rowData, uoaTasks);

                subjectRowsData.push(rowData);
            });
            return $q.when(subjectRowsData);
        }

        function _getSubjectRowDataWithProgress(rowData, uoaTasks) {
            rowData.progress = [];
            var id = parseInt(rowData.id);
            var unCompletedCount = 0;
            var _flagSrc, _flagDst;

            angular.forEach(_.sortBy(_dicts.steps, 'position'), function (step) {
                var stepTask = _.find(uoaTasks, {
                    stepId: step.id
                });

                if (!stepTask) {
                    stepTask = {
                        step: step
                    };
                }

                stepTask.flagClass = '';
                if (_flagSrc) {
                    if (stepTask.id === _flagSrc) {
                        stepTask.flagClass = 'backward';
                        stepTask.flaggedto = _flagDst;
                        stepTask.flaggedfrom = _flagSrc;
                        _flagSrc = null;
                    }
                }
                if (stepTask.flagged && stepTask.status !== 'completed') {
                    stepTask.flagClass = stepTask.flagClass || 'flag';
                    _flagSrc = rowData.flaggedfrom;
                    _flagDst = rowData.id;
                }

                var progressTask = _.pick(stepTask, [
                    'id',
                    'status',
                    'active',
                    'flagged',
                    'step',
                    'user',
                    'endDate',
                    'startDate',
                    'flaggedcount',
                    'flagClass',
                    'flaggedfrom',
                    'flaggedto',
                    'planningMode'
                ]);

                if (rowData.status !== 'completed') {
                    unCompletedCount++;
                }

                if (rowData.uoa.currentStepId === progressTask.step.id) {
                    progressTask.active = true;
                    rowData.activeStep = progressTask.step;
                    rowData.onTime = _isOnTime(progressTask);
                }
                progressTask.onTime = rowData.onTime;

                if (progressTask.active && progressTask.flaggedfrom) {
                    rowData.onTime = progressTask.onTime = _isOnTime(_.find(uoaTasks, {
                        id: progressTask.flaggedfrom
                    }));
                }

                rowData.progress.push(progressTask);
            });

            if (rowData.planningMode || (!unCompletedCount && !rowData.noActiveTask)) {
                rowData.allCompleted = !unCompletedCount;
                _.map(rowData.progress, function (item) {
                    if (item.status !== 'completed') {
                        item.status = 'waiting';
                    }
                    item.active = false;
                });
            }

            rowData.progress = _.sortBy(rowData.progress, 'step.position');

            for (var i = rowData.progress.length - 1; i >= 0; i--) {
                if (rowData.progress[i].id) {
                    rowData.last = rowData.progress[i].id === rowData.id;
                    break;
                }
            }

            if (rowData.progress[rowData.progress.length - 1].status === 'completed') {
                rowData.subjectCompleted = true;
            }

            rowData.started = !!rowData.lastVersionDate;

            return rowData;
        }

        function _isOnTime(task) {
            return new Date(task.endDate).setHours(23, 59, 59, 999) >= new Date();
        }

        function _getDeadlineInfo(task) {
            if (task.deadlineInfo) {
                return task.deadlineInfo;
            }
            var info = {};
            angular.forEach(task.progress, function (progressTask) {
                if (progressTask.endDate) {
                    info.endDate = progressTask.endDate;
                }
            });
            info.isOverdue = !_isOnTime(info);
            task.deadlineInfo = info;
            return info;
        }

        function _handleProgressBlockClick(e, scope) {
            greyscaleModalsSrv.productTask(scope.row, scope.item);
        }

        return _table;
    });
