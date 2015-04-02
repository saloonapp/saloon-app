// Theses services are here for convenience but they MUST not be used in the application
// In near future, they will be moved to an admin backend !

angular.module('app')

.factory('ParseEventLoader', function($q, DevoxxApi, ParseUtils, Utils){
  'use strict';
  var eventCrud = ParseUtils.createCrud('Event');
  var speakerCrud = ParseUtils.createCrud('EventSpeaker');
  var activityCrud = ParseUtils.createCrud('EventActivity');
  var service = {
    loadDevoxxEvent: loadDevoxxEvent
  };
  
  function loadDevoxxEvent(eventId){
    console.log('loadDevoxxEvent('+eventId+')');
    return $q.all([
      DevoxxApi.getEvent(eventId),
      DevoxxApi.getSpeakers(eventId),
      DevoxxApi.getActivities(eventId)
    ]).then(function(results){
      // get all data and store it in object
      return {
        event: results[0],
        speakers: results[1],
        activities: results[2]
      };
    }).then(function(eventData){
      // check for missing elements and add it to data
      var missingActivityIds = _.filter(_.flatten(_.map(eventData.speakers, function(speaker){
        return _.map(speaker.activities, function(activity){
          if(!_.find(eventData.activities, {extId: activity.extId})){
            return activity.extId;
          }
        });
      })));
      var missingSpeakerIds = _.filter(_.flatten(_.map(eventData.activities, function(activity){
        return _.map(activity.speakers, function(speaker){
          if(!_.find(eventData.speakers, {extId: speaker.extId})){
            return speaker.extId;
          }
        });
      })));
      return $q.all([
        DevoxxApi.getSpeakersByIds(eventId, missingSpeakerIds),
        DevoxxApi.getActivitiesByIds(eventId, missingActivityIds)
      ]).then(function(results){
        eventData.speakers = eventData.speakers.concat(results[0]);
        eventData.activities = eventData.activities.concat(results[1]);
        return eventData;
      });
    }).then(function(fullEventData){
      // format & enrich data
      _.map(fullEventData.speakers, function(speaker){
        _.map(speaker.activities, function(activity){
          var fullActivity = _.find(fullEventData.activities, {extId: activity.extId});
          if(fullActivity){
            activity.abstract = fullActivity.abstract;
            activity.room = angular.copy(fullActivity.room);
            activity.lang = fullActivity.lang;
          } else {
            console.warn('activity '+activity.extId+' not found in speaker '+speaker.extId+' :(');
          }
        });
      });
      _.map(fullEventData.activities, function(activity){
        _.map(activity.speakers, function(speaker){
          var fullSpeaker = _.find(fullEventData.speakers, {extId: speaker.extId});
          if(fullSpeaker){
            speaker.name = fullSpeaker.name;
            speaker.avatar = fullSpeaker.avatar;
            speaker.bio = fullSpeaker.bio;
          } else {
            console.warn('speaker '+speaker.extId+' not found in activity '+activity.extId+' in slot '+activity.slotId+' :(');
          }
        });
      });
      var firstActivity = _.min(fullEventData.activities, function(activity){
        return new Date(activity.from).getTime();
      });
      var lastActivity = _.max(fullEventData.activities, function(activity){
        return new Date(activity.from).getTime();
      });
      fullEventData.event.from = firstActivity.from;
      fullEventData.event.to = lastActivity.to;
      return fullEventData;
    }).then(function(formatedEventData){
      // get parse event data
      return _getEventData(eventId).then(function(parseData){
        return {
          devoxxApi: formatedEventData,
          parse: parseData
        };
      });
    }).then(function(oldAndNewData){
      // make diff data to save
      var diff = {
        devoxxApi: oldAndNewData.devoxxApi,
        parse: oldAndNewData.parse,
        toSave: {
          speakers: [],
          activities: [],
        },
        toDelete: {
          speakers: [],
          activities: []
        }
      };
      if(_shouldUpdate(oldAndNewData.parse.event, oldAndNewData.devoxxApi.event)){
        diff.toSave.event = _merge(oldAndNewData.parse.event, oldAndNewData.devoxxApi.event);
      }
      _.map(oldAndNewData.devoxxApi.speakers, function(speaker){
        var parseSpeaker = _.find(oldAndNewData.parse.speakers, {extId: speaker.extId});
        if(!parseSpeaker){
          diff.toSave.speakers.push(speaker);
        } else if(_shouldUpdate(parseSpeaker, speaker)){
          diff.toSave.speakers.push(_merge(parseSpeaker, speaker));
        }
      });
      _.map(oldAndNewData.parse.speakers, function(speaker){
        if(!_.find(oldAndNewData.devoxxApi.speakers, {extId: speaker.extId})){
          diff.toDelete.speakers.push(speaker);
        }
      });
      _.map(oldAndNewData.devoxxApi.activities, function(activity){
        var parseActivity = _.find(oldAndNewData.parse.activities, {extId: activity.extId});
        if(!parseActivity){
          diff.toSave.activities.push(activity);
        } else if(_shouldUpdate(parseActivity, activity)){
          var merge = _merge(parseActivity, activity);
          diff.toSave.activities.push(merge);
        }
      });
      _.map(oldAndNewData.parse.activities, function(activity){
        if(!_.find(oldAndNewData.devoxxApi.activities, {extId: activity.extId})){
          diff.toDelete.activities.push(activity);
        }
      });
      return diff;
    }).then(function(diff){
      // save data to parse
      console.log('diff', diff);
      
      var eventPromise = null;
      if(diff.toSave.event){
        eventPromise = eventCrud.save(diff.toSave.event);
      } else {
        eventPromise = $q.when(diff.parse.event);
      }
      
      return eventPromise.then(function(parseEvent){
        var promises = [];
        promises = promises.concat(_.map(diff.toSave.speakers, function(speaker){
          speaker.event = ParseUtils.toPointer('Event', parseEvent);
          console.log('SAVE speaker', speaker);
          speakerCrud.save(speaker);
        }));
        promises = promises.concat(_.map(diff.toSave.activities, function(activity){
          activity.event = ParseUtils.toPointer('Event', parseEvent);
          console.log('SAVE activity', activity);
          activityCrud.save(activity);
        }));
        promises = promises.concat(_.map(diff.toDelete.speakers, function(speaker){
          console.log('DELETE speaker', speaker);
          speakerCrud.remove(speaker);
        }));
        promises = promises.concat(_.map(diff.toDelete.activities, function(activity){
          console.log('DELETE activity', activity);
          activityCrud.remove(activity);
        }));
        
        return $q.all(promises).then(function(results){
          // return nothing !
        });
      });
    });
  }

  function _getEventData(eventId){
    return eventCrud.findOne({extId: eventId}).then(function(event){
      return $q.all([
        event ? speakerCrud.find({event: ParseUtils.toPointer('Event', event)}, '&limit=1000') : $q.when([]),
        event ? activityCrud.find({event: ParseUtils.toPointer('Event', event)}, '&limit=1000') : $q.when([])
      ]).then(function(results){
        return {
          event: event,
          speakers: results[0],
          activities: results[1]
        };
      });
    });
  }
  
  function _shouldUpdate(parseData, devoxxData){
    var updated = _merge(parseData, devoxxData);
    var res = JSON.stringify(updated) !== JSON.stringify(parseData);
    return res;
  }
  
  function _merge(src1, src2){
    // return angular.merge({}, src1, src2);
    return Utils.extendDeep({}, src1, src2);
  }
  
  return service;
})

