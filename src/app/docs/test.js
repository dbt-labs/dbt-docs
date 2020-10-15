'use strict';

const angular = require('angular');
const dag_utils = require('./dag_utils')
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
        let mod = project.nodes[$scope.model_uid];
        $scope.model = mod;
        $scope.references = dag_utils.getReferences(project, mod);
        $scope.referencesLength = Object.keys($scope.references).length;
        $scope.parents = dag_utils.getParents(project, mod);
        $scope.parentsLength = Object.keys($scope.parents).length;

        var default_compiled = '\n-- compiled SQL not found for this model\n';
        $scope.versions = {
            'Source': $scope.model.raw_sql,
            'Compiled': $scope.model.compiled_sql || default_compiled
        }

        setTimeout(function() {
            $anchorScroll();
        }, 0);
    })
}]);
