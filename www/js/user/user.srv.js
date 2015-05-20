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

  UserActionSync.$inject = ['$http', 'StorageUtils', 'Config'];
  function UserActionSync($http, StorageUtils, Config){
    var storageKey = 'sync-actions';
    var dataLoaded = false;
    var actionQueue = [];
    initialize();

    var service = {
      put: put
    };
    return service;

    function initialize(){
      StorageUtils.get(storageKey).then(function(actions){
        if(actionQueue.length > 0){
          actionQueue = actions.concat(actionQueue);
          StorageUtils.set(storageKey, actionQueue);
        } else {
          actionQueue = actions;
        }
        dataLoaded = true;
      });
    }

    function put(config){
      actionQueue.push(config);
      if(dataLoaded){
        StorageUtils.set(storageKey, actionQueue);
      }
    }
  }
})();
