'use strict';

const angular = require('angular');
const _ = require('underscore');
const $ = require('jquery');

const logo = require('./../../assets/images/logo.svg');

require('../services/code_service.js');
require('../services/project_service.js');
require('../services/graph.service.js');
require('../services/node_selection_service.js');
require('../services/tracking_service.js');
require('../services/location_service.js');


angular
.module('dbt')
.controller('MainController', ['$scope', '$route', '$state', 'project', 'graph', 'selectorService', 'trackingService', 'locationService', '$transitions',
    function($scope, $route, $state, projectService, graphService, selectorService, trackingService, locationService, $transitions) {

    $scope.tree = {
        database: {},
        project: {},
        sources: {},
    }

    $scope.search = {
        query: '',
        results: [],
        is_focused: false
    }

    $scope.logo = logo;
    $scope.model_uid = null;
    $scope.project = {};

    $scope.checkboxStatus = {
        show_names : false,
        show_descriptions: false,
        show_columns: false,
        show_code: false
    };

    $('body').bind('keydown', function(e) {
        if (event.key == 't' && event.target.tagName != 'INPUT') {
            console.log("Opening search");
            // TODO : Make a directive, broadcast events, etc etc
            $('#search').focus();
            event.preventDefault();
        }
     });

     $scope.onSearchFocus = function(e, is_focused) {
        $scope.search.is_focused = is_focused;
    }

    $scope.clearSearch = function() {
        $scope.search.is_focused = false;
        $scope.search.query = '';
        $scope.search.results = []
        $('#search').blur();
    }

    $scope.$on('clearSearch', function() {
        $scope.clearSearch();
    });

    $scope.$on('query', function(event, search) {
        $scope.search.is_focused = true;
        $scope.search.query = search;
    });

    $scope.onSearchKeypress = function(e) {
        console.log(e);
        if (e.key == 'Escape') {
            $scope.clearSearch();
            e.preventDefault();
        }
    }

    function setSelectedModel(unique_id) {
        $scope.model_uid = unique_id;

        var node = projectService.node(unique_id);
        if (node) {
            selectorService.resetSelection(node);
        }
    }

    // populate tree when data is loaded
    projectService.getModelTree($state.params.unique_id, function(tree) {
        $scope.tree.database = tree.database;
        $scope.tree.project = tree.project;
        $scope.tree.sources = tree.sources;

        setTimeout(function() {
            scrollToSelectedModel($scope.model_uid);
        })
    });

    function scrollToSelectedModel(unique_id) {
        if (!unique_id) {
            return;
        }

        setTimeout(function() {
            // TODO : Two different elements?
            var el = $("*[data-nav-unique-id='" + unique_id + "']");
            if (el.length && el[0].scrollIntoView) {
                el[0].scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'});
            }
        }, 1)
    }

    $transitions.onSuccess({}, function(transition, state) {
        var params = transition.router.globals.params;

        var prev_node = selectorService.getViewNode();
        var prev_node_id = prev_node ? prev_node.unique_id : null;
        var cur_node_id = params.unique_id;

        var from_state = transition.from().name;
        var to_state = transition.to().name;

        var state_changed = true;
        if (from_state == to_state && prev_node_id == cur_node_id) {
            state_changed = false;
        } 

        if (state_changed && params.unique_id) {
            var tree = projectService.updateSelected(params.unique_id);
            $scope.tree.database = tree.database;
            $scope.tree.project = tree.project;
            $scope.tree.sources = tree.sources;
            $scope.search.query = ""

            console.log("updating selected model to: ", params);
            setSelectedModel(params.unique_id);

            setTimeout(function() {
                scrollToSelectedModel(params.unique_id);
            });
        }

        if (state_changed) {
            // track the pageview
            trackingService.track_pageview();
        }
    });

    function filterResults(results, checkboxStatus){
        if(!_.some(_.values(checkboxStatus))){
            return results;
        }

        let finalResults = [];
        let fileIDs = [];
        
        const {show_names, show_descriptions, show_columns, show_code} = checkboxStatus;
        _.each(results, function(result){
            _.each(result.matches, function(match){
               if(!fileIDs.includes(result.model['unique_id'])){
                   if((show_names && match.key === "name") || (show_descriptions && match.key === "description") || (show_columns && match.key === "columns") || (show_code && match.key === "raw_sql")){
                    fileIDs.push(result.model['unique_id']);
                    finalResults.push(result);
                   }
               }
            });
       });
       return finalResults;
    }

    var watchExpressions = ['search.query', 'checkboxStatus.show_names', 'checkboxStatus.show_descriptions', 'checkboxStatus.show_columns', 'checkboxStatus.show_code'];
    $scope.$watchGroup(watchExpressions, function() {
        let filteredResults = filterResults(projectService.search($scope.search.query), $scope.checkboxStatus);
        $scope.search.results = filteredResults;
    });

    /*
    INITIALIZE THE APPLICATION:
        1. Set the selected model (if there is one) via the url
        2. Set the appropriate graph selection args if provided
    */

    projectService.init();
    projectService.ready(function(project) {
        $scope.project = project;

        // set initial search results
        $scope.search.results = projectService.search('');

        var packages = _.unique(_.pluck(_.values(project.nodes), 'package_name'))
        var all_tags = [null];
        _.each(project.nodes, function(node) {
            if (node.resource_type == 'model') {
                var tags = node.tags;
                all_tags = _.union(all_tags, tags);
            };
        });

        selectorService.init({packages: packages, tags: all_tags})
        setSelectedModel($state.params.unique_id);

        var cur_state = locationService.parseState($state.params);
        if (cur_state.show_graph) {
            graphService.ready(function() {
                _.assign(selectorService.selection.dirty, cur_state.selected);
                var selection = selectorService.updateSelection();
                graphService.updateGraph(selection);
            });
        }

        var meta = (project.metadata || {})
        trackingService.init({
            track: meta.send_anonymous_usage_stats,
            project_id: meta.project_id,
            user_id: meta.user_id,
        });

    });

}])
