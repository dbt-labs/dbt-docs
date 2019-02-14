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

    $scope.sample_sql = "-- sample sql"
    $scope.highlighted = {
        source: '',
    }

    $scope.extra_table_fields = [];


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

    function generateSourceSQL(model) {
        var query = ["select"]

        var num_columns = _.size(model.columns);
        var cols = _.keys(model.columns);
        _.each(cols, function(name, i) {
            var line = "    " + name;
            if (i + 1 != num_columns) {
                line += ",";
            }
            query.push(line);
        });

        var rel = [model.database, model.schema, model.identifier].join(".");
        query.push("from " + rel)
        return query.join("\n");
    }

    $scope.model = {};
    projectService.ready(function(project) {
        $scope.model = project.nodes[$scope.model_uid];

        var sample_sql = generateSourceSQL($scope.model)
        $scope.sample_sql = sample_sql;
        $scope.highlighted.source = highlightSql(sample_sql);

        $(".source-code").each(function(i, el) {
            hljs.lineNumbersBlock(el);
        });

        $scope.extra_table_fields = [
            {
                name: "Loader",
                value: $scope.model.loader
            },
            {
                name: "Source",
                value: $scope.model.source_name
            },
        ]
    })

    function highlightSql(sql) {
        var res = hljs.highlight('sql', sql, true)

        // dumb fix for bug in highlighter line-no plugin:
        // https://github.com/wcoder/highlightjs-line-numbers.js/issues/42
        var fixed = res.value.replace(/^$/gm, '<span></span>');
        var trusted = $sce.trustAsHtml(fixed)
        return trusted
    }

    $scope.copy_to_clipboard = function(text) {
      var el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);

      $scope.copied = true;
      setTimeout(function() {
          $scope.$apply(function() {
              $scope.copied = false;
            });
      }, 500);
   };


}]);
