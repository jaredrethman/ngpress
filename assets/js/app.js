var ngPressApp = angular.module( 'ngPressApp', [
    'ui.router',
    'ct.ui.router.extras',
    'ngResource',
    'ngPressApp.homeModule',
    'ngPressApp.pagesModule',
    'ngPressApp.blogModule',
    'ngPressApp.postModule'
]);

//Use a constant to hold WP localized data _inc/scripts.php
var WP_Data = {
    ROOT_URL        : configJS.rootUri,
    THEME_URL       : configJS.themeUri,
    API_URL         : configJS.wpAPIData.base,
    WP_AJAX_URL     : configJS.wpAjaxUri,
    WP_NONCE        : configJS.wpAPIData.nonce,
    USER_ID         : configJS.wpAPIData.user_id
};

ngPressApp.constant( 'WP_Data', WP_Data );

ngPressApp.config( ['$stateProvider', '$futureStateProvider', '$urlRouterProvider', '$locationProvider', '$httpProvider', 'WP_Data',
    function( $sp, $futureStateProvider, $urlRouterProvider, $locationProvider, $httpProvider, WP_Data ) {
        'use strict';

        //$httpProvider.defaults.headers.common = { 'X-WP-Nonce' : WP_Data.WP_NONCE };

        //Future states allows us to generate routes dynamically using a JSON objected/file created in WP
        var initFutureStates = ['$http', '$q', '$timeout', function($http, $q, $timeout) {
            return $http.get(WP_Data.THEME_URL + "/_inc/states.php", {
                cache: true,
                headers : { 'Content-Type': 'application/json' }
            })
            .then(function(response) {
                angular.forEach(response.data, function( state, key ) {
                    $sp.state(state.name, {
                        url: state.url,
                        controller  : state.controller,
                        templateUrl : state.templateUrl,
                        params      : {
                            slug        : state.name,
                            post_type   : state.post_type
                        }
                    });
                });
            });
        }];

        $futureStateProvider.addResolve(initFutureStates);
        $urlRouterProvider.when('', '/');
        $urlRouterProvider.otherwise('/404');
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false,
            rewriteLinks: false //Allows WP Admin bar links to work like normal
        }).hashPrefix('!');

}]);

ngPressApp.run( ['apiFactory',
    function( apiFactory ) {
        //console.log(apiFactory.Root.get());
    }
]);