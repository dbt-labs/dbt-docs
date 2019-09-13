
const angular = require('angular');

const templates = {
    main: require('./main/main.html'),
    overview: require('./overview/overview.html'),
    graph: require('./graph/graph.html'),

    source: require('./docs/source.html'),
    source_list: require('./sources/source_list.html'),

    model: require('./docs/model.html'),
    snapshot: require('./docs/snapshot.html'),
    source: require('./docs/source.html'),
}

angular
.module('dbt')
.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

    var graph_params = 'g_v&g_i&g_e&g_p&g_n';

    $urlRouterProvider.otherwise('/overview');
    $stateProvider
        .state('dbt', {
            url: '/',
            abstract: true,
            controller: 'MainController',
            templateUrl: templates.main
        })
        .state('dbt.overview', {
            url: 'overview?' + graph_params,
            controller: 'OverviewCtrl',
            templateUrl: templates.overview
        })
        .state('dbt.graph', {
            url: 'graph',
            controller: 'GraphCtrl',
            templateUrl: templates.graph
        })
        .state('dbt.model', {
            url: 'model/:unique_id?section&' + graph_params,
            controller: 'ModelCtrl',
            templateUrl: templates.model,
            params: {
                unique_id: {type: 'string'}
            },
        })
        .state('dbt.seed', {
            url: 'seed/:unique_id?section&' + graph_params,
            controller: 'SeedCtrl',
            templateUrl: templates.seed,
            params: {
                unique_id: {type: 'string'}
            },
        })
        .state('dbt.snapshot', {
            url: 'snapshot/:unique_id?section&' + graph_params,
            controller: 'SnapshotCtrl',
            templateUrl: templates.snapshot,
            params: {
                unique_id: {type: 'string'}
            },
        })
        .state('dbt.source', {
            url: 'source/:unique_id?section&' + graph_params,
            controller: 'SourceCtrl',
            templateUrl: templates.source,
            params: {
                unique_id: {type: 'string'}
            },
        })
        .state('dbt.source_list', {
            url: 'source_list/:source?' + graph_params,
            controller: 'SourceListCtrl',
            templateUrl: templates.source_list,
            params: {
                source: {type: 'string'}
            },
        })

}])
