

const angular = require('angular');
const md5 = require('md5');

angular
.module('dbt')
.factory('trackingService', ['$location', 'selectorService', '$rootScope',
         function($location, selectorService, $rootScope) {


    var COLLECTOR = "https://fishtownanalytics.sinter-collect.com";

    var service = {
        initialized: false,
        snowplow: null,

        previous_url: null
    };

    service.init = function(opts) {
        if (service.initialized) {
            return;
        }

        service.initialized = true;

        // If tracking is enabled, then include Snowplow lib and initialize tracker
        if (opts.track === true) {
            service.turn_on_tracking(opts.project_id, opts.user_id);
        }
    }

    service.turn_on_tracking = function(project_id, user_id) {
        ;(function(p,l,o,w,i,n,g){if(!p[i]){p.GlobalSnowplowNamespace=p.GlobalSnowplowNamespace||[];
        p.GlobalSnowplowNamespace.push(i);p[i]=function(){(p[i].q=p[i].q||[]).push(arguments)
        };p[i].q=p[i].q||[];n=l.createElement(o);g=l.getElementsByTagName(o)[0];n.async=1;
        n.src=w;g.parentNode.insertBefore(n,g)}}(window,document,"script","//d1fc8wv8zag5ca.cloudfront.net/2.9.0/sp.js","snowplow"));

        service.snowplow = window.snowplow;
        service.snowplow('newTracker', 'sp', 'fishtownanalytics.sinter-collect.com', {
            appId: 'dbt-docs',
            discoverRootDomain: true,
            forceSecureTracker: true,
            respectDoNotTrack: true,
            userFingerprint: false,
            contexts: {
                webPage: true
            },
        });

        if (user_id) {
            service.snowplow('setUserId', user_id);
        }

        service.snowplow('enableActivityTracking', 30, 30);
        service.track_pageview();

        // track special identify event
        service.track_project_identify(project_id);
    }

    service.__fuzz_url = function(url, remove_search) {
        var fuzzed_url = url;

        var matches = url.match(/[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+/g);
        if (matches) {
            _.each(matches, function(match) {
                var hashed_name = md5(match);
                fuzzed_url = fuzzed_url.replace(match, hashed_name);
            });
        }

        if (remove_search) {
            fuzzed_url = fuzzed_url.replace(/\?.*$/, '') + "?fuzzed=1";
        }

        return fuzzed_url;
    }

    function fuzzUrls() {
        var url = $location.absUrl();

        var remove_search = true;
        var fuzzed_url = service.__fuzz_url(url, remove_search);

        // fuzz query parameters -- these can contain model names
        _.each($location.search(), function(q_value, q_name) {
            fuzzed_url += "&" + q_name + "=" + 1;
        });

        if (service.previous_url) {
            var referrer = service.previous_url;
        } else {
            // we probably don't want to capture external referrers, right?
            var referrer = '';
        }

        service.snowplow('setCustomUrl', fuzzed_url);
        service.snowplow('setReferrerUrl', referrer);

        return fuzzed_url;
    }

    service.track_pageview = function(project_id) {
        if (service.snowplow) {
            service.previous_url = fuzzUrls();
            // Fuzz page title - just use first part of path
            var path_parts = $location.path().split("/");
            var page_title = path_parts.length > 1 ? path_parts[1] : "";

            service.snowplow('trackPageView', page_title);
        }
    }

    service.track_event = function(action, label, property, value) {
        if (service.snowplow) {
            fuzzUrls();
            service.snowplow('trackStructEvent', 'dbt-docs', action, label, property, value);
        }
    }

    service.track_project_identify = function(project_id) {
        service.track_event('identify', 'project_id', project_id);
    }

    service.track_graph_interaction = function(interaction_type, num_nodes) {
        service.track_event('graph', 'interact', interaction_type, num_nodes);
    }

    return service;
}]);
