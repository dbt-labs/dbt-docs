
const angular = require('angular');

const templates = {
    main: require('./main/main.html'),
    overview: require('./overview/overview.html'),
    graph: require('./graph/graph.html'),

    source: require('./docs/source.html'),
    source_list: require('./sources/source_list.html'),

    model: require('./docs/model.html'),
    source: require('./docs/source.html'),
    snapshot: require('./docs/snapshot.html'),
    seed: require('./docs/seed.html'),
    test: require('./docs/test.html'),
    analysis: require('./docs/analysis.html'),
    macro: require('./docs/macro.html'),
    exposure: require('./docs/exposure.html'),
    metric: require('./docs/metric.html'),
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
            templateUrl: templates.overview,
        })
        .state('dbt.project_overview', {
            url: 'overview/:project_name?' + graph_params,
            controller: 'OverviewCtrl',
            templateUrl: templates.overview,
            params: {
                project_name: {type: 'string'}
            }
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
        .state('dbt.test', {
            url: 'test/:unique_id?section&' + graph_params,
            controller: 'TestCtrl',
            templateUrl: templates.test,
            params: {
                unique_id: {type: 'string'}
            },
        })
        .state('dbt.analysis', {
            url: 'analysis/:unique_id?section&' + graph_params,
            controller: 'AnalysisCtrl',
            templateUrl: templates.analysis,
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
            url: 'source_list/:source?section&' + graph_params,
            controller: 'SourceListCtrl',
            templateUrl: templates.source_list,
            params: {
                source: {type: 'string'}
            },
        })
        .state('dbt.macro', {
            url: 'macro/:unique_id?section',
            controller: 'MacroCtrl',
            templateUrl: templates.macro,
            params: {
                unique_id: {type: 'string'}
            },
        })
        .state('dbt.exposure', {
            url: 'exposure/:unique_id?section&' + graph_params,
            controller: 'ExposureCtrl',
            templateUrl: templates.exposure,
            params: {
                unique_id: {type: 'string'}
            },
        })
        .state('dbt.metric', {
            url: 'metric/:unique_id?section&' + graph_params,
            controller: 'MetricCtrl',
            templateUrl: templates.metric,
            params: {
                unique_id: {type: 'string'}
            },
        })
}])
