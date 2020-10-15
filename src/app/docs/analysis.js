'use strict';

const angular = require('angular');
const dag_utils = require('./dag_utils')
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
        let mod = project.nodes[$scope.model_uid];
        $scope.model = mod;
        $scope.references = dag_utils.getReferences(project, mod);
        $scope.referencesLength = Object.keys($scope.references).length;
        $scope.parents = dag_utils.getParents(project, mod);
        $scope.parentsLength = Object.keys($scope.parents).length;

        $scope.versions = {
            'Source': $scope.model.raw_sql,
            'Compiled': $scope.model.compiled_sql
        }
    })
}]);
