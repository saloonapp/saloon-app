(function(){
  'use strict';
  angular.module('app')
    .config(configure);

  function configure($stateProvider){
    var routes = {
      events: {
        url: '/events',
        templateUrl: 'js/events/events.html',
        controller: 'EventsCtrl',
        resolve: {
          events: function(EventSrv, IonicUtils){
            return IonicUtils.withLoading(EventSrv.getAll());
          }
        }
      },
      event: {
        url: '/events/:eventId',
        abstract: true,
        cache: false, // see http://forum.ionicframework.com/t/problem-with-tabs-in-detail-view/22651
        templateUrl: 'js/events/event.html',
        controller: 'EventCtrl',
        resolve: {
          event: function($stateParams, EventSrv, IonicUtils){
            return IonicUtils.withLoading(EventSrv.get($stateParams.eventId));
          },
          userData: function($stateParams, EventSrv, IonicUtils){
            return IonicUtils.withLoading(EventSrv.getUserData($stateParams.eventId));
          }
        }
      },
      eventInfo: {
        url: '/infos',
        views: {
          'infos-tab': {
            templateUrl: 'js/events/event-infos.html',
            controller: 'EventInfosCtrl'
          }
        }
      },
      eventSessions: {
        url: '/sessions',
        views: {
          'sessions-tab': {
            templateUrl: 'js/events/event-sessions.html',
            controller: 'EventSessionsCtrl'
          }
        }
      },
      eventSession: {
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
      },
      eventExponents: {
        url: '/exponents',
        views: {
          'exponents-tab': {
            templateUrl: 'js/events/event-exponents.html',
            controller: 'EventExponentsCtrl'
          }
        }
      },
      eventExponent: {
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
      },
      eventProgram: {
        url: '/program',
        views: {
          'program-tab': {
            templateUrl: 'js/events/event-program.html',
            controller: 'EventProgramCtrl'
          }
        }
      },
      eventProgramSession: {
        url: '/sessions/:sessionId',
        views: {
          'program-tab': {
            templateUrl: 'js/events/event-session.html',
            controller: 'EventSessionCtrl'
          }
        },
        resolve: {
          session: function($stateParams, EventSrv, IonicUtils){
            return IonicUtils.withLoading(EventSrv.getSession($stateParams.eventId, $stateParams.sessionId));
          }
        }
      },
      eventProgramExponent: {
        url: '/exponents/:exponentId',
        views: {
          'program-tab': {
            templateUrl: 'js/events/event-exponent.html',
            controller: 'EventExponentCtrl'
          }
        },
        resolve: {
          exponent: function($stateParams, EventSrv, IonicUtils){
            return IonicUtils.withLoading(EventSrv.getExponent($stateParams.eventId, $stateParams.exponentId));
          }
        }
      }
    };

    $stateProvider
      .state('app.events', routes.events)
      .state('app.event', routes.event)
      .state('app.event.infos', routes.eventInfo)
      .state('app.event.sessions', routes.eventSessions)
      .state('app.event.session', routes.eventSession)
      .state('app.event.exponents', routes.eventExponents)
      .state('app.event.exponent', routes.eventExponent)
      .state('app.event.program', routes.eventProgram)
      .state('app.event.programSession', routes.eventProgramSession)
      .state('app.event.programExponent', routes.eventProgramExponent);
  }
})();
