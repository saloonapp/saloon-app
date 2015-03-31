angular.module('app')

.factory('EventSrv', function($q, StorageUtils, ParseUtils){
  'use strict';
  var storageKey = 'events';
  var eventCrud = ParseUtils.createCrud('Event');
  var speakerCrud = ParseUtils.createCrud('EventSpeaker');
  var activityCrud = ParseUtils.createCrud('EventActivity');
  var service = {
    getEvents: getEvents,
    getEventData: getEventData
  };

  function getEvents(_fromRemote){
    return StorageUtils.get(storageKey).then(function(data){
      if(data && !_fromRemote){
        return data;
      } else {
        return eventCrud.getAll().then(function(events){
          return StorageUtils.set(storageKey, events).then(function(){
            return events;
          });
        });
      }
    });
  }

  function getEventData(eventId, _fromRemote){
    var eventKey = storageKey+'-'+eventId;
    return StorageUtils.get(eventKey).then(function(data){
      if(data && !_fromRemote){
        return data;
      } else {
        return eventCrud.findOne({extId: eventId}).then(function(event){
          if(event){
            return $q.all([
              speakerCrud.find({event: ParseUtils.toPointer('Event', event)}, '&limit=1000'),
              activityCrud.find({event: ParseUtils.toPointer('Event', event)}, '&limit=1000')
            ]).then(function(results){
              var res = {
                event: event,
                speakers: results[0],
                activities: results[1]
              };
              return StorageUtils.set(eventKey, res).then(function(){
                return res;
              });
            });
          } else {
            return {event: {}, speakers: [], activities: []};
          }
        });
      }
    });
  }

  return service;
});
