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

  UserActionSync.$inject = ['$http', 'EventUtils', 'DataUtils', 'StorageUtils', 'Config'];
  function UserActionSync($http, EventUtils, DataUtils, StorageUtils, Config){
    var storageKey = 'sync-actions';
    var dataLoaded = false;
    var syncRunning = false;
    var actionQueue = [];
    initialize();

    var service = {
      put: put,
      sync: sync
    };
    return service;

    function initialize(){
      StorageUtils.get(storageKey, []).then(function(actions){
        if(actionQueue.length > 0){
          actionQueue = actions.concat(actionQueue);
          StorageUtils.set(storageKey, actionQueue);
        } else {
          actionQueue = actions;
        }
        console.log('actionQueue', actionQueue);
        dataLoaded = true;
      });
    }

    function put(config){
      actionQueue.push(config);
      if(dataLoaded){
        StorageUtils.set(storageKey, actionQueue);
      }
      sync();
    }

    function sync(){
      if(!syncRunning && dataLoaded && actionQueue.length > 0){
        syncRunning = true;
        execSync(actionQueue[0]).then(function(){
          var action = actionQueue.shift();
          StorageUtils.set(storageKey, actionQueue);
          if(actionQueue.length > 0){
            sync();
          } else {
            syncRunning = false;
          }
        }, function(err){
          syncRunning = false; // if error => will try later... TODO : NOT GOOD AT ALL, will be blocked !!!!
          if(err.status === 0){ } // no internet => will try later...
          //else if(err.status === 404){} // error in request => ???
          //else if(err.status === 500){} // bug in server => ???
          else { console.log('err', err); }
        })
      }
    }

    function execSync(config){
      if(config.action === 'favorite'){ return execFavorite(config); }
      else { return $q.when(); }
    }

    function execFavorite(config){
      console.log('execFav', config);
      return $http.post(Config.backendUrl+'/events/'+config.elt.eventId+'/'+config.elt.className+'/'+config.elt.uuid+'/favorites', {}, {headers: {userId: config.userId}}).then(function(res){
        return getUserData(config.elt.eventId).then(function(userData){
          EventUtils.setFavorite(userData, res.data);
          return StorageUtils.set(config.storageKey, userData).then(function(){
            return res.data;
          });
        });
      });
    }

    function getUserData(userId, eventId, key){
      return DataUtils.getOrFetch(key, '/users/'+userId+'/actions/'+eventId);
    }
  }
})();
