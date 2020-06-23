'use strict';

const angular = require('angular');
const utils = require('./utils')
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
        $scope.references = utils.getReferences(project, mod);
        $scope.parents = utils.getParents(project, mod);

        $scope.versions = {
            'Source': $scope.model.raw_sql,
            'Compiled': $scope.model.injected_sql
        }
    })
}]);
