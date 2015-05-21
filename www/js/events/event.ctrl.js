(function(){
  'use strict';
  angular.module('app')
    .controller('EventCtrl', EventCtrl)
    .controller('EventInfosCtrl', EventInfosCtrl)
    .controller('EventProgramCtrl', EventProgramCtrl)
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

  function EventProgramCtrl($scope, $state, EventUtils, event, userData){
    var vm = {};
    $scope.vm = vm;

    vm.userData = userData;
    vm.event = event;

    vm.getProgram = function(){ return [].concat(event.sessions, event.exponents); };
    vm.goProgramElt = goProgramElt;
    vm.programOrder = function(elt){ return elt.name ? elt.name : elt.title; };
    vm.isFavorite = function(elt){ return elt ? EventUtils.isFavorite(userData, elt) : false; };

    function goProgramElt(elt){
      if(elt.className === 'sessions'){ $state.go('app.event.session', {sessionId: elt.uuid}); }
      else if(elt.className === 'exponents'){ $state.go('app.event.exponent', {exponentId: elt.uuid}); }
      else { console.error('Unknown elt', elt); }
    }
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
