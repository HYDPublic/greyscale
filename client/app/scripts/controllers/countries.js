/**
 * Created by dseytlin on 29.11.15.
 *
 * @ngdoc function
 * @name greyscaleApp.controller:CountriesCtrl
 * @description
 * # CountriesCtrl
 * Controller of the greyscaleApp
 */

'use strict';

angular.module('greyscaleApp')
    .controller('CountriesCtrl', function ($scope, $state, greyscaleProfileSrv, greyscaleModalsSrv, greyscaleCountrySrv,
                                           $log, inform, NgTableParams, $filter, greyscaleGlobals, _, $uibModal) {
        $scope.model = {
            countries: {
                editable: true,
                title: 'Countries',
                icon: 'fa-table',
                cols: [
                    {
                        field: 'id',
                        title: 'ID',
                        show: true
                    },
                    {
                        field: 'name',
                        title: 'Name',
                        show: true,
                        sortable: 'name'
                    },
                    {
                        field: 'alpha2',
                        title: 'Alpha2',
                        show: true,
                        sortable: 'alpha2'
                    },
                    {
                        field: 'alpha3',
                        title: 'Alpha3',
                        show: true,
                        sortable: 'alpha3'
                    },
                    {
                        field: 'nbr',
                        title: 'Nbr',
                        show: true,
                        sortable: 'nbr'
                    }
                ],
                tableParams: new NgTableParams(
                    {
                        page: 1,
                        count: 15,
                        sorting: {id: 'asc'}
                    },
                    {
                        counts: [],
                        getData: function ($defer, params) {
                            greyscaleCountrySrv.countries().then(function (list) {
                                params.total(list.length);
                                var orderedData = params.sorting() ? $filter('orderBy')(list, params.orderBy()) : list;
                                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                            });
                        }
                    }),
                add: {
                    title: 'Add',
                    handler: function () {
                        greyscaleModalsSrv.editCountry();
                    }
                },
                del: {
                    title: 'Delete',
                    handler: function (country) {
                        greyscaleCountrySrv.deleteCountry(country)
                            .catch(function (err) {
                                inform.add('country delete error: ' + err);
                            })
                            .finally($state.reload);
                    }
                },
                edt: {
                    title: 'Edit',
                    handler: function () {
                        inform.add('Edit country');
                        //$log.debug('Edit country');
                    }
                }
            }
        };
    });
