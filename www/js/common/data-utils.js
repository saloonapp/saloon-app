(function(){
  'use strict';
  angular.module('app')
    .factory('DataUtils', DataUtils);

  DataUtils.$inject = ['$http', 'StorageUtils', 'Config'];
  function DataUtils($http, StorageUtils, Config){
    var service = {
      getOrFetch: getOrFetch,   // (storageKey, url, _absolute, _formatData)     Get the data from storage and if does not exits, get it from serveur with url
      refresh: refresh          // (storageKey, url, _absolute, _formatData)     Get data serveur and update storage
    };

    function getOrFetch(storageKey, url, _absolute, _formatData){
      return StorageUtils.get(storageKey).then(function(data){
        if(data){
          return data;
        } else {
          return refresh(storageKey, url, _absolute, _formatData);
        }
      });
    }

    function refresh(storageKey, url, _absolute, _formatData){
      return $http.get(_absolute ? url : Config.backendUrl+url).then(function(res){
        var data = _formatData ? _formatData(res.data) : res.data;
        return StorageUtils.set(storageKey, data).then(function(){
          return data;
        });
      });
    }

    return service;
  }
})();
