(function(){
  'use strict';
  angular.module('app')
    .controller('EventsCtrl', EventsCtrl);

  function EventsCtrl($scope, events){
    var vm = {};
    $scope.vm = vm;

    vm.events = events;
  }
})();
