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
ngPressApp.controller('ngPressController', ['$rootScope', '$state', 'apiFactory',
    function ($rootScope, $state, apiFactory) {
        'use strict';
        var vm = this;

        $rootScope.$on('$stateChangeSuccess', function (e, toState, toParams) {

            var pt = toParams.post_type;

            //Some sort of bodyClass();
            vm.bodyClass = pt + ' ' + toParams;

            if (pt === 'post') {
                apiFactory.PostBySlug.query({slug: toParams.slug}, function (post) {
                    console.log(post);
                    vm.title = post[0].title.rendered;
                    vm.content = post[0].content.rendered;
                });
            } else if (pt === 'page') {
                apiFactory.PageBySlug.query({slug: toParams.slug}, function (post) {
                    vm.title = post[0].title.rendered;
                    vm.content = post[0].content.rendered;
                });
            }
        });
    }
]);

ngPressApp.controller('UserAccessController', ['$http', '$scope', 'WP_Data', 'paramFactory',
    function ($http, $scope, WP_Data, paramFactory) {
        'use strict';

        $scope.loginData = {};
        $scope.logoutData = {};
        $scope.registerData = {};
        $scope.status;

        var userAction = function ( request ) {

            var security = angular.element(document.querySelectorAll("#" + request.action + "_security"));
            request.params[request.action + '_security'] = security[0].value;
            request.params['action'] = 'ngpressajax' + request.action;

            $scope.status = request.successMsg + '...';
            $http({
                method  : 'POST',
                url     : WP_Data.WP_AJAX_URL,
                data    : paramFactory(request.params),
                headers : {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                }
            }).success(function (data_received, status, headers, config) {
                if (data_received.loggedin || data_received.loggedout) {
                    $scope.status = request.successMsg;
                    window.location.reload(); //Required to re-associate nonce
                } else {
                    $scope.status = 'Unable to complete request - SUCCESS';
                }

            }).error(function (data_received, status, headers, config) {
                $scope.status = 'Unable to complete request - ERROR';
            });
        }

        $scope.login = function (loginform, e) {
            if (loginform.$valid) {
                userAction({
                    action      :'login',
                    params      : $scope.loginData,
                    successMsg  : "Login valid, getting user data",
                    errorMsg    : "User data received"
            });
            } else {
                $scope.status = "Invalid login";
            }
            e.preventDefault();
        };

        $scope.register = function (registerform, e) {
            if (registerform.$valid) {
                userAction({
                    action      : 'register',
                    params      : $scope.registerData,
                    successMsg  : "Registration valid, sending user data",
                    errorMsg    : "User registered"
                });
            } else {
                $scope.status = "Registration details invalid";
            }
            e.preventDefault();
        };

        $scope.logout = function (e) {
            userAction({
                action      : 'logout',
                params      : $scope.logoutData,
                successMsg  : "Logging user out",
                errorMsg    : "User logged out, good bye"
            });
            e.preventDefault();
        }
    }
]);

ngPressApp.controller('CommentsController', ['$state', '$scope', 'userFactory', 'apiHelperFactory', 'apiFactory', 'paramFactory',
    function ($state, $scope, userFactory, apiHelperFactory, apiFactory, paramFactory) {
        'use strict';

        var currentId;

        $scope.commentData = {};

        userFactory.isLoggedIn().then(function (is_user_logged_in) {

            console.log(is_user_logged_in);
            //Can user comment
            $scope.canComment = function (comment_registration) {

                //Registration required to comment -> WP Admin > Settings > Discussions >
                //"Users must be registered and logged in to comment"

                if (comment_registration === '1') {
                    if (is_user_logged_in) {
                        return true;
                    } else {
                        return false;
                    }
                    //Registration not required to comment
                } else {
                    return true;
                }
            };
        });

        $scope.canShowComment = function (comment_moderation) {
            if (comment_moderation === '1') {
                return false;
            } else {
                return true;
            }
        }

        $scope.$on('$stateChangeSuccess', function (e, toState, toParams) {
            apiHelperFactory.currentPostId( toParams.post_type, toParams.slug ).then(function (id) {
                $scope.saveComment = function (form, e) {
                    apiFactory.Comments.save({ id: id.id }, $scope.commentData, function (response) {
                        console.log('SUCCESS: ' + response);
                        //Reload state to
                        $state.reload();
                    }, function (error) {
                        console.log('ERROR: ' + error);
                    });
                }

                apiFactory.Comments.query({id: id.id}, function (res) {
                    //console.log(res, id.id);
                    $scope.comments = '';
                    if (res.length > 0) {
                        $scope.hasComments = true;
                        $scope.comments = res;
                    }

                })
            });

        });
    }
]);
var blogModule = angular.module( 'ngPressApp.blogModule', ['ui.router']);

