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