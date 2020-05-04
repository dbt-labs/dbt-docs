'use strict';

const angular = require('angular');
require("./styles.css");

angular
.module('dbt')
.controller('SourceCtrl', ['$scope', '$state', 'project', 'code', '$anchorScroll', '$location',
            function($scope, $state, projectService, codeService, $anchorScroll, $location) {

    $scope.model_uid = $state.params.unique_id;
    $scope.project = projectService;

    $scope.codeService = codeService;
    $scope.extra_table_fields = [];
    $scope.versions = {};

    $scope.model = {};
    projectService.ready(function(project) {
        $scope.model = project.nodes[$scope.model_uid];

        $scope.versions = {
            'Sample SQL': codeService.generateSourceSQL($scope.model)
        }

        $scope.extra_table_fields = [
            {
                name: "Loader",
                value: $scope.model.loader
            },
            {
                name: "Source",
                value: $scope.model.source_name
            },
        ]
    })
}]);
