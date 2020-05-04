'use strict';

const angular = require('angular');
const $ = require("jquery");

require("./styles.css");

const _ = require('underscore');

angular
.module('dbt')
.controller('SeedCtrl', ['$scope', '$state', 'project', 'code', '$transitions', '$anchorScroll', '$location',
            function($scope, $state, projectService, codeService, $transitions, $anchorScroll, $location) {

    $scope.model_uid = $state.params.unique_id;
    $scope.tab = $state.params.tab;
    $scope.project = projectService;
    $scope.codeService = codeService;

    $scope.highlighted = {
        source: '',
    }

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
        $scope.model = project.nodes[$scope.model_uid];

        $scope.sample_sql = codeService.generateSourceSQL($scope.model)
        $scope.highlighted.source = codeService.highlightSql($scope.sample_sql);
    })
}]);
