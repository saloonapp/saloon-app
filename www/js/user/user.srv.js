(function(){
  'use strict';
  angular.module('app')
    .factory('UserSrv', UserSrv);

  UserSrv.$inject = ['$http', 'LocalStorageUtils', 'DevicePlugin', 'Config'];
  function UserSrv($http, LocalStorageUtils, DevicePlugin, Config){
    var storageKey = 'user';
    var service = {
      getUser: getUser,
      setUser: setUser
    };
    return service;

    function getUser(){
      return LocalStorageUtils.get(storageKey).then(function(user){
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
      return LocalStorageUtils.set(storageKey, user);
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
})();
