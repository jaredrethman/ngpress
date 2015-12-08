ngPressApp.factory('apiFactory', ['$resource', 'WP_Data',
    function( $resource, WP_Data ) {
        return {
            Root            : $resource( WP_Data.API_URL, { }),

            Posts           : $resource( WP_Data.API_URL + 'posts/:id?posts_per_page=ppp', {id: '@id', ppp: '@ppp',}),
            PostBySlug      : $resource( WP_Data.API_URL + 'posts?filter[name]=:slug', {id: '@id',}),

            Pages           : $resource( WP_Data.API_URL + 'pages/:id', {id: '@id',}),
            PageBySlug      : $resource( WP_Data.API_URL + 'pages?filter[name]=:slug', {id: '@id',}),

            Comments        : $resource( WP_Data.API_URL + 'comments?post=:id', {id: '@id',}),

            UserMe          : $resource( WP_Data.API_URL + 'users/me', {}),
            User            : $resource( WP_Data.API_URL + 'users/:id', {id: '@id',})
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