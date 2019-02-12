
const angular = require('angular');

require('./index.module.js');

require('./components');
require('./docs');
require('./graph');
require('./main');
require('./overview');
require('./sources');

require('./index.routes.js');

angular
.module('dbt')
.run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams; 
}]);
