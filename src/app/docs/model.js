'use strict';

const angular = require('angular');
const dag_utils = require('./dag_utils')
require("./styles.css");

angular
.module('dbt')
.controller('ModelCtrl', ['$scope', '$state', 'project', 'code', '$anchorScroll', '$location', '$http',
            function($scope, $state, projectService, codeService, $anchorScroll, $location, $http) {

    function loadModel(model_unique_id) {
        return $http({
            method: 'POST',
            url: 'https://metadata.cloud.getdbt.com/graphql',
            headers: {
              "Authorization":"Token ..."
            },
            data: {
                "query": `{
                  model(jobId: 940, uniqueId: "${model_unique_id}") {
                    packageName
                    name
                    database
                    schema
                    alias
                    uniqueId
                    resourceType

                    accountId
                    projectId
                    runId
                    jobId
                    
                    description
                    executionTime
                    executeStartedAt
                    executeCompletedAt
                    status
                    
                    parentsModels {
                      name
                      uniqueId
                    }
                    
                    parentsSources {
                      name
                      sourceName
                      uniqueId
                    }
                    
                    tests {
                      state
                      name
                      columnName
                      error
                      fail
                    }
                  }
                }`
            }
        })
    }

    $scope.model_uid = $state.params.unique_id;
    $scope.tab = $state.params.tab;
    $scope.project = projectService;
    $scope.codeService = codeService;
    $scope.versions = {}

    $scope.model = {};
    projectService.ready(function(project) {
        loadModel($scope.model_uid).then(function(data) {
            var model = data.data.data.model
            $scope.model = model;
        })

        //$scope.references = dag_utils.getReferences(project, mod);
        //$scope.referencesLength = Object.keys($scope.references).length;
        //$scope.parents = dag_utils.getParents(project, mod);
        //$scope.parentsLength = Object.keys($scope.parents).length;
        $scope.references = [];
        $scope.referencesLength = 0;
        $scope.parents = [];
        $scope.parentsLength = 0;
    })


}]);
