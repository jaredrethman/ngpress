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