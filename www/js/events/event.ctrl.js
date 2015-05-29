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

  function EventCtrl($scope, EventSrv, EventLastRefresh, event){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;

    // refresh event when needed
    // if it fails, we keep local data
    EventLastRefresh.shouldRefresh(event.uuid).then(function(shouldRefresh){
      if(shouldRefresh){
        EventSrv.refreshEvent(event.uuid).then(function(event){
          angular.copy(event, vm.event);
          EventLastRefresh.refresed(event.uuid);
        });
      }
    });
  }

  function EventInfosCtrl($scope, $ionicModal, EventSrv, EventUtils, event, userData){
    var vm = {};
    $scope.vm = vm;

    vm.sponsors = _.filter(event.exponents, {sponsor: true});
    vm.event = event;
    //vm.loading = false;
    //vm.doRefresh = doRefresh;
    vm.crLoading = false;
    vm.askCR = askCR;
    vm.cancelAskCR = cancelAskCR;
    vm.confirmCR = confirmCR;
    vm.isSubscribed = function(elt){ return EventUtils.isSubscribe(userData, elt); }

    /*function doRefresh(){
      vm.loading = true;
      EventSrv.refreshEvent(event.uuid).then(function(event){
        angular.copy(event, vm.event);
        vm.loading = false;
      }, function(err){
        vm.loading = false;
      });
    }*/

    var crModal;
    $ionicModal.fromTemplateUrl('js/events/partials/cr-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal){
      crModal = modal;
    });

    function askCR(){
      vm.crLoading = true;
      var subscribed = EventUtils.getSubscribe(userData, event);
      if(subscribed && subscribed.action){
        vm.crForm = {email: subscribed.action.email, filter: subscribed.action.filter};
      } else {
        vm.crForm = {email: '', filter: 'all'};
      }
      crModal.show();
    }
    function cancelAskCR(){
      crModal.hide().then(function(){
        vm.crLoading = false;
      });
    }
    function confirmCR(){
      crModal.hide().then(function(){
        EventSrv.subscribe(vm.event, vm.crForm).then(function(data){
          EventUtils.setSubscribe(userData, data);
          vm.crLoading = false;
        });
      });
    }

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function(){
      crModal.remove();
    });
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
    var days = EventUtils.getSessionDays(event.sessions);
    vm.day = days[parseInt($stateParams.day)];
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

  function EventScheduleCtrl($scope, $timeout, $ionicScrollDelegate, EventUtils, IonicUtils, CollectionUtils, event, userData){
    var eventPadding = 4*60*60*1000; // 4h
    var sessionPadding = 10*60*1000; // 10min
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
    vm.userData = userData;
    vm.sessionMoods = {};
    vm.exponentMoods = {};
    vm.showMoodBars = [];
    vm.showPreviousSessions = false;
    vm.showFarSessions = false;

    vm.isDone = function(elt){ return elt ? EventUtils.isDone(userData, elt) : false; };
    vm.exponentDone = exponentDone;
    vm.goToSessions = function(){ if(vm.runningEvent){ IonicUtils.scrollTo('current-session', true); } else { IonicUtils.scrollTo('sessions', true); } };
    vm.goToExponents = function(){ IonicUtils.scrollTo('exponents', true); };
    vm.togglePreviousSessions = togglePreviousSessions;
    vm.toggleFarSessions = toggleFarSessions;
    vm.isEmpty = CollectionUtils.isEmpty
    vm.notEmpty = CollectionUtils.isNotEmpty

    $scope.$on('$ionicView.enter', function(){
      vm.sessions = EventUtils.getFavoriteSessions(event, userData).sort(sortSessions);
      vm.sessionMoods = EventUtils.getMoodFor(userData, vm.sessions);
      //var now = new Date('06/11/2015 10:30').getTime();
      var now = Date.now();
      if(event.start-eventPadding < now && now < event.end+eventPadding){
        vm.runningEvent = true;
        var currentSessionIndex = _.findIndex(vm.sessions, function(s){ return s.end > now; }); // sessions should be sorted by start:end:name
        if(currentSessionIndex === -1){
          vm.previousSessions = vm.sessions;
        } else {
          vm.previousSessions = _.take(vm.sessions, currentSessionIndex);
          vm.currentSession = vm.sessions[currentSessionIndex];
          var tmp = _.partition(_.drop(vm.sessions, currentSessionIndex+1), function(s){ return s.start < vm.currentSession.end + sessionPadding; });
          vm.nearSessions = tmp[0];
          vm.farSessions = tmp[1];
          vm.bgCurrentSession = 'img/event/currentSession.jpg';
        }
      } else {
        vm.runningEvent = false;
      }

      vm.exponents = EventUtils.getFavoriteExponents(event, userData).sort(sortExponents);
      vm.exponentMoods = EventUtils.getMoodFor(userData, vm.exponents);
    });

    function togglePreviousSessions(){
      vm.showPreviousSessions = !vm.showPreviousSessions;
      $ionicScrollDelegate.resize();
      if(!vm.showPreviousSessions){
        IonicUtils.scrollTo('previousSessions');
      }
    }
    function toggleFarSessions(){
      vm.showFarSessions = !vm.showFarSessions;
      $ionicScrollDelegate.resize();
      if(!vm.showFarSessions){
        IonicUtils.scrollTo('current-session');
      }
    }

    function exponentDone(value, index){
      if(value && !vm.showMoodBars[index]){
        $timeout(function(){
          vm.showMoodBars[index] = false;
        }, 3000);
      }
      vm.showMoodBars[index] = value;
    }

    function sortSessions(a, b){
      if(a.start !== b.start) return a.start - b.start;
      else if(a.end !== b.end) return a.end - b.end;
      return strComp(a.name, b.name);
    }
    function sortExponents(a, b){
      var aDone = vm.isDone(a);
      var bDone = vm.isDone(b);
      if(aDone === bDone){ return strComp(a.name, b.name); }
      else if(aDone){ return 1; }
      else { return -1; }
    }
    function strComp(str1, str2){
      var v1 = str1 ? str1.toLowerCase() : str1;
      var v2 = str2 ? str2.toLowerCase() : str2;
      if (v1 > v2) return 1;
      if (v1 < v2) return -1;
      return 0;
    }
  }
})();
