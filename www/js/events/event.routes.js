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
      url: '/events/:eventId',
      abstract: true,
      templateUrl: 'js/events/event.html',
      controller: 'EventCtrl',
      resolve: {
        event: function($stateParams, EventSrv, IonicUtils){
          return IonicUtils.withLoading(EventSrv.get($stateParams.eventId));
        }
      }
    })
      .state('app.event.infos', {
      url: '/infos',
      views: {
        'infos-tab': {
          templateUrl: 'js/events/event-infos.html',
          controller: 'EventInfosCtrl'
        }
      }
    })
      .state('app.event.exponents', {
      url: '/exponents',
      views: {
        'exponents-tab': {
          templateUrl: 'js/events/event-exponents.html',
          controller: 'EventExponentsCtrl'
        }
      }
    })
      .state('app.event.exponent', {
      url: '/exponents/:exponentId',
      views: {
        'exponents-tab': {
          templateUrl: 'js/events/event-exponent.html',
          controller: 'EventExponentCtrl'
        }
      },
      resolve: {
        exponent: function($stateParams, EventSrv, IonicUtils){
          return IonicUtils.withLoading(EventSrv.getExponent($stateParams.eventId, $stateParams.exponentId));
        }
      }
    })
      .state('app.event.sessions', {
      url: '/sessions',
      views: {
        'sessions-tab': {
          templateUrl: 'js/events/event-sessions.html',
          controller: 'EventSessionsCtrl'
        }
      }
    })
      .state('app.event.session', {
      url: '/sessions/:sessionId',
      views: {
        'sessions-tab': {
          templateUrl: 'js/events/event-session.html',
          controller: 'EventSessionCtrl'
        }
      },
      resolve: {
        session: function($stateParams, EventSrv, IonicUtils){
          return IonicUtils.withLoading(EventSrv.getSession($stateParams.eventId, $stateParams.sessionId));
        }
      }
    });
  }
})();
