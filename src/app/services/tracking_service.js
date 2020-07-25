

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
        project_id: null,
    };

    service.init = function(opts) {
        if (service.initialized) {
            return;
        }

        service.initialized = true;
        service.project_id = opts.project_id;

        // If tracking is enabled, then include Snowplow lib and initialize tracker
        if (opts.track === true) {
            service.turn_on_tracking();
        }
    }

    service.isHosted = function() {
        return window.location.hostname.indexOf('.getdbt.com') > -1;
    }

    service.turn_on_tracking = function() {
        ;(function(p,l,o,w,i,n,g){if(!p[i]){p.GlobalSnowplowNamespace=p.GlobalSnowplowNamespace||[];
        p.GlobalSnowplowNamespace.push(i);p[i]=function(){(p[i].q=p[i].q||[]).push(arguments)
        };p[i].q=p[i].q||[];n=l.createElement(o);g=l.getElementsByTagName(o)[0];n.async=1;
        n.src=w;g.parentNode.insertBefore(n,g)}}(window,document,"script","//d1fc8wv8zag5ca.cloudfront.net/2.9.0/sp.js","snowplow"));

        var trackerParams = {
            appId: 'dbt-docs',
            forceSecureTracker: true,
            respectDoNotTrack: true,
            userFingerprint: false,
            contexts: {
                webPage: true
            }
        }

        if (service.isHosted()) {
            trackerParams.cookieDomain = '.getdbt.com';
        }

        service.snowplow = window.snowplow;
        service.snowplow(
            'newTracker',
            'sp',
            'fishtownanalytics.sinter-collect.com',
            trackerParams
        );

        service.snowplow('enableActivityTracking', 30, 30);
        service.track_pageview();
    }

    service.fuzzUrls = function() {
        if (service.isHosted()) {
            return;
        }

        service.snowplow('setCustomUrl', 'https://fuzzed.getdbt.com/');
        service.snowplow('setReferrerUrl', 'https://fuzzed.getdbt.com/');
    }

    service.getContext = function() {
        return [{
            schema: 'iglu:com.dbt/dbt_docs/jsonschema/1-0-0',
            data: {
              "is_cloud_hosted": service.isHosted(),
              "core_project_id": service.project_id,
            }
        }]
    }

    service.track_pageview = function() {
        if (!service.snowplow) {
            return;
        }

        service.fuzzUrls();

        var customTitle = null;
        service.snowplow(
            'trackPageView',
            customTitle,
            service.getContext()
        );
    }

    service.track_event = function(action, label, property, value) {
        if (!service.snowplow) {
            return
        }

        service.fuzzUrls();
        service.snowplow(
            'trackStructEvent',
            'dbt-docs',
            action,
            label,
            property,
            value,
            service.getContext(),
        );
    }

    service.track_graph_interaction = function(interaction_type, num_nodes) {
        if (!service.snowplow) {
            return
        }

        service.fuzzUrls();
        service.track_event('graph', 'interact', interaction_type, num_nodes);
    }

    return service;
}]);
