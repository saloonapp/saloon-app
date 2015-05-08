(function(){
  'use strict';
  angular.module('app')
    .controller('LoadingCtrl', LoadingCtrl);

  function LoadingCtrl($scope, $q, $timeout, $state){
    var vm = {};
    $scope.vm = vm;

    $scope.$on('$ionicView.enter', function(viewInfo){
      redirect();
    });

    function redirect(){
      $timeout(function(){
        $state.go('app.twitts');
      }, 300);
    }
  }
})();
