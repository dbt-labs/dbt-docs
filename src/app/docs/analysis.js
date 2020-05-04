'use strict';

const angular = require('angular');
const $ = require("jquery");

require("./styles.css");

const _ = require('underscore');

angular
.module('dbt')
.controller('AnalysisCtrl', ['$scope', '$state', 'project', 'code', '$transitions', '$anchorScroll', '$location',
            function($scope, $state, projectService, codeService, $transitions, $anchorScroll, $location) {

    $scope.model_uid = $state.params.unique_id;
    $scope.project = projectService;
    $scope.codeService = codeService;

    $scope.highlighted = {
        source: '',
        compiled: '',
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

        $(".source-code").each(function(i, el) {
            hljs.lineNumbersBlock(el);
        });

        $scope.highlighted.source = codeService.highlightSql($scope.model.raw_sql);
        $scope.highlighted.compiled = codeService.highlightSql($scope.model.injected_sql || default_compiled);
    })
}]);
