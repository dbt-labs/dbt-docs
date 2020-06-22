'use strict';

const angular = require('angular');
const _ = require('underscore');
const utils = require('./utils')
require("./styles.css");

angular
.module('dbt')
.controller('ModelCtrl', ['$scope', '$state', 'project', 'code', '$anchorScroll', '$location',
            function($scope, $state, projectService, codeService, $anchorScroll, $location) {
    
    function getReferences(project, macro) {
        var references = _.filter(project.nodes, function(node) {
            if (node.depends_on && node.depends_on.nodes && node.depends_on.nodes.length) {
                if (_.contains(node.depends_on.nodes, macro.unique_id)) {
                    return true;
                }
            }
            return false;
        });

        // TODO : include macros?
        return _.groupBy(references, 'resource_type');
    }

    function getParents (project, model) {
        var parents = _.filter(project.nodes, function(node) {
            if (model.depends_on && model.depends_on.nodes && model.depends_on.nodes.length) {
                if (_.contains(model.depends_on.nodes, node.unique_id)) {
                    return true;
                }
            }
            return false;
        });
        
        return _.groupBy(parents, 'resource_type');
    }

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
        var mod = project.nodes[$scope.model_uid];
        $scope.model = mod;
        $scope.references = utils.getReferences(project, mod);
        $scope.parents = utils.getParents(project, mod);

        var default_compiled = '\n-- compiled SQL not found for this model\n';
        $scope.versions = {
            'Source': $scope.model.raw_sql,
            'Compiled': $scope.model.injected_sql || default_compiled
        }

        setTimeout(function() {
            $anchorScroll();
        }, 0);
    })


}]);
