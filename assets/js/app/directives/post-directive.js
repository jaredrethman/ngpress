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