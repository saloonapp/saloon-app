(function(){
  'use strict';
  angular.module('app')
    .controller('EventCtrl', EventCtrl)
    .controller('EventInfosCtrl', EventInfosCtrl)
    .controller('EventProgramCtrl', EventProgramCtrl)
    .controller('EventSessionsCtrl', EventSessionsCtrl)
    .controller('EventExponentsCtrl', EventExponentsCtrl)
    .controller('EventSessionCtrl', EventSessionCtrl)
    .controller('EventExponentCtrl', EventExponentCtrl)
    .controller('EventScheduleCtrl', EventScheduleCtrl);

  function EventCtrl($scope, event){
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

  function EventProgramCtrl($scope, EventUtils, event){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
    vm.days = EventUtils.getSessionDays(event.sessions);
  }

  function EventSessionsCtrl($scope, $stateParams, EventUtils, event, userData){
    // TODO : add header button to go to current session
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
    vm.userData = userData;
    vm.day = parseInt($stateParams.day);
    vm.sessions = EventUtils.getSessionsForDay(event.sessions, vm.day);

    vm.isFavorite = function(elt){ return elt ? EventUtils.isFavorite(userData, elt) : false; };
  }

  function EventExponentsCtrl($scope, EventUtils, event, userData){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
    vm.userData = userData;

    vm.isFavorite = function(elt){ return elt ? EventUtils.isFavorite(userData, elt) : false; };
  }

  function EventSessionCtrl($scope, userData, session){
    var vm = {};
    $scope.vm = vm;
    vm.userData = userData;
    vm.elt = session;
    vm.similar = [];
  }

  function EventExponentCtrl($scope, userData, exponent){
    var vm = {};
    $scope.vm = vm;
    vm.userData = userData;
    vm.elt = exponent;
    vm.similar = [];
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
