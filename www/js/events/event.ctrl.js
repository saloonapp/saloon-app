(function(){
  'use strict';
  angular.module('app')
    .controller('EventCtrl', EventCtrl)
    .controller('EventInfosCtrl', EventInfosCtrl)
    .controller('EventProgramCtrl', EventProgramCtrl)
    .controller('EventSessionCtrl', EventSessionCtrl)
    .controller('EventExponentCtrl', EventExponentCtrl)
    .controller('EventScheduleCtrl', EventScheduleCtrl);

  function EventCtrl($scope, event, userData){
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

  function EventProgramCtrl($scope, EventUtils, event, userData){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;

    vm.getProgram = function(){ return [].concat(event.sessions, event.exponents); };
    vm.programOrder = function(elt){ return elt.name ? elt.name : elt.title; };
    vm.isFav = function(elt){ return EventUtils.isFavorite(userData, elt); };
  }

  function EventSessionCtrl($scope, EventSrv, EventUtils, userData, session){
    var vm = {};
    $scope.vm = vm;

    vm.userData = userData;
    vm.elt = session;
    vm.favLoading = false;
    vm.similar = [];

    vm.isFav = function(elt){ return EventUtils.isFavorite(userData, elt); };
    vm.toggleFav = toggleFav;

    function toggleFav(elt){
      if(!vm.favLoading){
        vm.favLoading = true;
        EventSrv.toggleFavoriteSession(userData, elt).then(function(){
          vm.favLoading = false;
        }, function(){
          vm.favLoading = false;
        });
      }
    }
  }

  function EventExponentCtrl($scope, EventSrv, EventUtils, event, userData, exponent){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
    vm.elt = exponent;
    vm.favLoading = false;
    vm.similar = [];
    vm.comments = EventUtils.getComments(userData, exponent);

    vm.isFav = function(elt){ return EventUtils.isFavorite(userData, elt); };
    vm.toggleFav = toggleFav;

    function toggleFav(elt){
      if(!vm.favLoading){
        vm.favLoading = true;
        EventSrv.toggleFavoriteExponent(userData, elt).then(function(){
          vm.favLoading = false;
        }, function(){
          vm.favLoading = false;
        });
      }
    }
  }

  function EventScheduleCtrl($scope, EventUtils, event, userData){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
    $scope.$on('$ionicView.enter', function(){
      vm.sessions = EventUtils.getFavoriteSessions(event, userData);
      vm.exponents = EventUtils.getFavoriteExponents(event, userData);
    });
  }
})();
