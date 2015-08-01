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