'use strict';

const angular = require('angular');
const _ = require('lodash');

angular
.module('dbt')
.controller('OverviewCtrl', ['$scope', '$state', 'project',
    function($scope, $state, projectService) {
        $scope.overview_md = '(loading)'
        
        projectService.ready(function (project) {
            let project_name = $state.params.project_name
                ? $state.params.project_name
                : null;
            
            $scope.overview_md = 'yo yo yo';
        });
}]);
