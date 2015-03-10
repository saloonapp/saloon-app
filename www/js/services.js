angular.module('app')

.factory('TabSrv', function(){
  'use strict';
  var service = {
    badges: {
      users: 0
    }
  };

  return service;
})

.factory('NotificationSrv', function(RelationsSrv){
  'use strict';
  var service = {
    received: received
  };

  function received(notification){
    if(notification.payload.type === 'relation_invite'){ RelationsSrv.onInvitation(notification, notification.payload); }
    else if(notification.payload.type === 'relation_accept'){ RelationsSrv.onInvitation(notification, notification.payload); }
    else if(notification.payload.type === 'relation_decline'){ RelationsSrv.onInvitation(notification, notification.payload); }
    else { console.log('Notification received', notification); }
  }

  return service;
});
