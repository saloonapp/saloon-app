(function(){
  'use strict';
  angular.module('app')
    .controller('EventDetailsCtrl', EventDetailsCtrl)
    .controller('EventDetailsInfosCtrl', EventDetailsInfosCtrl)
    .controller('EventDetailsExponentsCtrl', EventDetailsExponentsCtrl)
    .controller('EventDetailsSessionsCtrl', EventDetailsSessionsCtrl);

  function EventDetailsCtrl($scope, event){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
  }

  function EventDetailsInfosCtrl($scope, event){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
  }

  function EventDetailsExponentsCtrl($scope, event){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
  }

  function EventDetailsSessionsCtrl($scope, event){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
  }
})();
