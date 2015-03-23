angular.module('app')

.factory('ChatSrv', function($firebaseArray, $http, UserSrv, Config, GeolocationPlugin){
  'use strict';
  var cache = {};
  var service = {
    setupRelationChat: setupRelationChat,
    sendToRelationChat: sendToRelationChat,
    getPublicRooms: getPublicRooms,
    setupPublicChat: setupPublicChat,
    sendToPublicChat: sendToPublicChat,
    destroy: destroy
  };

  function setupRelationChat(relation){
    var url = Config.firebase.url+'/oneToOneChat/'+relation.objectId;
    if(!cache[url]){
      var ref = new Firebase(url);
      cache[url] = $firebaseArray(ref);
    }
    return cache[url];
  }

  function sendToRelationChat(chat, message){
    return UserSrv.getCurrent().then(function(currentUser){
      var chatMessage = {
        time: Date.now(),
        user: {
          objectId: currentUser.objectId,
          pseudo: currentUser.pseudo,
          avatar: currentUser.avatar || null
        },
        content: message
      };
      return chat.$add(chatMessage);
    });
  }

  function getPublicRooms(){
    return $http.get(Config.firebase.url+'/publicChat.json?shallow=true').then(function(res){
      var rooms = [{id: 'SalooN'}];
      if(res && res.data){
        for(var i in res.data){
          if(res.data[i] && rooms.indexOf(i) === -1){
            rooms.push({id: i});
          }
        }
      }
      return rooms;
    });
  }

  function setupPublicChat(id){
    var url = Config.firebase.url+'/publicChat/'+id;
    if(!cache[url]){
      cache[url] = $firebaseArray(new Firebase(url));
    }
    return cache[url];
  }

  function sendToPublicChat(chat, message){
    return UserSrv.getCurrent().then(function(currentUser){
      return GeolocationPlugin.getCurrentPosition().then(function(pos){
        var chatMessage = {
          time: Date.now(),
          location: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          },
          user: {
            objectId: currentUser.objectId,
            pseudo: currentUser.pseudo,
            avatar: currentUser.avatar || null
          },
          content: message
        };
        return chat.$add(chatMessage);
      });
    });
  }

  function destroy(chat){
    delete cache[chat.$ref()];
    chat.$destroy();
  }

  return service;
});
