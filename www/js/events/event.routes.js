(function(){
  'use strict';
  angular.module('app')
    .config(configure);

  function configure($stateProvider){
    $stateProvider
      .state('app.events', {
      url: '/events',
      templateUrl: 'js/events/events.html',
      controller: 'EventsCtrl',
      resolve: {
        events: function(EventSrv, IonicUtils){
          return IonicUtils.withLoading(EventSrv.getAll());
        }
      }
    })
      .state('app.event', {
      url: '/events/:uuid',
      templateUrl: 'js/events/event-details.html',
      controller: 'EventDetailsCtrl',
      resolve: {
        event: function($stateParams, EventSrv, IonicUtils){
          return IonicUtils.withLoading(EventSrv.get($stateParams.uuid));
        }
      }
    });
  }
})();
