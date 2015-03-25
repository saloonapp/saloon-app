angular.module('app')

.factory('UserSrv', function($q, AuthSrv, ParseUtils, StorageUtils, LocalStorageUtils, GeolocationPlugin, PushPlugin, Config){
  'use strict';
  var storageKey = 'user';
  var userCrud = ParseUtils.createUserCrud(AuthSrv.getToken());
  /*BackgroundGeolocationPlugin.configure({}, function(position){
    console.log('get position', position);
    return $q.when();
  });*/
  var service = {
    fetchCurrent: fetchCurrent,
    getCurrent: getCurrent,
    setCurrent: setCurrent,
    updatePosition: updatePosition,
    updateStatus: updateStatus,
    register: register,
    login: login,
    loginOAuth: loginOAuth,
    passwordRecover: passwordRecover,
    logout: logout
  };

  function getCurrent(){
    return StorageUtils.get(storageKey);
  }

  function setCurrent(user){
    return userCrud.save(user).then(function(){
      return StorageUtils.set(storageKey, user);
    });
  }

  function fetchCurrent(){
    return getCurrent().then(function(user){
      return userCrud.get(user.objectId).then(function(backendUser){
        return StorageUtils.set(storageKey, backendUser);
      });
    });
  }

  function updatePosition(){
    return GeolocationPlugin.getCurrentPosition().then(function(pos){
      return _updatePosition(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
    });
  }

  function _updatePosition(latitude, longitude, accuracy){
    return getCurrent().then(function(user){
      if(user.active){
        var data = {
          location: ParseUtils.toGeoPoint(latitude, longitude),
          locationAccuracy: accuracy
        };
        return userCrud.savePartial(user, data).then(function(){
          return StorageUtils.set(storageKey, angular.extend(user, data));
        });
      }
    });
  }

  function updateStatus(active){
    return getCurrent().then(function(user){
      return GeolocationPlugin.getCurrentPosition().then(function(pos){
        var data = {
          active: active,
          location: ParseUtils.toGeoPoint(pos.coords.latitude, pos.coords.longitude),
          locationAccuracy: pos.coords.accuracy
        };
        return userCrud.savePartial(user, data).then(function(){
          /*if(active){
            BackgroundGeolocationPlugin.start();
          } else {
            BackgroundGeolocationPlugin.stop();
          }*/
          return StorageUtils.set(storageKey, angular.extend(user, data));
        });
      }, function(err){
        var data = {
          active: active
        };
        return userCrud.savePartial(user, data).then(function(){
          return StorageUtils.set(storageKey, angular.extend(user, data));
        });
      });
    });
  }

  function register(credentials, _provider){
    if(credentials.email && credentials.password){
      credentials.username = credentials.email;
      return ParseUtils.signup(credentials).then(function(user){
        if(_provider && credentials.authData){ AuthSrv.setAuthData(_provider, credentials[_provider].id, credentials.authData, user); }
        return _initAfterLogin(user);
      }, function(err){
        return err && err.data && err.data.error ? $q.reject({message: err.data.error}) : $q.reject(err);
      });
    } else {
      return $q.reject({message: 'Error: please fill email AND password !'});
    }
  }

  function login(credentials){
    if(credentials.email && credentials.password){
      return ParseUtils.login(credentials.email, credentials.password).then(function(user){
        return _initAfterLogin(user);
      }, function(err){
        return err && err.data && err.data.error ? $q.reject({message: err.data.error}) : $q.reject(err);
      });
    } else {
      return $q.reject({message: 'Error: please fill email AND password !'});
    }
  }

  function loginOAuth(provider, profile){
    return AuthSrv.getAuthData(provider, profile.id).then(function(authData){
      if(authData){
        return ParseUtils.loginOAuth(authData).then(function(user){
          return _initAfterLogin(user);
        }, function(err){
          return err && err.data && err.data.error ? $q.reject({message: err.data.error}) : $q.reject(err);
        });
      } else {
        return $q.reject({message: 'No authData found...'});
      }
    });
  }

  function _initAfterLogin(user){
    userCrud = ParseUtils.createUserCrud(user.sessionToken);
    AuthSrv.setToken(user.sessionToken);
    delete user.sessionToken;

    return $q.all([
      PushPlugin.register(Config.gcm.projectNumber),
      GeolocationPlugin.getCurrentPosition()
    ]).then(function(results){
      var registrationId = results[0];
      var pos = results[1];
      user.push = {
        id: registrationId,
        platform: ionic.Platform.platform()
      };
      user.location = ParseUtils.toGeoPoint(pos.coords.latitude, pos.coords.longitude);
      user.locationAccuracy = pos.coords.accuracy;
      user.active = true;

      return userCrud.save(user).then(function(){
        return StorageUtils.set(storageKey, user).then(function(){
          return user;
        });
      });
    });
  }

  function passwordRecover(credentials){
    if(credentials.email){
      return ParseUtils.passwordRecover(credentials.email).then(null, function(err){
        return err && err.data && err.data.error ? $q.reject({message: err.data.error}) : $q.reject(err);
      });
    } else {
      return $q.reject({message: 'Error: please fill email for account to recover !'});
    }
  }

  function logout(){
    AuthSrv.removeToken();
    LocalStorageUtils.clear();
    return StorageUtils.clear();
  }

  return service;
})

.factory('UsersSrv', function($q, $timeout, UserSrv, ParseUtils, Utils, GeolocationPlugin){
  'use strict';
  var matchDistance = 1; // 1 km
  var matchMaxAge = 60 * 60 * 1000; // 1h
  var tmpUsers = null;
  var service = {
    getNearUsers: getNearUsers,
    get: get,
    getAll: getAll
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

  function getAll(ids){
    return userCrud.find({
      objectId: {$in: ids}
    }).then(function(users){
      return users;
    });
  }

  return service;
})

.factory('RelationsSrv', function(UserSrv, UsersSrv, ParseUtils, NotificationSrv, GeolocationPlugin){
  'use strict';
  var relationCrud = ParseUtils.createCrud('Relation');
  var service = {
    status: {
      INVITED: 'invited',
      DECLINED: 'declined',
      ACCEPTED: 'accepted'
    },
    get: get,
    getContactsIds: getContactsIds,
    invite: invite,
    acceptInvite: acceptInvite,
    declineInvite: declineInvite
  };

  function get(user){
    return UserSrv.getCurrent().then(function(currentUser){
      return relationCrud.findOne({
        from: {$in: [ParseUtils.toPointer('_User', user), ParseUtils.toPointer('_User', currentUser)]},
        to: {$in: [ParseUtils.toPointer('_User', user), ParseUtils.toPointer('_User', currentUser)]}
      });
    });
  }

  function getContactsIds(){
    return UserSrv.getCurrent().then(function(currentUser){
      return relationCrud.find({
        status: service.status.ACCEPTED,
        $or: [
          {from: ParseUtils.toPointer('_User', currentUser)},
          {to: ParseUtils.toPointer('_User', currentUser)}
        ]
      }).then(function(relations){
        console.log('relations', relations);
        var ids = [];
        for(var i in relations){
          if(relations[i].from.objectId !== currentUser.objectId){
            ids.push(relations[i].from.objectId);
          }
          if(relations[i].to.objectId !== currentUser.objectId){
            ids.push(relations[i].to.objectId);
          }
        }
        return ids;
      });
    });
  }

  function invite(user){
    return UserSrv.getCurrent().then(function(currentUser){
      return GeolocationPlugin.getCurrentPosition().then(function(pos){
        var relation = {
          from: ParseUtils.toPointer('_User', currentUser),
          to: ParseUtils.toPointer('_User', user),
          location: ParseUtils.toGeoPoint(pos.coords.latitude, pos.coords.longitude),
          locationAccuracy: pos.coords.accuracy,
          status: service.status.INVITED
        };
        return relationCrud.save(relation).then(function(relationCreated){
          return NotificationSrv.sendInvite(currentUser, user).then(function(){
            return relationCreated;
          });
        });
      });
    });
  }

  function acceptInvite(relation){
    return UserSrv.getCurrent().then(function(currentUser){
      var rel = angular.copy(relation); // do not update scope relation
      rel.status = service.status.ACCEPTED;
      return relationCrud.save(rel).then(function(){
        return UsersSrv.get(relation.from.objectId);
      }).then(function(user){
        return NotificationSrv.acceptInvite(currentUser, user);
      });
    });
  }

  function declineInvite(relation){
    return UserSrv.getCurrent().then(function(currentUser){
      var rel = angular.copy(relation); // do not update scope relation
      rel.status = service.status.DECLINED;
      return relationCrud.save(rel).then(function(){
        return UsersSrv.get(relation.from.objectId);
      }).then(function(user){
        return NotificationSrv.declineInvite(currentUser, user);
      });
    });
  }

  return service;
})

.factory('PrivateMessageSrv', function($q, UserSrv, UsersSrv, ParseUtils, NotificationSrv){
  'use strict';
  var messageCrud = ParseUtils.createCrud('PrivateMessage');
  var service = {
    getAll: getAll,
    sendTo: sendTo
  };

  function getAll(user){
    return UserSrv.getCurrent().then(function(currentUser){
      return messageCrud.find({
        from: {$in: [ParseUtils.toPointer('_User', user), ParseUtils.toPointer('_User', currentUser)]},
        to: {$in: [ParseUtils.toPointer('_User', user), ParseUtils.toPointer('_User', currentUser)]}
      }, '&include=from');
    });
  }

  function sendTo(user, message){
    return UserSrv.getCurrent().then(function(currentUser){
      var chatMessage = {
        from: ParseUtils.toPointer('_User', currentUser),
        to: ParseUtils.toPointer('_User', user),
        content: {
          text: message
        }
      };
      return messageCrud.save(chatMessage).then(function(sentMessage){
        return NotificationSrv.sendPrivateMessage(currentUser, user, message).then(function(){
          sentMessage.from = currentUser;
          return sentMessage;
        });
      });
    });
  }

  return service;
});
