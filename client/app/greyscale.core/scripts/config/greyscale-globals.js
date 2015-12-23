/**
 * Created by igi on 09.12.15.
 */
'use strict';
angular.module('greyscale.core')
    .provider('greyscaleGlobals', function () {
        var self = {
            project_states: [
                {id: 0, name: 'waiting'},
                {id: 1, name: 'in-flight'},
                {id: 2, name: 'completed'},
                {id: 3, name: 'suspended'},
                {id: 4, name: 'abandoned'}
            ],
            tables: {
                roles: {
                    cols: [
                        {
                            field: 'id',
                            title: 'ID',
                            show: true,
                            sortable: 'id'
                        },
                        {
                            field: 'name',
                            title: 'Name',
                            show: true,
                            sortable: 'name'
                        },
                        {
                            field: 'isSystem',
                            title: 'System Role',
                            show: true,
                            sortable: 'isSystem',
                            dataFormat: 'boolean'
                        }
                    ]
                },
                countries: {
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
                    ]
                },
                rights: {
                    cols: [
                        {
                            field: 'id',
                            title: 'ID',
                            show: false,
                            sortable: 'id'
                        },
                        {
                            field: 'action',
                            title: 'Action',
                            show: true,
                            sortable: 'action'
                        },
                        {
                            field: 'description',
                            title: 'Description',
                            show: true,
                            sortable: false
                        },
                        {
                            field: 'essenceId',
                            title: 'Entity Type ID',
                            show: false,
                            sortable: 'essenceId'
                        },
                        {
                            field: 'entityType',
                            title: 'Entity Type',
                            show: true,
                            sortable: 'entityType'
                        }
                    ]
                },
                uoas: {
                    cols: [
                        {
                            field: 'id',
                            title: 'ID',
                            show: true
                        },
                        /*
                         {
                         field: 'gadmId0',
                         title: 'gadmId0',
                         show: true,
                         sortable: 'gadmId0'
                         },
                         {
                         field: 'gadmId1',
                         title: 'gadmId1',
                         show: true,
                         sortable: 'gadmId1'
                         },
                         {
                         field: 'gadmId2',
                         title: 'gadmId2',
                         show: true,
                         sortable: 'gadmId2'
                         },
                         {
                         field: 'gadmId3',
                         title: 'gadmId3',
                         show: true,
                         sortable: 'gadmId3'
                         },
                         {
                         field: 'gadmObjectId',
                         title: 'gadmObjectId',
                         show: true,
                         sortable: 'gadmObjectId'
                         },
                         {
                         field: 'ISO',
                         title: 'ISO',
                         show: true,
                         sortable: 'ISO'
                         },
                         {
                         field: 'ISO2',
                         title: 'ISO2',
                         show: true,
                         sortable: 'ISO2'
                         },
                         {
                         field: 'nameISO',
                         title: 'nameISO',
                         show: true,
                         sortable: 'nameISO'
                         },
                         */
                        {
                            field: 'name',
                            title: 'Name',
                            show: true,
                            sortable: 'name'
                        },
                        {
                            field: 'description',
                            title: 'Description',
                            show: true,
                            sortable: 'description'
                        },
                        {
                            field: 'shortName',
                            title: 'Short Name',
                            show: true,
                            sortable: 'shortName'
                        },
                        /*
                         {
                         field: 'HASC',
                         title: 'HASC',
                         show: true,
                         sortable: 'HASC'
                         },
                         */
                        /*
                         {
                         field: 'unitOfAnalysisType',
                         title: 'Type',
                         show: true,
                         sortable: 'unitOfAnalysisType'
                         },
                         */
                        {
                            field: 'typeName',
                            title: 'Type',
                            show: true,
                            sortable: 'typeName'
                        },
                        /*
                         {
                         field: 'parentId',
                         title: 'parentId',
                         show: true,
                         sortable: 'parentId'
                         },
                         {
                         field: 'creatorId',
                         title: 'creatorId',
                         show: true,
                         sortable: 'creatorId'
                         },
                         {
                         field: 'ownerId',
                         title: 'ownerId',
                         show: true,
                         sortable: 'ownerId'
                         },
                         */
                        /*
                         {
                         field: 'visibility',
                         title: 'Visibility',
                         show: true,
                         sortable: 'visibility'
                         },
                         */
                        {
                            field: 'visibilityName',
                            title: 'Visibility',
                            show: true,
                            sortable: 'visibilityName'
                        },
                        /*
                         {
                         field: 'status',
                         title: 'Status',
                         show: true,
                         sortable: 'status'
                         },
                         */
                        {
                            field: 'statusName',
                            title: 'Status',
                            show: true,
                            sortable: 'statusName'
                        },
                        {
                            field: 'createTime',
                            title: 'Created',
                            show: true,
                            sortable: 'createTime'
                            /*
                             },
                             {
                             field: 'deleteTime',
                             title: 'deleteTime',
                             show: true,
                             sortable: 'deleteTime'
                             */
                        }
                    ]
                },
                uoaTypes: {
                    cols: [
                        {
                            field: 'id',
                            title: 'ID',
                            show: true
                        },
                        {
                            field: 'name',
                            title: 'Name',
                            show: true
                        },
                        {
                            field: 'description',
                            title: 'Description',
                            show: true
                        },
                        {
                            field: 'langCode',
                            title: 'Original language',
                            show: true
                        }
                    ]
                },
                languages: {
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
                            field: 'nativeName',
                            title: 'Native name',
                            show: true,
                            sortable: 'nativeName'
                        },
                        {
                            field: 'code',
                            title: 'Code',
                            show: true,
                            sortable: 'code'
                        }
                    ]
                }
            }
        };

        return {
            $get: function () {
                return self;
            }
        }
    });
