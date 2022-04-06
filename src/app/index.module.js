'use strict';

require('./../assets/css/styles.css');

const $ = require('jquery');
const angular = require('angular');

// dumb hack to fix bootstrap
window.jQuery = $;
require('bootstrap/js/tooltip');
require('bootstrap/js/popover');

require('angular-ui-router');
require('angular-route');

require('angular-marked');


angular
.module('dbt', [
  'ngRoute',
  'ui.router',
  'hc.marked',
]).
config(['markedProvider', '$locationProvider',
       function(markedProvider, $locationProvider) {

    markedProvider.setOptions({gfm: true, sanitize: true});
    markedProvider.setRenderer({
        table: function(header, body) {
            return "<table class='table'><thead>" + header + "</thead><tbody>"+ body + "</tbody></table>"
        }
    });


    $locationProvider.html5Mode({
        enabled: false,
        //requireBase: false
    });

    $(document).tooltip({
        selector: '[data-toggle="tooltip"]',
        placement: function(tip,element){
            return ( $(element).attr('data-placement') ) ? $(element).attr('data-placement') : 'auto';
        },
        container: 'body'
    });

    $(document).ready(function(){
        $('[data-toggle=popover]').popover({container: 'body', html: true});
    })

}])
