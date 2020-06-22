'use strict';

const angular = require('angular');
const _ = require('underscore');
const utils = require('./utils')
require("./styles.css");

angular
.module('dbt')
.controller('SeedCtrl', ['$scope', '$state', 'project', 'code', '$transitions', '$anchorScroll', '$location',
            function($scope, $state, projectService, codeService, $transitions, $anchorScroll, $location) {

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

    $scope.versions = {};

    $scope.model = {};
    projectService.ready(function(project) {
        var mod = project.nodes[$scope.model_uid];
        $scope.model = mod;
        $scope.references = utils.getReferences(project, mod);
        $scope.parents = utils.getParents(project, mod);

        $scope.versions = {
            'Example SQL': codeService.generateSourceSQL($scope.model)
        }
    })
}]);
