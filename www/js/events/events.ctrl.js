(function(){
  'use strict';
  angular.module('app')
    .controller('EventsCtrl', EventsCtrl);

  function EventsCtrl($scope, $window, EventSrv, events){
    var vm = {};
    $scope.vm = vm;

    vm.events = events;

    vm.doRefresh = doRefresh;
    vm.mapUrl = mapUrl;

    // refresh event list everytime it's loaded (once by app launch)
    // if it fails, we keep local data
    EventSrv.refreshEventList().then(function(events){
      vm.events = events;
    });

    function doRefresh(){
      EventSrv.refreshEventList().then(function(events){
        vm.events = events;
        $scope.$broadcast('scroll.refreshComplete');
      });
    }
    function mapUrl(address, height){
      if(!height){ height = 250; }
      return 'https://maps.googleapis.com/maps/api/staticmap?markers=color:red%7C'+address+'&zoom=15&size='+($window.innerWidth-20)+'x'+height;
    }
  }
})();
