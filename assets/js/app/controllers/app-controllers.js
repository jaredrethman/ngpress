ngPressApp.controller('ngPressController', ['$rootScope', '$state', 'apiFactory',
    function ($rootScope, $state, apiFactory) {
        'use strict';
        var vm = this;

        $rootScope.$on('$stateChangeSuccess', function (e, toState, toParams) {

            var pt = toParams.post_type;

            console.log(toParams);
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