blogModule.controller( 'BlogController', ['$state', '$scope',
    function( $state, $scope ) {

    }
]);
var homeModule = angular.module( 'ngPressApp.homeModule', ['ui.router']);

homeModule.controller( 'HomeController', ['$state', '$scope',
    function( $state, $scope ) {
    }
]);
var pagesModule = angular.module( 'ngPressApp.pagesModule', ['ui.router']);

pagesModule.controller( 'PageController', ['$state', 'apiFactory', '$scope',
    function( $state, apiFactory, $scope ) {

        /*apiFactory.PageBySlug.query({ slug: $state.params.slug }, function (post) {
            console.log(post, $scope.$parent);
            $scope.title = post[0].title.rendered;
            $scope.content = post[0].content.rendered;
        }, function(error){
            connsole.log(error);
        });*/

    }
]);
var postModule = angular.module( 'ngPressApp.postModule', ['ui.router']);

postModule.controller( 'PostController', ['apiFactory', '$state', '$scope',
    function( apiFactory, $state, $scope ) {

        /*apiFactory.PostBySlug.query({slug: $state.params.slug}, function (post) {
            console.log($state, post);
            $scope.title = post[0].title.rendered;
            $scope.content = post[0].content.rendered;
        }, function(error){
            connsole.log(error);
        });*/

    }
]);
ngPressApp.directive('theContent', ['$sce', function( $sce ){
    'use strict';
    return{
        restrict:'A',
        scope:{
            theContent : '='
        },
        link: function($scope, $element, $attrs){
            $scope.$watch('theContent', function( newVal, oldVal ){
                //console.log(newVal)
                var cleanHTML = $sce.trustAsHtml(newVal);
                if(typeof newVal !== 'undefined' && newVal !== oldVal ){
                    $element.html(cleanHTML);
                }
            });
        }
    };
}]);

ngPressApp.directive('theTitle', function(){
    'use strict';
    return{
        restrict:'A',
        scope:{
            theTitle : '='
        },
        link: function($scope, $element, $attrs){
            $scope.$watch('theTitle', function( newVal, oldVal ){
                if(typeof newVal !== 'undefined' ){
                    $element.html(newVal);
                }
            });
        }
    };
});

