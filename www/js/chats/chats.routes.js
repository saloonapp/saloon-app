(function(){
  'use strict';
  angular.module('app')
    .config(configure);

  function configure($stateProvider){
    $stateProvider
      .state('app.chat', {
      url: '/chat',
      views: {
        'chat-tab': {
          templateUrl: 'js/chats/chats.html',
          controller: 'ChatsCtrl'
        }
      }
    });
  }
})();
