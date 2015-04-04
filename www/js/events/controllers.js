angular.module('app')

// TODO : show only future sessions (option activated by default in session filter)
// TODO : filter by day in 'Sessions' & 'Program' and show by default sessions of the current day (or first day)

.controller('EventsCtrl', function($scope, EventSrv, events){
  'use strict';
  // ParseEventLoader.loadDevoxxEvent('DevoxxFR2015');
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.events = events;

  fn.refresh = function(){
    EventSrv.getEvents(true).then(function(events){
      data.events = events;
    }).finally(function(){
      $scope.$broadcast('scroll.refreshComplete');
    });
  };
})

.controller('EventCtrl', function($scope, $q, $stateParams, EventSrv, IonicSrv){
  'use strict';
  var eventId = $stateParams.eventId;
  var fn = {};
  $scope.fn = fn;

  // TODO : where to call it and how to update data on other controllers ?
  fn.refresh = function(){
    IonicSrv.withLoading($q.all([
      EventSrv.getEventInfo(eventId, true),
      EventSrv.getEventSessions(eventId, true),
      EventSrv.getEventParticipants(eventId, true)
    ]));
  };
})

.controller('EventInfoCtrl', function($scope, $window, event){
  'use strict';
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.event = event;

  fn.mapUrl = function(adress){
    return 'https://maps.googleapis.com/maps/api/staticmap?markers=color:red%7C'+adress+'&zoom=15&size='+($window.innerWidth-20)+'x300';
  };
})

.controller('EventSessionsCtrl', function($scope, $stateParams, EventSrv, IonicSrv, event){
  'use strict';
  var eventId = $stateParams.eventId;
  var data = {}, fn = {}, ui = {};
  $scope.data = data;
  $scope.fn = fn;
  $scope.ui = ui;

  data.event = event;
  EventSrv.getEventSessions(eventId).then(function(sessions){
    data.sessions = sessions;
    data.dailySessions = EventSrv.groupByDay(EventSrv.groupBySlot(sessions));
    data.daySessions = _.find(data.dailySessions, {date: Date.parse(moment(new Date()).format('MM/DD/YYYY'))});
    if(!data.daySessions){
      data.daySessions = data.dailySessions[0];
    }
    data.sessionValues = EventSrv.getSessionValues(sessions);
  });

  fn.setDay = function(index){
    data.daySessions = data.dailySessions[index];
  };
  fn.scrollTo = IonicSrv.scrollTo;

  $scope.$on('$ionicView.enter', function(){
    EventSrv.getEventUserData(eventId).then(function(userData){
      data.userData = userData;
    });
  });

  EventSrv.getSessionFilterModal($scope).then(function(modal){
    ui.filterModal = modal;
  });

  fn.isFav = function(session){
    return EventSrv.isSessionFav(data.userData, session);
  };
  fn.openFilter = function(){
    ui.filterModal.show();
  };
  fn.closeFilter = function(){
    ui.filterModal.hide();
    data.sessionFilter = angular.copy(data.modalData);
  };
  fn.clearFilter = function(){
    if(data.modalData){
      delete data.modalData.search;
      delete data.modalData.filter;
    }
  };
  fn.isFiltered = function(){
    if(data.sessionFilter){
      return hasValue(data.sessionFilter.search) || hasValue(data.sessionFilter.filter);
    }
    return false;
  };

  function hasValue(obj){
    if(obj){
      if(typeof obj === 'object'){
        for(var i in obj){
          if(hasValue(obj[i])){ return true; }
        }
      } else {
        return !!obj;
      }
    }
    return false;
  }

  $scope.$on('$destroy', function(){
    ui.filterModal.remove();
  });
})

.controller('EventSessionCtrl', function($scope, $stateParams, EventSrv, session, userData){
  'use strict';
  var eventId = $stateParams.eventId;
  var sessionId = $stateParams.sessionId;
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.eventId = eventId;
  data.session = session;
  data.userData = userData;
  $scope.$on('$ionicView.enter', function(){
    EventSrv.getEventUserData(eventId).then(function(userData){
      data.userData = userData;
    });
  });

  fn.isFav = function(session){
    return EventSrv.isSessionFav(data.userData, session);
  };
  fn.toggleFav = function(session){
    var action = fn.isFav(session) ? EventSrv.removeSessionFromFav : EventSrv.addSessionToFav;
    action(eventId, session).then(function(userData){
      data.userData = userData;
    });
  };
})

.controller('EventParticipantsCtrl', function($scope, $stateParams, EventSrv, event){
  'use strict';
  var eventId = $stateParams.eventId;
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.event = event;
  EventSrv.getEventParticipants(eventId).then(function(participants){
    data.participants = participants;
  });
})

.controller('EventParticipantCtrl', function($scope, $stateParams, participant){
  'use strict';
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.eventId = $stateParams.eventId;
  data.participant = participant;
})

.controller('EventProgramCtrl', function($scope, $stateParams, $ionicModal, EventSrv, event){
  'use strict';
  var eventId = $stateParams.eventId;
  var sessions = [];
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.event = event;
  EventSrv.getEventSessions(eventId).then(function(allSessions){
    sessions = _.filter(allSessions, function(session){
      return session.format !== 'break';
    });
    EventSrv.buildChooseSessionModal(eventId, sessions).then(function(scope){
      fn.chooseSession = scope.fn.initModal;
    });
    data.groupedSessions = EventSrv.groupBySlot(sessions);
    _.map(data.groupedSessions, function(group){
      group.sessions = [];
    });
    setProgramSessions();
  });

  $scope.$on('$ionicView.enter', function(){
    setProgramSessions();
  });

  function setProgramSessions(){
    EventSrv.getEventUserData(eventId).then(function(userData){
      _.map(data.groupedSessions, function(group){
        group.sessions = _.filter(sessions, function(session){
          return EventSrv.isSessionFav(userData, session) && group.from === session.from && group.to === session.to;
        });
      });
    });
  }
});
