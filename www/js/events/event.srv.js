(function(){
  'use strict';
  angular.module('app')
    .factory('EventSrv', EventSrv);

  EventSrv.$inject = ['DataUtils', '_'];
  function EventSrv(DataUtils, _){
    var storageKey = 'events';
    var service = {
      getAll: getAll,
      get: get,
      getExponent: getExponent,
      getSession: getSession,
      refreshEventList: refreshEventList,
      refreshEvent: refreshEvent
    };
    return service;

    function getAll(){
      return DataUtils.getOrFetch(storageKey, '/events/all');
    }

    function get(eventId){
      return DataUtils.getOrFetch(storageKey+'-'+eventId, '/events/'+eventId+'/full');
    }

    function getExponent(eventId, exponentId){
      return get(eventId).then(function(event){
        return _.find(event.exponents, {uuid: exponentId});
      });
    }

    function getSession(eventId, sessionId){
      return get(eventId).then(function(event){
        return _.find(event.sessions, {uuid: sessionId});
      });
    }

    function refreshEventList(){
      return DataUtils.refresh(storageKey, '/events/all');
    }

    function refreshEvent(eventId){
      return DataUtils.refresh(storageKey+'-'+eventId, '/events/'+eventId+'/full');
    }
  }
})();
