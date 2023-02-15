'use strict';

const angular = require('angular');
const dag_utils = require('./dag_utils')
require("./styles.css");

angular
.module('dbt')
.controller('MetricCtrl', ['$scope', '$state', 'project', 'code', '$anchorScroll', '$location',
            function($scope, $state, projectService, codeService, $anchorScroll, $location) {

    $scope.model_uid = $state.params.unique_id;
    $scope.project = projectService;

    $scope.codeService = codeService;
    $scope.extra_table_fields = [];
    $scope.versions = {};

    $scope.metric = {};
    projectService.ready(function(project) {
        let metric = project.nodes[$scope.model_uid];
        $scope.metric = metric;
        $scope.references = dag_utils.getReferences(project, metric);
        $scope.referencesLength = Object.keys($scope.references).length;        
        $scope.parents = dag_utils.getParents(project, metric);
        $scope.parentsLength = $scope.parents.length;

        // $scope.versions = {
        //     'Definition': codeService.generateMetricSQL($scope.metric)
        // }

        $scope.extra_table_fields = [
            {
                name: "Metric Type",
                value: $scope.metric.type,
            }
        ]

    })
}]);
