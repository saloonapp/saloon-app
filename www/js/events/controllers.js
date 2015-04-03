angular.module('app')

// TODO : show only future sessions (option activated by default in session filter)
// TODO : filter by day in 'Sessions' & 'Program' and show by default sessions of the current day (or first day)

.controller('EventsCtrl', function($scope, EventSrv){
  'use strict';
  // ParseEventLoader.loadDevoxxEvent('DevoxxFR2015');
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  EventSrv.getEvents().then(function(events){
    data.events = events;
  });

  fn.refresh = function(){
    EventSrv.getEvents(true).then(function(events){
      data.events = events;
    }).finally(function(){
      $scope.$broadcast('scroll.refreshComplete');
    });
  };
})

.controller('EventCtrl', function($scope){
  'use strict';
})

.controller('EventInfoCtrl', function($scope, $stateParams, $window, EventSrv){
  'use strict';
  var eventId = $stateParams.eventId;
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  EventSrv.getEventInfo(eventId).then(function(info){
    data.event = info;
  });

  fn.mapUrl = function(adress){
    return 'https://maps.googleapis.com/maps/api/staticmap?markers=color:red%7C'+adress+'&zoom=15&size='+($window.innerWidth-20)+'x300';
  };
})

.controller('EventActivitiesCtrl', function($scope, $stateParams, EventSrv){
  'use strict';
  var eventId = $stateParams.eventId;
  var data = {}, fn = {}, ui = {};
  $scope.data = data;
  $scope.fn = fn;
  $scope.ui = ui;

  EventSrv.getEventInfo(eventId).then(function(info){
    data.event = info;
  });
  EventSrv.getEventActivities(eventId).then(function(activities){
    data.activities = activities;
    data.groupedActivities = EventSrv.groupBySlot(activities);
    data.activityValues = EventSrv.getActivityValues(activities);
  });

  $scope.$on('$ionicView.enter', function(){
    EventSrv.getEventUserData(eventId).then(function(userData){
      data.userData = userData;
    });
  });

  EventSrv.getActivityFilterModal($scope).then(function(modal){
    ui.filterModal = modal;
  });

  fn.isFav = function(activity){
    return EventSrv.isActivityFav(data.userData, activity);
  };
  fn.openFilter = function(){
    ui.filterModal.show();
  };
  fn.closeFilter = function(){
    ui.filterModal.hide();
    data.activityFilter = angular.copy(data.modalData);
  };
  fn.clearFilter = function(){
    delete data.modalData.search;
    delete data.modalData.filter;
  };
  fn.isFiltered = function(){
    if(data.activityFilter){
      return hasValue(data.activityFilter.search) || hasValue(data.activityFilter.filter);
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

.controller('EventActivityCtrl', function($scope, $stateParams, EventSrv){
  'use strict';
  var eventId = $stateParams.eventId;
  var activityId = $stateParams.activityId;
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.eventId = eventId;
  EventSrv.getEventActivity(eventId, activityId).then(function(activity){
    data.activity = activity;
  });
  $scope.$on('$ionicView.enter', function(){
    EventSrv.getEventUserData(eventId).then(function(userData){
      data.userData = userData;
    });
  });

  fn.isFav = function(activity){
    return EventSrv.isActivityFav(data.userData, activity);
  };
  fn.toggleFav = function(activity){
    var action = fn.isFav(activity) ? EventSrv.removeActivityFromFav : EventSrv.addActivityToFav;
    action(eventId, activity).then(function(userData){
      data.userData = userData;
    });
  };
})

.controller('EventSpeakersCtrl', function($scope, $stateParams, EventSrv){
  'use strict';
  var eventId = $stateParams.eventId;
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  EventSrv.getEventInfo(eventId).then(function(info){
    data.event = info;
  });
  EventSrv.getEventSpeakers(eventId).then(function(speakers){
    data.speakers = speakers;
  });
})

.controller('EventSpeakerCtrl', function($scope, $stateParams, EventSrv){
  'use strict';
  var eventId = $stateParams.eventId;
  var speakerId = $stateParams.speakerId;
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.eventId = eventId;
  EventSrv.getEventSpeaker(eventId, speakerId).then(function(speaker){
    data.speaker = speaker;
  });
})

.controller('EventProgramCtrl', function($scope, $stateParams, $ionicModal, EventSrv){
  'use strict';
  var eventId = $stateParams.eventId;
  var activities = [];
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  EventSrv.getEventInfo(eventId).then(function(info){
    data.event = info;
  });
  EventSrv.getEventActivities(eventId).then(function(allActivities){
    activities = _.filter(allActivities, function (activity){
      return activity.format !== 'break';
    });
    EventSrv.buildChooseActivityModal(eventId, activities).then(function(scope){
      fn.chooseActivity = scope.fn.initModal;
    });
    data.groupedActivities = EventSrv.groupBySlot(activities);
    _.map(data.groupedActivities, function(group){
      group.activities = [];
    });
    setProgramActivities();
  });

  $scope.$on('$ionicView.enter', function(){
    setProgramActivities();
  });

  function setProgramActivities(){
    EventSrv.getEventUserData(eventId).then(function(userData){
      _.map(data.groupedActivities, function(group){
        group.activities = _.filter(activities, function(activity){
          return EventSrv.isActivityFav(userData, activity) && group.from === activity.from && group.to === activity.to;
        });
      });
    });
  }
});
