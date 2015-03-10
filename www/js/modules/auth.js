angular.module('app')

.factory('UserSrv', function($q, AuthSrv, ParseUtils, StorageUtils, LocalStorageUtils, GeolocationPlugin, PushPlugin, Config){
  'use strict';
  var storageKey = 'user';
  var userCrud = ParseUtils.createUserCrud(AuthSrv.getToken());
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
    return getCurrent().then(function(user){
      if(user.active){
        return GeolocationPlugin.getCurrentPosition().then(function(pos){
          var data = {
            location: ParseUtils.toGeoPoint(pos.coords.latitude, pos.coords.longitude),
            locationAccuracy: pos.coords.accuracy
          };
          return userCrud.savePartial(user, data).then(function(){
            return StorageUtils.set(storageKey, angular.extend(user, data));
          });
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

.provider('AuthSrv', function(LocalStorageUtilsProvider){
  'use strict';
  var storageKey = 'user-token';

  function getToken()       { return LocalStorageUtilsProvider.getSync(storageKey); }
  function isLogged()       { return !!getToken();                                  }

  this.isLogged = isLogged;

  this.$get = ['ParseUtils', 'LocalStorageUtils', 'Utils', function(ParseUtils, LocalStorageUtils, Utils){
    var authCrud = ParseUtils.createCrud('Auth');
    var service = {
      isLogged: isLogged,
      setToken: setToken,
      removeToken: removeToken,
      getToken: getToken,
      getAuthData: getAuthData,
      setAuthData: setAuthData
    };

    function setToken(token){
      return LocalStorageUtils.set(storageKey, token);
    }

    function removeToken(){
      return LocalStorageUtils.remove(storageKey);
    }

    function getAuthData(provider, id){
      return authCrud.findOne({provider: provider, id: id}).then(function(res){
        console.log('authData', res);
        if(res && res.data){
          return res.data;
        }
      });
    }

    function setAuthData(provider, id, authData, user){
      return authCrud.save({
        provider: provider,
        id: id,
        user: ParseUtils.toPointer('_User', user),
        data: authData
      });
    }

    return service;
  }];
})

.factory('LinkedinSrv', function($http, $q, $cordovaOauth, LocalStorageUtils, Config){
  'use strict';
  // http://ngcordova.com/docs/plugins/oauth/
  // https://developer.linkedin.com/docs/oauth2
  // https://developer.linkedin.com/docs/fields
  var provider = 'linkedin';
  var storageKey = provider+'-token';
  var baseUrl = 'https://api.linkedin.com/v1';
  var defaultScope = ['r_basicprofile', 'r_emailaddress'];
  var defaultFields = ['id', 'first-name', 'last-name', 'email-address', 'picture-url', 'headline', 'location', 'num-connections', 'summary', 'specialties', 'positions', 'api-standard-profile-request', 'public-profile-url'];
  var service = {
    provider: provider,
    token: LocalStorageUtils.getSync(storageKey),
    login: login,
    getProfile: getProfile
  };

  function login(_scope){
    if(service.token){
      return getProfile();
    } else {
      return $cordovaOauth.linkedin(Config.linkedin.clientId, Config.linkedin.clientSecret, _scope ? _scope : defaultScope, Config.linkedin.state).then(function(res){
        service.token = {
          value: res.access_token,
          expire: Date.now()+(res.expires_in*1000)
        };
        LocalStorageUtils.set(storageKey, service.token);
        return getProfile();
      });
    }
  }

  function getProfile(_fields){
    return _get('/people/~:('+(_fields ? _fields : defaultFields).join(',')+')');
  }

  function _get(url){
    if(service.token && service.token.value && Date.now() < service.token.expire){
      return $http.get(baseUrl+url+'?format=json', {
        headers: {
          Authorization: 'Bearer '+service.token.value
        }
      }).then(function(res2){
        if(res2 && res2.data){
          res2.data._updated = Date.now();
          return res2.data;
        }
      });
    } else {
      return $q.reject({message: 'Could not find linkedin token...'});
    }
  }

  return service;
})

.factory('AuthInterceptor', function($q, $location, $log){
  'use strict';
  var service = {
    request: onRequest,
    response: onResponse,
    responseError: onResponseError
  };

  function onRequest(config){
    // add headers here if you want...
    return config;
  }

  function onResponse(response){
    return response;
  }

  function onResponseError(response){
    $log.warn('request error', response);
    if(response.status === 401 || response.status === 403) {
      // user is not authenticated
      $location.path('/login');
    }
    return $q.reject(response);
  }

  return service;
});
