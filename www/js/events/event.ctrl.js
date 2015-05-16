(function(){
  'use strict';
  angular.module('app')
    .controller('EventCtrl', EventCtrl)
    .controller('EventInfosCtrl', EventInfosCtrl)
    .controller('EventSessionsCtrl', EventSessionsCtrl)
    .controller('EventSessionCtrl', EventSessionCtrl)
    .controller('EventExponentsCtrl', EventExponentsCtrl)
    .controller('EventExponentCtrl', EventExponentCtrl);

  function EventCtrl($scope, event, userData){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
    vm.userData = userData;
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

  function EventSessionsCtrl($scope, EventUtils, event, userData){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;

    vm.isFav = isFav;

    function isFav(session){
      return EventUtils.isFavorite(userData, session);
    }
  }

  function EventSessionCtrl($scope, EventSrv, EventUtils, event, userData, session){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
    vm.session = session;
    vm.favLoading = false;
    vm.similarSessions = [];
    vm.sessionComments = EventUtils.getComments(userData, session);

    vm.isFav = isFav;
    vm.toggleFav = toggleFav;

    function isFav(session){
      return EventUtils.isFavorite(userData, session);
    }
    function toggleFav(session){
      if(!vm.favLoading){
        vm.favLoading = true;
        if(isFav(session)){
          EventSrv.unfavoriteSession(session).then(function(res){
            EventUtils.removeFavorite(userData, session);
            vm.favLoading = false;
          }, function(err){
            vm.favLoading = false;
          });
        } else {
          EventSrv.favoriteSession(session).then(function(favData){
            EventUtils.addFavorite(userData, favData);
            vm.favLoading = false;
          }, function(err){
            vm.favLoading = false;
          });
        }
      }
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

    vm.isFav = isFav;
    vm.toggleFav = toggleFav;

    function isFav(session){
      return false;
    }
    function toggleFav(session){

    }
  }
})();
