(function(){
  'use strict';
  angular.module('app')
    .controller('EventsCtrl', EventsCtrl);

  function EventsCtrl($scope, EventSrv, events){
    var vm = {};
    $scope.vm = vm;

    vm.events = events;
    vm.doRefresh = doRefresh;

    function doRefresh(){
      EventSrv.refreshEventList().then(function(events){
        vm.events = events;
        $scope.$broadcast('scroll.refreshComplete');
      });
    }
  }
})();
