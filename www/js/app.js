(function(){
  'use strict';
  angular.module('app', ['ionic', 'ngCordova', 'LocalForageModule'])
    .config(configure)
    .run(runBlock);

  configure.$inject = ['$urlRouterProvider', '$provide'];
  function configure($urlRouterProvider, $provide){
    $urlRouterProvider.otherwise('/loading');

    // improve angular logger
    $provide.decorator('$log', ['$delegate', 'customLogger', function($delegate, customLogger){
      return customLogger($delegate);
    }]);
  }

  function runBlock(UserSrv, PushPlugin, ToastPlugin, Config){
    setupPushNotifications();

    ////////////////

    function setupPushNotifications(){
      // /!\ To use this, you should add Push plugin : ionic plugin add https://github.com/phonegap-build/PushPlugin
      // registrationId should be uploaded to the server, it is required to send push notification
      PushPlugin.register(Config.gcm.senderID).then(function(registrationId){
        return UserSrv.get().then(function(user){
          if(!user){ user = {}; }
          user.pushId = registrationId;
          return UserSrv.set(user);
        });
      });
      PushPlugin.onNotification(function(notification){
        ToastPlugin.show('Notification received: '+notification.payload.title);
        console.log('Notification received', notification);
      });
    }
  }
})();
