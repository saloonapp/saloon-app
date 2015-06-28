(function(){
  'use strict';
  angular.module('app')
    .factory('LoadingSrv', LoadingSrv);

  LoadingSrv.$inject = ['$q'];
  function LoadingSrv($q){
    var loadedDefer = $q.defer();
    var service = {
      loaded: loaded,
      onLoaded: onLoaded
    };
    return service;

    function loaded(){
      loadedDefer.resolve();
      return onLoaded();
    }

    function onLoaded(){
      return loadedDefer.promise;
    }
  }
})();