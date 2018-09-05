const angular = require('angular');

angular
.module('dbt')
.factory('locationService', ['$state', function($state) {

    var service = {}

    function serializeSpec(spec) {
        var serialized = {g_v: 1};
        //if (spec.include != initial_selector.include) { serialized.g_i = spec.include; }
        //if (spec.exclude != initial_selector.exclude) { serialized.g_e = spec.exclude; }
        //if (spec.packages && spec.packages.length) { serialized.g_p = spec.packages.join(","); }
        //if (spec.node_types != service.options.node_types) { serialized.g_n = spec.node_types; }

        serialized.g_i = spec.include;
        serialized.g_e = spec.exclude;

        return serialized;
    }

    function deserializeSpec(params) {
        var selection = {
            include: params.g_i || "",
            exclude: params.g_e || "",
            //node_types: [], // TODO
            //packages: [],   // TODO
        }

        // TODO:
        //if (params.g_p) { selection.packages = params.g_p.split(","); }
        //if (params.g_n) { selection.node_types = node_types; }

        var show_graph = !!params.g_v;

        return {
            selected: selection,
            show_graph: show_graph
        };
    }

    service.parseState = function(params) {
        return deserializeSpec(params);
    }

    service.setState = function(cur_spec) {
        var serialized = serializeSpec(cur_spec);
        var curstate = $state.current['name'];

        $state.go(curstate, serialized)
    }

    service.clearState = function() {
        var curstate = $state.current['name'];
        $state.go(curstate, {
            g_i: null,
            g_e: null,
            //g_p: null,
            //g_n: null,
            g_v: null
        })
    }

    return service;

}]);

