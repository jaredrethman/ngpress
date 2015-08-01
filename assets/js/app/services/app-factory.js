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