angular.module('app')

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
  EventSrv.getEventData(eventId).then(function(eventData){
    data.event = eventData.event;
    data.speakers = eventData.speakers;
    data.activities = eventData.activities;
    data.groupedActivities = EventSrv.groupBySlot(eventData.activities);
    data.activityValues = EventSrv.getActivityValues(eventData.activities);
  });
})

.controller('EventActivitiesCtrl', function($scope, $ionicModal){
  'use strict';
  var fn = {}, ui = {};
  var data = $scope.data; // herited from EventCtrl
  $scope.fn = fn;
  $scope.ui = ui;

  $ionicModal.fromTemplateUrl('views/events/filter-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    ui.filterModal = modal;
  });

  fn.openFilter = function(){
    ui.filterModal.show();
  };
  fn.closeFilter = function(){
    ui.filterModal.hide();
  };
  fn.clearFilter = function(){
    delete data.activityFilter.search;
    delete data.activityFilter.filter;
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
    $scope.modal.remove();
  });
})

.controller('EventActivityCtrl', function($scope, $stateParams, EventSrv){
  'use strict';
  var eventId = $stateParams.eventId;
  var activityId = $stateParams.activityId;
  var title = $stateParams.title;
  var parentScopeData = $scope.data;
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.title = title;
  EventSrv.getEventActivity(eventId, activityId).then(function(activity){
    data.activity = activity;
  });

  $scope.$on('$ionicView.beforeEnter', function(){
    parentScopeData.hideTabs = true;
  });
  $scope.$on('$ionicView.beforeLeave', function(){
    parentScopeData.hideTabs = false;
  });
})

.controller('EventSpeakersCtrl', function($scope){
  'use strict';

});
