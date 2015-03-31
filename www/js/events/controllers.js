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
});
