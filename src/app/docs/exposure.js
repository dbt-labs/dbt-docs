'use strict';

const angular = require('angular');
const dag_utils = require('./dag_utils')
require("./styles.css");

angular
.module('dbt')
.controller('ExposureCtrl', ['$scope', '$state', 'project', 'code', '$anchorScroll', '$location',
            function($scope, $state, projectService, codeService, $anchorScroll, $location) {

    $scope.model_uid = $state.params.unique_id;
    $scope.project = projectService;

    $scope.codeService = codeService;
    $scope.extra_table_fields = [];
    $scope.versions = {};

    $scope.exposure = {};
    projectService.ready(function(project) {
        let exposure = project.nodes[$scope.model_uid];
        $scope.exposure = exposure;
        $scope.parents = dag_utils.getParents(project, exposure);
        $scope.parentsLength = $scope.parents.length;
        $scope.language = exposure.language;

        var owner_identifier
        if ($scope.exposure.owner.name && $scope.exposure.owner.email) {
            owner_identifier = `${$scope.exposure.owner.name} <${$scope.exposure.owner.email}>`
          } else if ($scope.exposure.owner.name) {
            owner_identifier = `${$scope.exposure.owner.name}`
          } else if ($scope.exposure.owner.email) {
            owner_identifier = `${$scope.exposure.owner.email}`
          }
        
        $scope.extra_table_fields = [
            {
                name: "Maturity",
                value: $scope.exposure.maturity,
            },
            {
                name: "Owner",
                value: owner_identifier
            },
            {
                name: "Exposure name",
                value: $scope.exposure.name,
            },
        ]
    })
}]);
