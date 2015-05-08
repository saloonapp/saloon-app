(function(){
  'use strict';
  angular.module('app')
    .controller('EventCtrl', EventCtrl)
    .controller('EventInfosCtrl', EventInfosCtrl)
    .controller('EventExponentsCtrl', EventExponentsCtrl)
    .controller('EventExponentCtrl', EventExponentCtrl)
    .controller('EventSessionsCtrl', EventSessionsCtrl)
    .controller('EventSessionCtrl', EventSessionCtrl);

  function EventCtrl($scope, event){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
  }

  function EventInfosCtrl($scope, $stateParams, EventSrv, event){
    var vm = {};
    $scope.vm = vm;

    vm.loading = false;
    vm.event = event;
    vm.doRefresh = doRefresh;

    function doRefresh(){
      vm.loading = true;
      EventSrv.refreshEvent($stateParams.eventId).then(function(event){
        vm.event = event;
        vm.loading = false;
      }, function(err){
        vm.loading = false;
      });
    }
  }

  function EventExponentsCtrl($scope, event){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
  }

  function EventExponentCtrl($scope, exponent){
    var vm = {};
    $scope.vm = vm;

    vm.exponent = exponent;
  }

  function EventSessionsCtrl($scope, event){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
  }

  function EventSessionCtrl($scope, session){
    var vm = {};
    $scope.vm = vm;

    vm.session = session;
  }
})();
