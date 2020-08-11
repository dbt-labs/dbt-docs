'use strict';

const angular = require('angular');
const _ = require('underscore');
const dag_utils = require('./dag_utils')

require("./styles.css");

angular
.module('dbt')
.controller('MacroCtrl', ['$scope', '$state', 'project', 'code', '$transitions', '$anchorScroll', '$location',
            function($scope, $state, projectService, codeService, $transitions, $anchorScroll, $location) {

    $scope.model_uid = $state.params.unique_id;
    $scope.tab = $state.params.tab;
    $scope.project = projectService;
    $scope.codeService = codeService;
    $scope.macro = {};
    projectService.ready(function(project) {
        let macro = project.macros[$scope.model_uid];
        $scope.macro = macro;
        $scope.references = dag_utils.getMacroReferences(project, macro);
        $scope.referencesLength = Object.keys($scope.references).length;
        $scope.parents = dag_utils.getMacroParents(project, macro);
        $scope.parentsLength = Object.keys($scope.parents).length;

        // adapter macros
        if ($scope.macro.is_adapter_macro) {
            var adapter = project.metadata.adapter_type;
            $scope.versions = macro.impls;
            if (macro.impls[adapter]) {
                $scope.default_version = adapter;
            } else if (macro.impls['default']) {
                $scope.default_version = 'default'
            } else {
                $scope.default_version = _.keys(macro.impls)[0];
            }
        } else {
            $scope.default_version = "Source"
            $scope.versions = {Source: $scope.macro.macro_sql};
        }
    })
}]);
