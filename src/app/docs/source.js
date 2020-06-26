'use strict';

const angular = require('angular');
const utils = require('./utils')
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
        let mod = project.nodes[$scope.model_uid];
        $scope.model = mod;
        $scope.references = utils.getReferences(project, mod);
        $scope.parents = utils.getParents(project, mod);

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
