angular.module('app', ['ionic', 'ngCordova', 'LocalForageModule', 'angularMoment', 'firebase'])

.config(function($stateProvider, $urlRouterProvider, $provide, $httpProvider, ParseUtilsProvider, Config) {
  'use strict';
  ParseUtilsProvider.initialize(Config.parse.applicationId, Config.parse.restApiKey);

  $stateProvider
  .state('loading', {
    url: '/loading',
    templateUrl: 'views/onboarding/loading.html',
    controller: 'LoadingCtrl',
  })
  .state('welcome', {
    url: '/welcome',
    templateUrl: 'views/onboarding/welcome.html',
    controller: 'WelcomeCtrl',
    data: {
      restrictAccess: ['notLogged']
    }
  })
  .state('register', {
    url: '/register',
    templateUrl: 'views/onboarding/register.html',
    controller: 'RegisterCtrl',
    data: {
      restrictAccess: ['notLogged']
    }
  })
  .state('signin', {
    url: '/signin',
    templateUrl: 'views/onboarding/signin.html',
    controller: 'SigninCtrl',
    data: {
      restrictAccess: ['notLogged']
    }
  })
  .state('createaccountwithprofile', {
    url: '/createaccountwithprofile',
    templateUrl: 'views/onboarding/createaccountwithprofile.html',
    controller: 'CreateAccountWithProfileCtrl',
    data: {
      restrictAccess: ['notLogged']
    }
  })
  .state('fillprofile', {
    url: '/fillprofile',
    templateUrl: 'views/onboarding/fillprofile.html',
    controller: 'FillProfileCtrl',
    data: {
      restrictAccess: ['logged']
    }
  })

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'views/menu.html',
    controller: 'SidemenuCtrl',
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('app.live', {
    url: '/tabs',
    abstract: true,
    views: {
      'menuContent': {
        templateUrl: 'views/live/tabs.html',
        controller: 'TabsCtrl',
      }
    },
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('app.live.users', {
    url: '/users',
    views: {
      'users-tab': {
        templateUrl: 'views/live/user/users.html',
        controller: 'UsersCtrl'
      }
    },
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('app.live.user', {
    url: '/user/:id?section',
    views: {
      'users-tab': {
        templateUrl: 'views/live/user/user.html',
        controller: 'UserCtrl'
      }
    },
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('app.live.chats', {
    url: '/chats',
    views: {
      'chats-tab': {
        templateUrl: 'views/live/chat/chats.html',
        controller: 'ChatsCtrl'
      }
    },
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('app.live.chat', {
    url: '/chat/:id',
    views: {
      'chats-tab': {
        templateUrl: 'views/live/chat/chat.html',
        controller: 'ChatCtrl'
      }
    },
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('app.live.polls', {
    url: '/polls',
    views: {
      'polls-tab': {
        templateUrl: 'views/live/poll/polls.html',
        controller: 'PollsCtrl'
      }
    },
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('app.live.pollcreate', {
    url: '/polls/create',
    views : {
      'polls-tab': {
        templateUrl: 'views/live/poll/create.html',
        controller: 'PollCreationCtrl'
      }
    },
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('app.events', {
    url: '/events',
    views: {
      'menuContent': {
        templateUrl: 'views/events/list.html',
        controller: 'EventsCtrl',
      }
    },
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('app.profile', {
    url: '/profile',
    views : {
      'menuContent': {
        templateUrl: 'views/profile/details.html',
        controller: 'ProfileCtrl'
      }
    },
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('app.profileEdit', {
    url: '/profile-edit',
    views : {
      'menuContent': {
        templateUrl: 'views/profile/edit.html',
        controller: 'ProfileEditCtrl'
      }
    },
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('app.contacts', {
    url: '/contacts',
    views : {
      'menuContent': {
        templateUrl: 'views/profile/contacts.html',
        controller: 'ContactsCtrl'
      }
    },
    data: {
      restrictAccess: ['logged']
    }
  });

  $urlRouterProvider.otherwise('/loading');

  // improve angular logger
  $provide.decorator('$log', ['$delegate', 'customLogger', function($delegate, customLogger){
    return customLogger($delegate);
  }]);

  // configure $http requests according to authentication
  $httpProvider.interceptors.push('AuthInterceptor');
})

.constant('Config', Config)

.run(function($rootScope, $state, $log, AuthSrv, UserSrv, PushPlugin, NotificationSrv, Config){
  'use strict';
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    if(toState && toState.data && Array.isArray(toState.data.restrictAccess)){
      var restricted = toState.data.restrictAccess;
      var logged = AuthSrv.isLogged();
      if(logged && restricted.indexOf('notLogged') > -1){
        event.preventDefault();
        $log.log('IllegalAccess', 'State <'+toState.name+'> is restricted to non logged users !');
        $state.go('app.live.users');
      } else if(!logged && restricted.indexOf('logged') > -1){
        event.preventDefault();
        $log.log('IllegalAccess', 'State <'+toState.name+'> is restricted to logged users !');
        $state.go('welcome');
      }
    }
  });

  PushPlugin.register(Config.gcm.projectNumber).then(function(registrationId){
    return UserSrv.getCurrent().then(function(user){
      if(user && !user.push){
        user.push = {
          id: registrationId,
          platform: ionic.Platform.platform()
        }
        return UserSrv.setCurrent(user);
      }
    });
  });
  PushPlugin.onNotification(function(notification){
    NotificationSrv.received(notification);
  });

  $rootScope.safeApply = function(fn){
    var phase = this.$root ? this.$root.$$phase : this.$$phase;
    if(phase === '$apply' || phase === '$digest'){
      if(fn && (typeof(fn) === 'function')){
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };
});

