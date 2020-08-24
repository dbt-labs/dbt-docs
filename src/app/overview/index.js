'use strict';

const angular = require('angular');
const _ = require('lodash');

angular
.module('dbt')
.controller('OverviewCtrl', ['$scope', '$state', 'project',
    function($scope, $state, projectService) {

        $scope.overview_md = '(loading)'

        projectService.ready(function(project) {
            let project_name = $state.params.project_name
                ? $state.params.project_name
                : null;
            
            // default;
            var selected_overview = project.docs["dbt.__overview__"];
            var overviews = _.filter(project.docs, {name: '__overview__'});
            _.each(overviews, function (overview) {
                if (overview.package_name != 'dbt') {
                    selected_overview = overview;
                }
            });
            if (project_name !== null) {
                let project_key = `${project_name}.__${project_name}__`;
                let project_overview = project.docs[project_key];
                if (project_overview !== undefined) {
                    selected_overview = project_overview;
                }
            }
            $scope.overview_md = selected_overview.block_contents;
        });
}]);
