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
    vm.bgSessions = [
      'img/event/sessions1.jpg',
      'img/event/sessions2.jpg',
      'img/event/sessions3.jpg'
    ];
    vm.bgExponents = 'img/event/exponents.jpg';
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
    vm.bgExponents = [
      'img/event/exponent1.jpg',
      'img/event/exponent2.jpg',
      'img/event/exponent3.jpg',
      'img/event/exponent4.jpg',
      'img/event/exponent5.jpg',
      'img/event/exponent6.jpg',
      'img/event/exponent7.jpg',
      'img/event/exponent8.jpg',
      'img/event/exponent9.jpg'
    ];

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
