angular.module('app')

.factory('PublicMessageSrv', function($q, UserSrv, UsersSrv, ParseUtils, Utils, GeolocationPlugin){
  'use strict';
  var matchDistance = 1; // 1 km
  var matchMaxAge = 60 * 60 * 1000; // 1h
  var messageCrud = ParseUtils.createCrud('PublicMessage');
  var messageByRoomCache = null;
  var service = {
    getNearMessages: getNearMessages,
    getNearMessagesByRoom: getNearMessagesByRoom,
    sendTo: sendTo
  };

  function getNearMessages(){
    return UserSrv.getCurrent().then(function(currentUser){
      return GeolocationPlugin.getCurrentPosition().then(function(pos){
        return messageCrud.find({
          updatedAt: {$gt: ParseUtils.toDate(Date.now() - matchMaxAge)},
          location: {
            $nearSphere: ParseUtils.toGeoPoint(pos.coords.latitude, pos.coords.longitude),
            $maxDistanceInKilometers: matchDistance
          }
        }, '&order=room,-updatedAt').then(function(messages){
          messageByRoomCache = _.groupBy(messages, 'room');
          return angular.copy(messageByRoomCache);
        });
      });
    });
  }

  function getNearMessagesByRoom(room, _noCache){
    if(messageByRoomCache && messageByRoomCache[room] && !_noCache){
      return Utils.async(function(){
        return angular.copy(messageByRoomCache[room]);
      });
    } else {
      return UserSrv.getCurrent().then(function(currentUser){
        return GeolocationPlugin.getCurrentPosition().then(function(pos){
          return messageCrud.find({
            room: room,
            updatedAt: {$gt: ParseUtils.toDate(Date.now() - matchMaxAge)},
            location: {
              $nearSphere: ParseUtils.toGeoPoint(pos.coords.latitude, pos.coords.longitude),
              $maxDistanceInKilometers: matchDistance
            }
          }, '&order=room,-updatedAt').then(function(messages){
            if(!messageByRoomCache){ messageByRoomCache = {}; }
            messageByRoomCache[room] = messages;
            return angular.copy(messages);
          });
        });
      });
    }
  }

  function sendTo(room, message){
    return UserSrv.getCurrent().then(function(currentUser){
      return GeolocationPlugin.getCurrentPosition().then(function(pos){
        var chatMessage = {
          room: room,
          from: ParseUtils.toPointer('_User', currentUser),
          location: ParseUtils.toGeoPoint(pos.coords.latitude, pos.coords.longitude),
          locationAccuracy: pos.coords.accuracy,
          content: {
            text: message
          }
        };
        return messageCrud.save(chatMessage).then(function(sentMessage){
          sentMessage.from = currentUser;
          return sentMessage;
        });
      });
    });
  }

  return service;
});
