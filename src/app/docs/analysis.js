'use strict';

const angular = require('angular');
require("./styles.css");

angular
.module('dbt')
.controller('AnalysisCtrl', ['$scope', '$state', 'project', 'code', '$transitions', '$anchorScroll', '$location',
            function($scope, $state, projectService, codeService, $transitions, $anchorScroll, $location) {

    $scope.model_uid = $state.params.unique_id;
    $scope.project = projectService;
    $scope.codeService = codeService;

    $scope.default_version = 'Source';
    $scope.versions = {
        'Source': '',
        'Compiled': '',
    }

    $scope.model = {};
    projectService.ready(function(project) {
        $scope.model = project.nodes[$scope.model_uid];

        $scope.versions = {
            'Source': $scope.model.raw_sql,
            'Compiled': $scope.model.injected_sql
        }
    })
}]);
