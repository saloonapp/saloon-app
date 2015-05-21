(function(){
  'use strict';
  angular.module('app')
    .factory('UserSrv', UserSrv)
    .factory('UserActionSync', UserActionSync);

  UserSrv.$inject = ['$http', 'StorageUtils', 'DevicePlugin', 'Config'];
  function UserSrv($http, StorageUtils, DevicePlugin, Config){
    var storageKey = 'user';
    var service = {
      getUser: getUser,
      setUser: setUser
    };
    return service;

    function getUser(){
      return StorageUtils.get(storageKey).then(function(user){
        if(user){
          return user;
        } else {
          return fetchUser().then(function(user){
            return setUser(user).then(function(){
              return user;
            });
          });
        }
      });
    }

    function setUser(user){
      return StorageUtils.set(storageKey, user);
    }

    function fetchUser(){
      return DevicePlugin.getDevice().then(function(device){
        return $http.get(Config.backendUrl+'/users/find?deviceId='+device.uuid).then(null, function(err){
          return $http.post(Config.backendUrl+'/users', device);
        });
      }).then(function(res){
        return res.data;
      });
    }
  }

  UserActionSync.$inject = ['$http', '$q', 'StorageUtils', 'Config', '_'];
  function UserActionSync($http, $q, StorageUtils, Config, _){
    var service = {
      syncUserAction: syncUserAction
    };
    return service;

    function syncUserAction(storageKey){
      StorageUtils.get(storageKey).then(function(userData){
        var toSync = _.find(userData.actions, {dirty: true});
        if(toSync){
          syncAction(toSync).then(function(res){
            StorageUtils.get(storageKey).then(function(userData){
              if(res){
                var synced = _.find(userData.actions, {dirty: true, created: toSync.created, userId: toSync.userId, itemType: toSync.itemType, itemId: toSync.itemId});
                if(synced){
                  angular.copy(res, synced);
                  return StorageUtils.set(storageKey, userData).then(function(){
                    syncUserAction(storageKey);
                  });
                } else {
                  syncUserAction(storageKey);
                }
              } else {
                _.remove(userData.actions, {dirty: true, created: toSync.created, userId: toSync.userId, itemType: toSync.itemType, itemId: toSync.itemId});
                return StorageUtils.set(storageKey, userData).then(function(){
                  syncUserAction(storageKey);
                });
              }
            });
          }, function(err){
            if(err.status === 0){} // no internet => nothing to do, will be relaunched later...
            else { // error in request => move action to error...
              StorageUtils.get(storageKey).then(function(userData){
                var synced = _.find(userData.actions, {dirty: true, created: toSync.created, userId: toSync.userId, itemType: toSync.itemType, itemId: toSync.itemId});
                if(synced){
                  delete synced.dirty;
                  synced.error = err;
                  return StorageUtils.set(storageKey, userData).then(function(){
                    syncUserAction(storageKey);
                  });
                } else {
                  syncUserAction(storageKey);
                }
              });
            }
          });
        } else {
          // check if data is correct
          var firstAction = userData.actions[0];
          if(firstAction){
            $http.get(Config.backendUrl+'/users/'+firstAction.userId+'/actions/'+firstAction.eventId).then(function(res){
              if(!angular.equals(res.data, userData)){
                console.error('ERROR in UserAction... :(');
              }
            });
          }
        }
      });
    }

    function syncAction(toSync){
      if(toSync && toSync.action){
        if(toSync.action.favorite === true){ return syncFavorite(toSync); }
        if(toSync.action.favorite === false){ return syncUnfavorite(toSync); }
        if(toSync.action.mood === true){ return syncMood(toSync); }
        if(toSync.action.comment === true && !toSync.uuid){ return syncCommentAdd(toSync); }
        if(toSync.action.comment === true && toSync.uuid){ return syncCommentEdit(toSync); }
        if(toSync.action.comment === false){ return syncCommentDelete(toSync); }
      }
      return $q.reject({status: 404, message: 'unknown action :('})
    }

    function syncFavorite(toSync){
      return $http.post(Config.backendUrl+'/events/'+toSync.eventId+'/'+toSync.itemType+'/'+toSync.itemId+'/favorites', {}, {headers: {userId: toSync.userId, timestamp: toSync.created}}).then(function(res){
        return res.data;
      });
    }

    function syncUnfavorite(toSync){
      return $http.delete(Config.backendUrl+'/events/'+toSync.eventId+'/'+toSync.itemType+'/'+toSync.itemId+'/favorites', {headers: {userId: toSync.userId}}).then(function(res){
        return res.data;
      });
    }

    function syncMood(toSync){
      return $http.post(Config.backendUrl+'/events/'+toSync.eventId+'/'+toSync.itemType+'/'+toSync.itemId+'/mood', {rating: toSync.action.rating}, {headers: {userId: toSync.userId, timestamp: toSync.created}}).then(function(res){
        return res.data;
      });
    }

    function syncCommentAdd(toSync){
      return $http.post(Config.backendUrl+'/events/'+toSync.eventId+'/'+toSync.itemType+'/'+toSync.itemId+'/comments', {text: toSync.action.text}, {headers: {userId: toSync.userId, timestamp: toSync.created}}).then(function(res){
        return res.data;
      });
    }

    function syncCommentEdit(toSync){
      return $http.put(Config.backendUrl+'/events/'+toSync.eventId+'/'+toSync.itemType+'/'+toSync.itemId+'/comments/'+toSync.uuid, {text: toSync.action.text}, {headers: {userId: toSync.userId, timestamp: toSync.updated}}).then(function(res){
        return res.data;
      });
    }

    function syncCommentDelete(toSync){
      return $http.delete(Config.backendUrl+'/events/'+toSync.eventId+'/'+toSync.itemType+'/'+toSync.itemId+'/comments/'+toSync.uuid, {headers: {userId: toSync.userId}}).then(function(res){
        return res.data;
      });
    }
  }
})();
