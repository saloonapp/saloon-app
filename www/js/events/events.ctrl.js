(function(){
  'use strict';
  angular.module('app')
    .controller('EventsCtrl', EventsCtrl);

  function EventsCtrl($scope, $window, $ionicPopover, EventSrv, Config, events){
    var oneWeek = 7*24*60*60*1000;
    var vm = {};
    $scope.vm = vm;

    vm.events = events;
    vm.emailSupport = Config.emailSupport;
    vm.showPastEvents = false;

    vm.doRefresh = doRefresh;
    vm.showPopover = function($event){ morePopover.show($event); };
    vm.togglePastEvents = function(){ vm.showPastEvents = !vm.showPastEvents; morePopover.hide(); }
    vm.isNotFinished = function(elt){ return elt && elt.end+oneWeek > Date.now(); }
    vm.mapUrl = mapUrl;

    // refresh event list everytime it's loaded (once by app launch)
    // if it fails, we keep local data
    EventSrv.refreshEventList().then(function(events){
      vm.events = events;
    });

    var morePopover;
    $ionicPopover.fromTemplateUrl('js/events/partials/events-popover.html', {
      scope: $scope
    }).then(function(popover) {
      morePopover = popover;
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
