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

  function EventProgramCtrl($scope, $state, EventUtils, event, userData){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;

    vm.getProgram = getProgram;
    vm.goProgramElt = goProgramElt;
    vm.programOrder = function(elt){ return elt.name ? elt.name : elt.title; };
    vm.isFavorite = function(elt){ return elt ? EventUtils.isFavorite(userData, elt) : false; };

    function getProgram(){
      return [].concat(
        _.map(event.sessions, function(elt){
          elt.className = 'Sessions';
          elt.name = elt.title;
          elt.description = elt.summary;
          return elt;
        }),
        _.map(event.exponents, function(elt){
          elt.className = 'Exponents';
          return elt;
        })
      );
    }
    function goProgramElt(elt){
      if(elt.className === 'Sessions'){ $state.go('app.event.session', {sessionId: elt.uuid}); }
      else if(elt.className === 'Exponents'){ $state.go('app.event.exponent', {exponentId: elt.uuid}); }
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
