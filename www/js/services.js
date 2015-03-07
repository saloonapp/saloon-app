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

.factory('UsersSrv', function($q, $timeout, UserSrv, ParseUtils, Utils, GeolocationPlugin){
  'use strict';
  var matchDistance = 0.1; // 100m
  var matchMaxAge = 60 * 60 * 1000; // 1h
  var tmpUsers = null;
  var service = {
    getNearUsers: getNearUsers,
    get: get
  };
  var userCrud = ParseUtils.createUserCrud(null, function(){}, false);

  function getNearUsers(){
    return UserSrv.getCurrent().then(function(user){
      return GeolocationPlugin.getCurrentPosition().then(function(pos){
        return userCrud.find({
          objectId: {$ne: user.objectId},
          active: true,
          updatedAt: {$gt: ParseUtils.toDate(Date.now() - matchMaxAge)},
          location: {
            $nearSphere: ParseUtils.toGeoPoint(pos.coords.latitude, pos.coords.longitude),
            $maxDistanceInKilometers: matchDistance
          }
        }).then(function(users){
          tmpUsers = users;
          return users;
        });
      });
    });
  }

  function get(id){
    if(Array.isArray(tmpUsers)){
      for(var i in tmpUsers){
        if(tmpUsers[i].objectId === id){
          return $q.when(angular.copy(tmpUsers[i]));
        }
      }
    }
    return userCrud.get(id);
  }

  return service;
});
