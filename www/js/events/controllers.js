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
    data.activityValues = EventSrv.valueLists(['format', 'from', 'category', 'room'], eventData.activities);
    data.activityValues.from = _.map(_.sortBy(data.activityValues.from, function(f){
      return new Date(f).getTime();
    }), function(f){
      return {
        data: f,
        group: f ? moment(f).format('dddd') : 'Non planifié',
        label: f ? moment(f).format('ddd H\\hmm') : 'Non planifié'
      };
    });
    console.log('data.activityValues', data.activityValues);
  });
})

.controller('EventActivitiesCtrl', function($scope, $ionicModal){
  'use strict';
  var fn = {}, ui = {};
  var data = $scope.data; // herited from EventCtrl
  $scope.fn = fn;
  $scope.ui = ui;

  fn.activityFilter = function(criteria){
    return function(item){
      return isMatch(item, criteria);
    };
  };

  function isMatch(obj, filter){
    for(var i in filter){
      if(filter[i]){
        if(!obj[i] || ((typeof obj[i]) !== (typeof filter[i]))){
          return false;
        } else if(typeof filter[i] === 'object' && !isMatch(obj[i], filter[i])){
          return false;
        } else if(typeof filter[i] === 'string' && obj[i] !== filter[i]){
          return false;
        }
      }
    }
    return true;
  }

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
