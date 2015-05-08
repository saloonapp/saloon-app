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

  function EventInfosCtrl($scope, event){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
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
