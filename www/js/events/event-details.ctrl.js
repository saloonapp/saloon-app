(function(){
  'use strict';
  angular.module('app')
    .controller('EventDetailsCtrl', EventsCtrl);

  function EventsCtrl($scope, event){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
  }
})();
