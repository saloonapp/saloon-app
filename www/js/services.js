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

.factory('PusherSrv', function(Config){
  'use strict';
  var pusher = new Pusher(Config.pusher.key);
  var service = {
    subscribe: subscribe,
    unsubscribe: unsubscribe,
    bind: bind,
    unbind: unbind
  };

  function subscribe(channel){ return pusher.subscribe(channel); }
  function unsubscribe(channel){ pusher.unsubscribe(channel); }
  function bind(channel, event, fn){ channel.bind(event, fn); }
  function unbind(channel, event, fn){ channel.unbind(event, fn); }

  return service;
})

.factory('NotificationSrv', function($state, $q, PushPlugin, DialogPlugin, ToastPlugin){
  'use strict';
  var service = {
    sendInvite: sendInvite,
    acceptInvite: acceptInvite,
    declineInvite: declineInvite,
    sendPrivateMessage: sendPrivateMessage,
    received: received
  };

  function sendInvite(fromUser, toUser){
    return _sendPush(toUser, {
      type: 'relation_invite',
      userId: fromUser.objectId,
      title: 'Invitation reçue',
      message: fromUser.pseudo+' vous invite à le rencontrer'
    });
  }

  function acceptInvite(fromUser, toUser){
    return _sendPush(toUser, {
      type: 'relation_accept',
      userId: fromUser.objectId,
      title: 'Invitation acceptée',
      message: fromUser.pseudo+' a accepté votre invitation :)'
    });
  }

  function declineInvite(fromUser, toUser){
    return _sendPush(toUser, {
      type: 'relation_decline',
      userId: fromUser.objectId,
      title: 'Invitation ignorée',
      message: fromUser.pseudo+' a ignorée votre invitation :('
    });
  }

  function sendPrivateMessage(fromUser, toUser, message){
    return _sendPush(toUser, {
      type: 'private_message',
      userId: fromUser.objectId,
      title: 'Message de '+fromUser.pseudo,
      message: message
    });
  }

  function received(notification){
    var data = notification.payload;
    if(['relation_invite', 'relation_accept', 'relation_decline'].indexOf(data.type) > -1){
      if(notification.foreground){
        DialogPlugin.confirmMulti(data.message, data.title, ['Voir profil', 'Ignorer']).then(function(btnIndex){
          if(btnIndex === 1){ $state.go('tabs.user', {id: data.userId}); }
          else if(btnIndex === 2){}
        });
      } else {
        $state.go('tabs.user', {id: data.userId});
      }
    } else if(data.type === 'private_message'){
      if(notification.foreground){
        if($state.is('tabs.user', {id: data.userId}) || $state.is('tabs.user', {id: data.userId, section: 'chat'})){
          ToastPlugin.showLongTop(data.title+' :\n'+data.message);
        } else {
          DialogPlugin.promptMulti(data.message, data.title, ['Voir profil', 'Ignorer', 'Répondre']).then(function(res){
            if(res.buttonIndex === 1){ $state.go('tabs.user', {id: data.userId, section: 'chat'}); }
            else if(res.buttonIndex === 2){}
            else if(res.buttonIndex === 3){ /* send answer */ }
          });
        }
      } else {
        $state.go('tabs.user', {id: data.userId});
      }
    } else {
      console.log('Notification received', notification);
    }
  }

  function _sendPush(toUser, data){
    // data should contains at least 'type', 'title' & 'message' fields !
    if(toUser && toUser.push && toUser.push.id && toUser.push.platform === 'android'){
      return PushPlugin.sendPush([toUser.push.id], data);
    } else {
      console.log('no able to push to user', toUser);
      return $q.when();
    }
  }

  return service;
});
