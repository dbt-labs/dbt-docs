'use strict';

const angular = require('angular');
require("./styles.css");

angular
.module('dbt')
.controller('SeedCtrl', ['$scope', '$state', 'project', 'code', '$transitions', '$anchorScroll', '$location',
            function($scope, $state, projectService, codeService, $transitions, $anchorScroll, $location) {

    $scope.model_uid = $state.params.unique_id;
    $scope.tab = $state.params.tab;
    $scope.project = projectService;
    $scope.codeService = codeService;

    $scope.versions = {};

    $scope.model = {};
    projectService.ready(function(project) {
        $scope.model = project.nodes[$scope.model_uid];

        $scope.versions = {
            'Example SQL': codeService.generateSourceSQL($scope.model)
        }
    })
}]);
