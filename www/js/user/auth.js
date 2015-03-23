angular.module('app')

.factory('AuthSrv', function(ParseUtils, LocalStorageUtils, Utils){
  'use strict';
  var storageKey = 'user-token';
  var authCrud = ParseUtils.createCrud('Auth');
  var service = {
    isLogged: isLogged,
    setToken: setToken,
    removeToken: removeToken,
    getToken: getToken,
    getAuthData: getAuthData,
    setAuthData: setAuthData
  };

  function getToken()       { return LocalStorageUtils.getSync(storageKey);     }
  function setToken(token)  { return LocalStorageUtils.set(storageKey, token);  }
  function removeToken()    { return LocalStorageUtils.remove(storageKey);      }
  function isLogged()       { return !!getToken();                              }

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
