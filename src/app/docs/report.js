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

    $scope.report = {};
    projectService.ready(function(project) {
        let report = project.nodes[$scope.model_uid];
        $scope.report = report;
        $scope.parents = dag_utils.getParents(project, report);
        $scope.parentsLength = $scope.parents.length;

        $scope.extra_table_fields = [
            {
                name: "Maturity",
                value: $scope.report.maturity
            },
            {
                name: "Owner",
                value: $scope.report.owner.name
            },
            {
                name: "Owner email",
                value: $scope.report.owner.email
            },
        ]
    })
}]);
