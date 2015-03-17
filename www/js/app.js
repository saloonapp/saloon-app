angular.module('app', ['ionic', 'ngCordova', 'LocalForageModule', 'firebase'])

.config(function($stateProvider, $urlRouterProvider, $provide, $httpProvider, AuthSrvProvider, ParseUtilsProvider, Config) {
  'use strict';
  ParseUtilsProvider.initialize(Config.parse.applicationId, Config.parse.restApiKey);

  $stateProvider
  .state('login_welcome', {
    url: '/welcome',
    templateUrl: 'views/onboarding/welcome.html',
    controller: 'WelcomeCtrl'
  })
  .state('login_register', {
    url: '/register',
    templateUrl: 'views/onboarding/register.html',
    controller: 'RegisterCtrl'
  })
  .state('login_login', {
    url: '/signin',
    templateUrl: 'views/onboarding/signin.html',
    controller: 'SigninCtrl'
  })
  .state('login_createaccountwithprofile', {
    url: '/createaccountwithprofile',
    templateUrl: 'views/onboarding/createaccountwithprofile.html',
    controller: 'CreateAccountWithProfileCtrl'
  })
  .state('fillprofile', {
    url: '/fillprofile',
    templateUrl: 'views/onboarding/fillprofile.html',
    controller: 'FillProfileCtrl'
  })

  .state('tabs', {
    url: '/tabs',
    abstract: true,
    templateUrl: 'views/tabs.html',
    controller: 'TabsCtrl'
  })
  .state('tabs.users', {
    url: '/users',
    views: {
      'users-tab': {
        templateUrl: 'views/user/users.html',
        controller: 'UsersCtrl'
      }
    }
  })
  .state('tabs.contacts', {
    url: '/contacts',
    views: {
      'users-tab': {
        templateUrl: 'views/user/contacts.html',
        controller: 'ContactsCtrl'
      }
    }
  })
  .state('tabs.user', {
    url: '/user/:id',
    views: {
      'users-tab': {
        templateUrl: 'views/user/user.html',
        controller: 'UserCtrl'
      }
    }
  })
  .state('tabs.chats', {
    url: '/chats',
    views: {
      'chats-tab': {
        templateUrl: 'views/chat/chats.html',
        controller: 'ChatsCtrl'
      }
    }
  })
  .state('tabs.chat', {
    url: '/chat/:id',
    views: {
      'chats-tab': {
        templateUrl: 'views/chat/chat.html',
        controller: 'ChatCtrl'
      }
    }
  })
  .state('tabs.polls', {
    url: '/polls',
    views: {
      'polls-tab': {
        templateUrl: 'views/poll/polls.html',
        controller: 'PollsCtrl'
      }
    }
  })
  .state('tabs.pollcreate', {
    url: '/polls/create',
      views : {
        'polls-tab': {
          templateUrl: 'views/poll/create.html',
          controller: 'PollCreationCtrl'
        }
      }
  })
  .state('tabs.issues', {
    url: '/issues',
    views: {
      'issues-tab': {
        templateUrl: 'views/issue/issues.html',
        controller: 'IssuesCtrl'
      }
    }
  });

  if(AuthSrvProvider.isLogged()){
    $urlRouterProvider.otherwise('/tabs/users');
  } else {
    $urlRouterProvider.otherwise('/welcome');
  }

  // improve angular logger
  $provide.decorator('$log', ['$delegate', 'customLogger', function($delegate, customLogger){
    return customLogger($delegate);
  }]);

  // configure $http requests according to authentication
  $httpProvider.interceptors.push('AuthInterceptor');
})

.constant('Config', Config)

.run(function($rootScope, $state, $log, AuthSrv, UserSrv, Utils, PushPlugin, NotificationSrv, Config){
  'use strict';
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
    var logged = AuthSrv.isLogged();
    if(Utils.startsWith(toState.name, 'login') && logged){
      event.preventDefault();
      $log.log('IllegalAccess', 'Already logged in !');
      $state.go('tabs.users');
    } else if(!Utils.startsWith(toState.name, 'login') && !logged){
      event.preventDefault();
      $log.log('IllegalAccess', 'Not allowed to access to <'+toState.name+'> state !');
      $state.go('login_welcome');
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

