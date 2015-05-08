(function(){
  'use strict';
  angular.module('app')
    .controller('LoadingCtrl', LoadingCtrl);

  LoadingCtrl.$inject = ['$scope', '$state', '$q', '$timeout', '$ionicHistory', 'UserSrv', 'EventSrv'];
  function LoadingCtrl($scope, $state, $q, $timeout, $ionicHistory, UserSrv, EventSrv){
    var vm = {};
    $scope.vm = vm;

    vm.error = undefined;
    vm.retry = function(){
      vm.error = undefined;
      redirect();
    };

    redirect();

    function redirect(){
      $timeout(function(){
        $q.all([UserSrv.getUser(), EventSrv.getAll()]).then(function(results){
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true,
            historyRoot: true
          });
          $state.go('app.events');
        }, function(err){
          vm.error = err;
        });
      }, 0);
    }
  }
})();
