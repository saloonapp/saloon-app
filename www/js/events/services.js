angular.module('app')

.factory('EventSrv', function($q, $ionicModal, StorageUtils, ParseUtils, Utils){
  'use strict';
  var storageKey = 'events';
  var eventCrud = ParseUtils.createCrud('Event');
  var speakerCrud = ParseUtils.createCrud('EventSpeaker');
  var activityCrud = ParseUtils.createCrud('EventActivity');
  var service = {
    getEvents: getEvents,
    getEventData: getEventData,
    getEventActivity: getEventActivity,
    groupBySlot: groupBySlot,
    getActivityValues: getActivityValues,
    getActivityFilterModal: getActivityFilterModal
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
        return eventCrud.findOne({objectId: eventId}).then(function(event){
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

  function getEventActivity(eventId, activityId){
    return getEventData(eventId).then(function(eventData){
      return _.find(eventData.activities, {objectId: activityId});
    });
  }

  function groupBySlot(activities){
    var activitiesBySlot = [];
    _.map(activities, function(activity){
      var slot = activity.from && activity.to ? moment(activity.from).format('ddd H\\hmm')+'-'+moment(activity.to).format('H\\hmm') : 'Non planifié';
      var group = _.find(activitiesBySlot, {name: slot});
      if(!group){
        group = {
          name: slot,
          from: activity.from,
          to: activity.to,
          activities: []
        };
        activitiesBySlot.push(group);
      }
      group.activities.push(activity);
    });
    return _.sortBy(activitiesBySlot, function(a){
      return new Date(a.from).getTime();
    });
  }

  function getActivityValues(activities){
    var values = _valueLists(['format', 'from', 'category', 'room'], activities);
    values.from = _.map(_.sortBy(values.from, function(f){
      return new Date(f).getTime();
    }), function(f){
      return {
        data: f,
        group: f ? moment(f).format('dddd') : 'Non planifié',
        label: f ? moment(f).format('ddd H\\hmm') : 'Non planifié'
      };
    });
    return values;
  }

  function _valueLists(fields, activities){
    var values = {};
    _.map(fields, function(field){
      values[field] = [];
    });
    _.map(activities, function(activity){
      _.map(fields, function(field){
        var value = Utils.getDeep(activity, field);
        if(typeof value === 'string' && values[field].indexOf(value) === -1){
          values[field].push(value);
        }
        if(typeof value === 'object' && !_.find(values[field], value)){
          values[field].push(value);
        }
      });
    });
    return values;
  }

  function getActivityFilterModal($scope){
    return $ionicModal.fromTemplateUrl('views/events/filter-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    });
  }

  return service;
});