.factory('DevoxxApi', function($http, $q){
  'use strict';
  var baseUrl = 'http://cfp.devoxx.fr/api/';
  var service = {
    getEvents: function(){ return _get('data/devoxx/events.json'); },
    getEvent: function(eventId){ return _get('data/devoxx/events.json').then(function(events){ return _.find(events, {extId: eventId}); }); },
    getSpeakers: function(eventId){ return _get('data/devoxx/speakers.json'); },
    getActivities: function(eventId){ return _get('data/devoxx/activities.json'); },
    getSpeakersByIds: function(){ return _get('data/devoxx/missing-speakers.json'); },
    getActivitiesByIds: function(){ return _get('data/devoxx/missing-activities.json'); }
  };
  
  function getEvents(){
    return _get(baseUrl+'conferences').then(function(conference){
      if(conference && Array.isArray(conference.links)){
        var links = _.filter(conference.links, function(link){
          return link && link.href;
        });
        var promises = _.map(links, function(link){
          return _getEvent(link.href);
        });
        return $q.all(promises);
      } else {
        return [];
      }
    });
  }

  function getEvent(eventId){
    return _getEvent(baseUrl+'conferences/'+eventId);
  }

  function getSpeakers(eventId){
    return _get(baseUrl+'conferences/'+eventId+'/speakers').then(function(speakers){
      if(Array.isArray(speakers)){
        var filteredSpeakers = _.filter(speakers, function(speaker){
          return speaker && Array.isArray(speaker.links) && speaker.links.length > 0;
        });
        var promises = _.map(filteredSpeakers, function(speaker){
          return _getSpeaker(speaker.links[0].href);
        });
        return $q.all(promises);
      } else {
        return [];
      }
    });
  }
  
  function getActivities(eventId){
    return _get(baseUrl+'conferences/'+eventId+'/schedules').then(function(schedules){
      if(schedules && Array.isArray(schedules.links)){
        var links = _.filter(schedules.links, function(schedule){
          return schedule && schedule.href;
        });
        var promises = _.map(links, function(schedule){
          return _getSchedule(schedule.href);
        });
        return $q.all(promises).then(function(results){
          return _.flatten(results);
        });
      } else {
        return [];
      }
    });
  }
  
  function getSpeakersByIds(eventId, ids){
    return $q.all(_.map(ids, function(id){
      return _getSpeaker(baseUrl+'conferences/'+eventId+'/speakers/'+id);
    }));
  }
  
  function getActivitiesByIds(eventId, ids){
    return $q.all(_.map(ids, function(id){
      return _getTalk(baseUrl+'conferences/'+eventId+'/talks/'+id);
    }));
  }
  
  function _getEvent(url){
    return _get(url).then(function(event){
      return {
        extId: event.eventCode,
        name: _cleanStr(event.label),
        address: _cleanStr(event.localisation),
        soureUrl: url
      };
    });
  }
  
  function _getSpeaker(url){
    return _get(url).then(function(speaker){
      return {
        extId: speaker.uuid,
        name: _cleanStr(speaker.firstName+' '+speaker.lastName),
        avatar: speaker.avatarURL,
        bio: _cleanStr(speaker.bio),
        company: _cleanStr(speaker.company),
        site: speaker.blog,
        twitter: _cleanStr(speaker.twitter),
        activities: _.map(speaker.acceptedTalks, function(talk){
          return {
            extId: talk.id,
            format: _cleanStr(talk.talkType),
            category: _cleanStr(talk.track),
            title: _cleanStr(talk.title)
          };
        }),
        soureUrl: url
      };
    });
  }
  
  function _getSchedule(url){
    return _get(url).then(function(schedule){
      if(schedule && Array.isArray(schedule.slots)){
        return _.filter(_.map(schedule.slots, function(slot){
          if(slot && !slot.notAllocated){
            var activity = {
              slotId: slot.slotId,
              room: {
                extId: slot.roomId,
                name: _cleanStr(slot.roomName),
                capacity: slot.roomCapacity,
              },
              from: new Date(slot.fromTimeMillis).toISOString(),
              to: new Date(slot.toTimeMillis).toISOString()
            };
            if(slot.talk){
              activity.extId = slot.talk.id;
              activity.format = _cleanStr(slot.talk.talkType);
              activity.category = _cleanStr(slot.talk.track);
              activity.title = _cleanStr(slot.talk.title);
              activity.abstract = _cleanStr(slot.talk.summary);
              activity.lang = _cleanStr(slot.talk.lang);
              activity.speakers = _.map(slot.talk.speakers, function(speaker){
                var urlArray = speaker.link.href.split('/');
                return {
                  extId: urlArray[urlArray.length-1],
                  name: _cleanStr(speaker.name)
                };
              });
            } else if(slot.break){
              activity.extId = slot.slotId;
              activity.format = 'break';
              activity.category = 'break';
              activity.title = _cleanStr(slot.break.nameFR ? slot.break.nameFR : slot.break.nameEN);
            }
            
            if(activity.extId){
              return activity;
            }
          }
        }));
      } else {
        return [];
      }
    });
  }
  
  // used for speaker talk not referenced in schedule
  // I noticed it's generally a 'Autres formats de conférence' talkType & it has no schedule or room...
  function _getTalk(url){
    return _get(url).then(function(talk){
      var activity = {};
      activity.extId = talk.id;
      activity.format = _cleanStr(talk.talkType);
      activity.category = _cleanStr(talk.track);
      activity.title = _cleanStr(talk.title);
      activity.abstract = _cleanStr(talk.summary);
      activity.lang = _cleanStr(talk.lang);
      activity.speakers = _.map(talk.speakers, function(speaker){
        var urlArray = speaker.link.href.split('/');
        return {
          extId: urlArray[urlArray.length-1],
          name: _cleanStr(speaker.name)
        };
      });
      return activity;
    });
  }
  
  function _get(url){
    return $http.get(url).then(function(res){
      return res ? res.data : null;
    });
  }
  
  function _cleanStr(str){
    return str ? str.trim() : '';
  }
  
  return service;
});
