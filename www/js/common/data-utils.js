(function(){
  'use strict';
  angular.module('app')
    .factory('DataUtils', DataUtils);

  DataUtils.$inject = ['$http', 'LocalStorageUtils', 'Config'];
  function DataUtils($http, LocalStorageUtils, Config){
    var service = {
      getOrFetch: getOrFetch,   // (storageKey, url, _absolute)     Get the data from storage and if does not exits, get it from serveur with url
      refresh: refresh          // (storageKey, url, _absolute)     Get data serveur and update storage
    };

    function getOrFetch(storageKey, url, _absolute){
      return LocalStorageUtils.get(storageKey).then(function(data){
        if(data){
          return data;
        } else {
          return refresh(storageKey, url, _absolute);
        }
      });
    }

    function refresh(storageKey, url, _absolute){
      return $http.get(_absolute ? url : Config.backendUrl+url).then(function(res){
        return LocalStorageUtils.set(storageKey, res.data).then(function(){
          return res.data;
        });
      });
    }

    return service;
  }
})();
