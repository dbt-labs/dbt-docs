'use strict';

const angular = require('angular');
const dag_utils = require('./dag_utils')
require("./styles.css");

angular
.module('dbt')
.controller('ReportCtrl', ['$scope', '$state', 'project', 'code', '$anchorScroll', '$location',
            function($scope, $state, projectService, codeService, $anchorScroll, $location) {

    $scope.model_uid = $state.params.unique_id;
    $scope.project = projectService;

    $scope.codeService = codeService;
    $scope.extra_table_fields = [];
    $scope.versions = {};

    $scope.entity = {};
    projectService.ready(function(project) {
        let entity = project.nodes[$scope.model_uid];
        $scope.entity = entity;
        $scope.parents = dag_utils.getParents(project, entity);
        $scope.parentsLength = $scope.parents.length;
        $scope.referencesLength = Object.keys($scope.references).length;


        //$scope.extra_table_fields = []
    })
}]);