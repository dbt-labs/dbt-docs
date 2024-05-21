'use strict';

const angular = require('angular');
const dag_utils = require('./dag_utils')
require("./styles.css");

angular
.module('dbt')
.controller('SavedQueryCtrl', ['$scope', '$state', 'project', 'code', '$anchorScroll', '$location',
            function($scope, $state, projectService, codeService, $anchorScroll, $location) {

    $scope.model_uid = $state.params.unique_id;
    $scope.project = projectService;

    $scope.codeService = codeService;
    $scope.extra_table_fields = [];
    $scope.versions = {};

    $scope.saved_query = {};
    projectService.ready(function(project) {
        let saved_query = project.nodes[$scope.model_uid];
        $scope.saved_query = saved_query;
        $scope.parents = dag_utils.getParents(project, saved_query);
        $scope.parentsLength = $scope.parents.length;

        const saved_query_type =  $scope.saved_query.type === 'expression'
            ? 'Expression saved_query'
            : 'Aggregate saved_query';

        $scope.extra_table_fields = [
            {
                name: "Saved Query Type",
                value: saved_query_type,
            },
            {
                name: "Saved Query name",
                value: $scope.saved_query.name
            }
        ]

    })
}]);