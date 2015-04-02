angular.module('app')

// TODO : show only future sessions (option activated by default in session filter)
// TODO : filter by day in 'Sessions' & 'Programm' and show by default sessions of the current day (or first day)

.controller('EventsCtrl', function($scope, EventSrv){
  'use strict';
  // ParseEventLoader.loadDevoxxEvent('DevoxxFR2015');
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  EventSrv.getEvents().then(function(events){
    data.events = events;
  });


  /*
   * Filtrer par :
   *  - jour
   *  - slot (talks en mm temps)
   *  - room (talks dans la mm salle)
   *  - format
   *  - track
   *  - speaker
   */
})

.controller('EventCtrl', function($scope, $stateParams, EventSrv){
  'use strict';
  var eventId = $stateParams.eventId;
  $scope.eventId = eventId;
  var title = $stateParams.title;
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.title = title;
  EventSrv.getEventInfo(eventId).then(function(info){
    data.event = info;
  });
  EventSrv.getEventSpeakers(eventId).then(function(speakers){
    data.speakers = speakers;
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
})

.controller('EventInfoCtrl', function($scope){
  'use strict';

})

.controller('EventActivitiesCtrl', function($scope, EventSrv){
  'use strict';
  var fn = {}, ui = {};
  var data = $scope.data; // herited from EventCtrl
  $scope.fn = fn;
  $scope.ui = ui;

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
  var title = $stateParams.title;
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.title = title;
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

.controller('EventSpeakersCtrl', function($scope){
  'use strict';

})

.controller('EventSpeakerCtrl', function($scope, $stateParams, EventSrv){
  'use strict';
  var eventId = $stateParams.eventId;
  var speakerId = $stateParams.speakerId;
  var title = $stateParams.title;
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.title = title;
  EventSrv.getEventSpeaker(eventId, speakerId).then(function(speaker){
    data.speaker = speaker;
  });
})

.controller('EventProgrammCtrl', function($scope, $stateParams, $ionicModal, EventSrv){
  'use strict';
  var eventId = $stateParams.eventId;
  var title = $stateParams.title;
  var activities = [];
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.title = title;
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
    EventSrv.getEventUserData(eventId).then(function(userData){
      _.map(data.groupedActivities, function(group){
        group.activities = _.filter(activities, function(activity){
          return EventSrv.isActivityFav(userData, activity) && group.from === activity.from && group.to === activity.to;
        });
      });
    });
  });

  $scope.$on('$ionicView.enter', function(){
    EventSrv.getEventUserData(eventId).then(function(userData){
      _.map(data.groupedActivities, function(group){
        group.activities = _.filter(activities, function(activity){
          return EventSrv.isActivityFav(userData, activity) && group.from === activity.from && group.to === activity.to;
        });
      });
    });
  });
});
