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
      abstract: true,
      templateUrl: 'js/events/event-details.html',
      controller: 'EventDetailsCtrl',
      resolve: {
        event: function($stateParams, EventSrv, IonicUtils){
          return IonicUtils.withLoading(EventSrv.get($stateParams.uuid));
        }
      }
    })
      .state('app.event.infos', {
      url: '/infos',
      views: {
        'infos-tab': {
          templateUrl: 'js/events/event-details-infos.html',
          controller: 'EventDetailsInfosCtrl'
        }
      }
    })
      .state('app.event.exponents', {
      url: '/exponents',
      views: {
        'exponents-tab': {
          templateUrl: 'js/events/event-details-exponents.html',
          controller: 'EventDetailsExponentsCtrl'
        }
      }
    })
      .state('app.event.sessions', {
      url: '/sessions',
      views: {
        'sessions-tab': {
          templateUrl: 'js/events/event-details-sessions.html',
          controller: 'EventDetailsSessionsCtrl'
        }
      }
    });
  }
})();
