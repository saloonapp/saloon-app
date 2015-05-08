(function(){
  'use strict';
  angular.module('app')
    .factory('EventSrv', EventSrv);

  EventSrv.$inject = ['DataUtils'];
  function EventSrv(DataUtils){
    var storageKey = 'events';
    var service = {
      getAll: getAll,
      get: get
    };
    return service;

    function getAll(){
      return DataUtils.getOrFetch(storageKey, '/events/all');
    }

    function get(eventId){
      return DataUtils.getOrFetch(storageKey+'-'+eventId, '/events/'+eventId+'/full');
    }
  }
})();
