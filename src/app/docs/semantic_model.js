'use strict';

const angular = require('angular');
const dag_utils = require('./dag_utils')
require("./styles.css");

angular
.module('dbt')
.controller('SemanticModelCtrl', ['$scope', '$state', 'project', 'code', '$anchorScroll', '$location',
            function($scope, $state, projectService, codeService, $anchorScroll, $location) {

    $scope.model_uid = $state.params.unique_id;
    $scope.project = projectService;

    $scope.codeService = codeService;
    $scope.extra_table_fields = [];
    $scope.versions = {};

    $scope.semantic_model = {};
    projectService.ready(function(project) {
        let semantic_model = project.nodes[$scope.model_uid];
        $scope.semantic_model = semantic_model;
        $scope.parents = dag_utils.getParents(project, semantic_model);
        $scope.parentsLength = $scope.parents.length;

        const semantic_model_type =  $scope.semantic_model.type === 'expression'
            ? 'Expression semantic_model'
            : 'Aggregate semantic_model';

        $scope.extra_table_fields = [
            {
                name: "Semantic Model Type",
                value: semantic_model_type,
            },
            {
                name: "Semantic Model name",
                value: $scope.semantic_model.name
            }
        ]

    })
}]);
