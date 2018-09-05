'use strict';

const angular = require('angular');

angular
.module('dbt')
.controller('OverviewCtrl', ['$scope', '$state', 'project',
    function($scope, $state, projectService) {

        $scope.overview_md = '(loading)'

        projectService.ready(function(project) {

            // default;
            var selected_overview = project.docs["dbt.__overview__"];

            var overviews = _.where(project.docs, {name: '__overview__'});
            _.each(overviews, function(overview) {
                if (overview.package_name != 'dbt') {
                    selected_overview = overview;
                }
            });

            $scope.overview_md = selected_overview.block_contents;
        });
}]);
