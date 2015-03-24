angular.module('app', ['ionic', 'ngCordova', 'LocalForageModule', 'angularMoment'])

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

  .state('tabs', {
    url: '/tabs',
    abstract: true,
    templateUrl: 'views/tabs.html',
    controller: 'TabsCtrl',
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('tabs.users', {
    url: '/users',
    views: {
      'users-tab': {
        templateUrl: 'views/user/users.html',
        controller: 'UsersCtrl'
      }
    },
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('tabs.contacts', {
    url: '/contacts',
    views: {
      'users-tab': {
        templateUrl: 'views/user/contacts.html',
        controller: 'ContactsCtrl'
      }
    },
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('tabs.user', {
    url: '/user/:id?section',
    views: {
      'users-tab': {
        templateUrl: 'views/user/user.html',
        controller: 'UserCtrl'
      }
    },
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('tabs.chats', {
    url: '/chats',
    views: {
      'chats-tab': {
        templateUrl: 'views/chat/chats.html',
        controller: 'ChatsCtrl'
      }
    },
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('tabs.chat', {
    url: '/chat/:id',
    views: {
      'chats-tab': {
        templateUrl: 'views/chat/chat.html',
        controller: 'ChatCtrl'
      }
    },
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('tabs.polls', {
    url: '/polls',
    views: {
      'polls-tab': {
        templateUrl: 'views/poll/polls.html',
        controller: 'PollsCtrl'
      }
    },
    data: {
      restrictAccess: ['logged']
    }
  })
  .state('tabs.issues', {
    url: '/issues',
    views: {
      'issues-tab': {
        templateUrl: 'views/issue/issues.html',
        controller: 'IssuesCtrl'
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
        $state.go('tabs.users');
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
});

