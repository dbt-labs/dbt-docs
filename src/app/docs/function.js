'use strict';

const angular = require('angular');
const dag_utils = require('./dag_utils')
require("./styles.css");

angular
.module('dbt')
.controller('FunctionCtrl', ['$scope', '$state', 'project', 'code', '$anchorScroll', '$location',
            function($scope, $state, projectService, codeService, $anchorScroll, $location) {

    $scope.model_uid = $state.params.unique_id;
    $scope.tab = $state.params.tab;
    $scope.project = projectService;
    $scope.codeService = codeService;
    $scope.versions = {};
    $scope.model = {};

    projectService.ready(function(project) {
        let node = project.nodes[$scope.model_uid];
        $scope.model = node;
        $scope.references = dag_utils.getReferences(project, node);
        $scope.referencesLength = Object.keys($scope.references).length;
        $scope.parents = dag_utils.getParents(project, node);
        $scope.parentsLength = Object.keys($scope.parents).length;
        $scope.language = node.language;

        $scope.versions = {
            'Source': $scope.model.raw_code,
            'Compiled': $scope.model.compiled_code || "Compiled SQL is not available for this function"
        };

        setTimeout(function() {
            $anchorScroll();
        }, 0);
    });
}]);