ngPressApp.directive('editLink', ['$rootScope', '$window', 'WP_Data', function( $rootScope, $window, WP_Data ){
    'use strict';
    return{
        restrict:'A',
        scope:{
            editLink : '='
        },
        link: function($scope, $element, $attrs){
            var target = angular.element($element[0].parentElement);
            $scope.$watch('editLink', function( newVal, oldVal ){
                if(typeof newVal !== 'undefined' && newVal !== oldVal && newVal !== '' ){
                    target.bind('click', function(e){
                        e.preventDefault();
                        $window.location.href = WP_Data.ROOT_URL + '/wp-admin/post.php?post=' + newVal + '&action=edit';
                    });
                }else{
                    target.unbind('click');
                }
            });
        }
    };
}]);
ngPressApp.directive('postList', ['$sce', 'apiFactory' ,
    function ($sce, apiFactory) {
        'use strict';
        return{
            restrict: 'E',
            controller: function ($scope, $element, $attrs) {

                var ppp = $attrs.postsPerPage || 5; //Posts per page attr
                var pt = $attrs.postType || 'post'; //Posts type attr

                apiFactory.Posts.query({ ppp:ppp }, function (apiData) {
                        var i = 0,
                            dataLength = apiData.length,
                            postsObj = [];

                        for (; i < dataLength; i++) {
                            var postObj = {
                                title: apiData[i].title.rendered,
                                excerpt: $sce.trustAsHtml(apiData[i].excerpt.rendered),
                                slug: apiData[i].slug,
                                post_id: apiData[i].ID
                            }
                            postsObj.push(postObj);
                        }

                        $scope.posts = postsObj;

                    }, function (error) {
                        console.log(error);
                    }
                );
            },
            link: function (scope, elem, attrs) {

            }
        }
    }
]);
ngPressApp.factory('apiFactory', ['$resource', 'WP_Data',
    function( $resource, WP_Data ) {
        return {
            Root            : $resource( WP_Data.API_URL, { _wp_json_nonce: WP_Data.WP_NONCE }),

            //PostsSchema     : $resource( WP_Data.API_URL + '/posts/schema', { _wp_json_nonce: WP_Data.WP_NONCE }),

            Posts           : $resource( WP_Data.API_URL + '/posts/:id?posts_per_page=ppp', {id: '@id', ppp: '@ppp', _wp_json_nonce: WP_Data.WP_NONCE}),
            PostBySlug      : $resource( WP_Data.API_URL + '/posts?name=:slug', {id: '@id', _wp_json_nonce: WP_Data.WP_NONCE}),

            Pages           : $resource( WP_Data.API_URL + '/pages/:id', {id: '@id', _wp_json_nonce: WP_Data.WP_NONCE}),
            PageBySlug      : $resource( WP_Data.API_URL + '/pages?name=:slug', {slug: '@slug', _wp_json_nonce: WP_Data.WP_NONCE}),

            Comments        : $resource( WP_Data.API_URL + '/comments?post=:id', {id: '@id', _wp_json_nonce: WP_Data.WP_NONCE}),

            UserMe          : $resource( WP_Data.API_URL + '/users/me', { _wp_json_nonce: WP_Data.WP_NONCE}),
            User            : $resource( WP_Data.API_URL + '/users/:id', {id: '@id', _wp_json_nonce: WP_Data.WP_NONCE})

            /*var resource = $resource('/bug',{},{
                post:{
                    method:"POST",
                    isArray:false,
                    headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'}
                },
            });*/
        };
    }
]);

ngPressApp.factory('apiHelperFactory', ['$q', 'apiFactory',
    function ( $q, apiFactory ) {
        'use strict';

        var apiHelperFactory = {};

        apiHelperFactory.currentPostId = function ( post_type, slug ) {
            var deferred = $q.defer();

            switch(post_type) {
                case 'post' :
                    apiFactory.PostBySlug.query({ slug:slug },function(res){
                        deferred.resolve(res[0]);
                    });
                    break;
                case 'page' :
                    apiFactory.PageBySlug.query({ slug:slug },function(res){
                        deferred.resolve(res[0]);
                    });
                    break;
                default :

                    break
            }

            return deferred.promise;
        }

        return apiHelperFactory;
    }
]);
// jQuery Param factory function
ngPressApp.factory( 'paramFactory', [ '$resource', 'WP_Data',
    function ( $resource, WP_Data ) {
        return function(data) {
            var returnString = '';
            for (var d in data){
                if (data.hasOwnProperty(d))
                    returnString += d + '=' + data[d] + '&';
            }
            return returnString.slice( 0, returnString.length - 1 );
        };
    }
]);
// jQuery Param factory function
ngPressApp.factory( 'userFactory', ['apiFactory', 'WP_Data', '$q',
    function ( apiFactory, WP_Data, $q ) {

        var userFactory = {};

        //Is user logged in?
        userFactory.isLoggedIn = function( deferData ) {
            //set defaults to arguments
            deferData = typeof deferData !== 'undefined' ? deferData : false;

            var deferred = $q.defer();

            if( WP_Data.USER_ID !== 0 ) {
                apiFactory.User.get({ id: WP_Data.USER_ID },
                    function (apiData) {
                        console.log(apiData);
                        if (typeof apiData !== 'undefined' && apiData.status !== '400') {
                            if( deferData ) {
                                var userData = {
                                    user_id: apiData.id,
                                    username: apiData.name
                                }
                                deferred.resolve(userData);
                            }else{
                                deferred.resolve(true);
                            }
                        } else {
                            deferred.resolve(false);
                        }
                    }, function (error) {
                        console.log(error);
                        deferred.reject();
                    }
                );
            }else{
                deferred.resolve( false );
            }
            return deferred.promise;
        };

        return userFactory;
    }
]);
