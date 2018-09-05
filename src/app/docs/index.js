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
.controller('ModelCtrl', ['$scope', '$state', '$sce', 'project', '$transitions', '$anchorScroll', '$location',
            function($scope, $state, $sce, projectService, $transitions, $anchorScroll, $location) {

    $scope.model_uid = $state.params.unique_id;
    $scope.tab = $state.params.tab;
    $scope.project = projectService;
    $scope.copied = false;

    $scope.highlighted = {
        source: '',
        compiled: ''
    }

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
        return _.chain(model.columns)
                .values()
                .sortBy('index')
                .value()
    }

    $scope.model = {};
    projectService.ready(function(project) {
        $scope.model = project.nodes[$scope.model_uid];

        var default_compiled = '\n-- compiled SQL not found for this model\n';
        $scope.highlighted.source = highlightSql($scope.model.raw_sql);
        $scope.highlighted.compiled = highlightSql($scope.model.injected_sql || default_compiled);

        $(".source-code").each(function(i, el) {
            hljs.lineNumbersBlock(el);
        });

        setTimeout(function() {
            $anchorScroll();
        }, 0);
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
