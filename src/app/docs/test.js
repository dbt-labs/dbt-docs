'use strict';

const angular = require('angular');
require("./styles.css");

angular
.module('dbt')
.controller('TestCtrl', ['$scope', '$state', 'project', 'code', '$anchorScroll', '$location',
            function($scope, $state, projectService, codeService, $anchorScroll, $location) {

    $scope.model_uid = $state.params.unique_id;
    $scope.tab = $state.params.tab;
    $scope.project = projectService;
    $scope.codeService = codeService;

    $scope.versions = {}

    $scope.model = {};
    projectService.ready(function(project) {
        $scope.model = project.nodes[$scope.model_uid];

        var default_compiled = '\n-- compiled SQL not found for this model\n';
        $scope.versions = {
            'Source': $scope.model.raw_sql,
            'Compiled': $scope.model.injected_sql || default_compiled
        }

        setTimeout(function() {
            $anchorScroll();
        }, 0);
    })
}]);
