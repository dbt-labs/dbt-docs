'use strict';

const angular = require('angular');
const $ = require("jquery");

require("./styles.css");

const _ = require('underscore');

angular
.module('dbt')
.controller('SourceCtrl', ['$scope', '$state', '$sce', 'project', '$transitions', '$anchorScroll', '$location',
            function($scope, $state, $sce, projectService, $transitions, $anchorScroll, $location) {

    $scope.model_uid = $state.params.unique_id;
    $scope.project = projectService;

    $scope.has_test = function(col, test_name) {
        var test_types = _.pluck(col.tests, 'short');
        return test_types.indexOf(test_name) != -1;
    }

    $scope.has_more_info = function(column) {
        var tests = (column.tests || []);
        var description = (column.description || "");

        return tests.length || description.length;
    }

    $scope.toggle_column_expanded = function(column) {
        if ($scope.has_more_info(column)) {
            column.expanded = !column.expanded
        }
    }

    $scope.get_columns = function(model) {
        var columns = _.chain(model.columns)
                .values()
                .sortBy('index')
                .value();

        // re-number columns because index comes from the catalog, and index may not always be present
        // this prevents errors with the view's `track by column.index`

        _.each(columns, function(col, i) {
            col.index = i;
        });

        return columns;
    }

    $scope.model = {};
    projectService.ready(function(project) {
        $scope.model = project.nodes[$scope.model_uid];
    })


}]);
