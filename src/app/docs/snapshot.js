'use strict';

const angular = require('angular');
const hljs = require('highlight.js/lib/highlight.js');
const $ = require("jquery");

hljs.initHighlightingOnLoad();
hljs.initLineNumbersOnLoad();

require("./styles.css");

const _ = require('underscore');

angular
.module('dbt')
.controller('SnapshotCtrl', ['$scope', '$state', 'project', 'code', '$anchorScroll', '$location',
            function($scope, $state, projectService, codeService, $anchorScroll, $location) {

    $scope.model_uid = $state.params.unique_id;
    $scope.tab = $state.params.tab;
    $scope.project = projectService;
    $scope.codeService = codeService;

    $scope.highlighted = {
        source: '',
        compiled: ''
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

        var default_compiled = '\n-- compiled SQL not found for this model\n';
        $scope.highlighted.source = codeService.highlightSql($scope.model.raw_sql);
        $scope.highlighted.compiled = codeService.highlightSql($scope.model.injected_sql || default_compiled);

        $(".source-code").each(function(i, el) {
            hljs.lineNumbersBlock(el);
        });

        setTimeout(function() {
            $anchorScroll();
        }, 0);
    })
}]);
