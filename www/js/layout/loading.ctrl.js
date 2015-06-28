(function(){
  'use strict';
  angular.module('app')
    .controller('LoadingCtrl', LoadingCtrl);

  LoadingCtrl.$inject = ['$scope', '$state', '$q', '$timeout', '$ionicHistory', '$analytics', 'UserSrv', 'EventSrv', 'LoadingSrv', 'EventUtils', 'StorageUtils', '_'];
  function LoadingCtrl($scope, $state, $q, $timeout, $ionicHistory, $analytics, UserSrv, EventSrv, LoadingSrv, EventUtils, StorageUtils, _){
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
          var user = results[0];
          var events = results[1];
          var props = {};
          if(user && user.uuid){ props.userId = user.uuid; }
          if(user && user.device && user.device.uuid){ props.deviceId = user.device.uuid; }
          $analytics.setUserProperties(props); // TODO : seems to not work...
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true,
            historyRoot: true
          });

          var currentEvents = _.filter(events, function(event){ return EventUtils.isEventNow(event); });
          if(currentEvents.length > 0){
            StorageUtils.get('last-state').then(function(lastState){
              var lastEvent = lastState && lastState.params ? _.find(currentEvents, {uuid: lastState.params.eventId}) : undefined;
              if(lastEvent){
                $state.go(lastState.name, lastState.params);
                LoadingSrv.loaded();
              } else if(currentEvents.length === 1){
                $state.go('app.event.infos', {eventId: currentEvents[0].uuid});
                LoadingSrv.loaded();
              } else {
                $state.go('app.events');
                LoadingSrv.loaded();
              }
            });
          } else {
            $state.go('app.events');
            LoadingSrv.loaded();
          }
        }, function(err){
          vm.error = err;
        });
      }, 0);
    }
  }
})();
