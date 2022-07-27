'use strict';

const angular = require('angular');
const dag_utils = require('./dag_utils')
require("./styles.css");

angular
.module('dbt')
.controller('ModelCtrl', ['$scope', '$state', 'project', 'code', '$anchorScroll', '$location',
            function($scope, $state, projectService, codeService, $anchorScroll, $location) {

    $scope.model_uid = $state.params.unique_id;
    $scope.tab = $state.params.tab;
    $scope.project = projectService;
    $scope.codeService = codeService;
    $scope.versions = {}

    $scope.copied = false;
    $scope.copy_to_clipboard = function(sql) {
        codeService.copy_to_clipboard(sql)
        $scope.copied = true;
        setTimeout(function() {
            $scope.$apply(function() {
                $scope.copied = false;
            })
        }, 1000);
    }

    $scope.model = {};
    projectService.ready(function(project) {
        let mod = project.nodes[$scope.model_uid];
        $scope.model = mod;
        // how to dynamically assign ng-class in code_block.html based on this scope variable?
        // $scope.language = "language-" + (mod.language || "sql");
        $scope.references = dag_utils.getReferences(project, mod);
        $scope.referencesLength = Object.keys($scope.references).length;
        $scope.parents = dag_utils.getParents(project, mod);
        $scope.parentsLength = Object.keys($scope.parents).length;
        $scope.language = mod.language;

        const default_compiled = '\n-- compiled code not found for this model\n';
        $scope.versions = {
            'Source': $scope.model.raw_code,
            'Compiled': $scope.model.compiled_code || default_compiled
        }

        setTimeout(function() {
            $anchorScroll();
        }, 0);
    })


}]);
