(function(){
  'use strict';
  angular.module('app')
    .controller('LoadingCtrl', LoadingCtrl);

  LoadingCtrl.$inject = ['$scope', '$state', '$q', 'UserSrv', 'EventSrv'];
  function LoadingCtrl($scope, $state, $q, UserSrv, EventSrv){
    var vm = {};
    $scope.vm = vm;

    vm.error = undefined;
    vm.retry = function(){
      vm.error = undefined;
      redirect();
    };

    redirect();

    function redirect(){
      $q.all([UserSrv.getUser(), EventSrv.getAll()]).then(function(results){
        $state.go('app.twitts');
      }, function(err){
        vm.error = err;
      });
    }
  }
})();
