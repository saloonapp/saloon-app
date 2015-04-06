// Theses services are here for convenience but they MUST not be used in the application
// In near future, they will be moved to an admin backend !

angular.module('app')

.factory('ParseEventLoader', function($q, DevoxxApi, ParseUtils, Utils){
  'use strict';
  var eventCrud = ParseUtils.createCrud('Event');
  var participantCrud = ParseUtils.createCrud('EventParticipant');
  var sessionCrud = ParseUtils.createCrud('EventSession');
  var service = {
    loadDevoxxEvent: loadDevoxxEvent
  };
  
  function loadDevoxxEvent(eventId){
    console.log('loadDevoxxEvent('+eventId+')');
    return $q.all([
      DevoxxApi.getEvent(eventId),
      DevoxxApi.getSessions(eventId),
      DevoxxApi.getParticipants(eventId)
    ]).then(function(results){
      // get all data and store it in object
      return {
        event: results[0],
        sessions: results[1],
        participants: results[2]
      };
    }).then(function(eventData){
      // check for missing elements and add it to data
      var missingSessionIds = _.filter(_.flatten(_.map(eventData.participants, function(participant){
        return _.map(participant.sessions, function(session){
          if(!_.find(eventData.sessions, {extId: session.extId})){
            return session.extId;
          }
        });
      })));
      var missingParticipantIds = _.filter(_.flatten(_.map(eventData.sessions, function(session){
        return _.map(session.participants, function(participant){
          if(!_.find(eventData.participants, {extId: participant.extId})){
            return participant.extId;
          }
        });
      })));
      return $q.all([
        DevoxxApi.getSessionsByIds(eventId, missingSessionIds),
        DevoxxApi.getParticipantsByIds(eventId, missingParticipantIds)
      ]).then(function(results){
        eventData.sessions = eventData.sessions.concat(results[0]);
        eventData.participants = eventData.participants.concat(results[1]);
        return eventData;
      });
    }).then(function(fullEventData){
      // format & enrich data
      _.map(fullEventData.participants, function(participant){
        _.map(participant.sessions, function(session){
          var fullSession = _.find(fullEventData.sessions, {extId: session.extId});
          if(fullSession){
            session.role = fullSession.role ? fullSession.role : participant.role;
            session.abstract = fullSession.abstract;
            session.room = angular.copy(fullSession.room);
            session.lang = fullSession.lang;
          } else {
            console.warn('session '+session.extId+' not found in participant '+participant.extId+' :(');
          }
        });
      });
      _.map(fullEventData.sessions, function(session){
        _.map(session.participants, function(participant){
          var fullParticipant = _.find(fullEventData.participants, {extId: participant.extId});
          if(fullParticipant){
            participant.name = fullParticipant.name;
            participant.avatar = fullParticipant.avatar;
            participant.bio = fullParticipant.bio;
            if(!participant.role){ participant.role = fullParticipant.role; }
          } else {
            console.warn('participant '+participant.extId+' not found in session '+session.extId+' in slot '+session.slotId+' :(');
          }
        });
      });
      var firstSession = _.min(fullEventData.sessions, function(session){
        return new Date(session.from).getTime();
      });
      var lastSession = _.max(fullEventData.sessions, function(session){
        return new Date(session.from).getTime();
      });
      fullEventData.event.from = firstSession.from;
      fullEventData.event.to = lastSession.to;
      return fullEventData;
    }).then(function(formatedEventData){
      // get parse event data
      return _getEventData(eventId).then(function(parseData){
        return {
          devoxx: formatedEventData,
          parse: parseData
        };
      });
    }).then(function(oldAndNewData){
      // make diff data to save
      var diff = {
        devoxx: oldAndNewData.devoxx,
        parse: oldAndNewData.parse,
        toSave: {
          participants: [],
          sessions: [],
        },
        toDelete: {
          participants: [],
          sessions: []
        }
      };
      if(_shouldUpdate(oldAndNewData.parse.event, oldAndNewData.devoxx.event)){
        diff.toSave.event = _merge(oldAndNewData.parse.event, oldAndNewData.devoxx.event);
      }
      _.map(oldAndNewData.devoxx.participants, function(participant){
        var parseParticipant = _.find(oldAndNewData.parse.participants, {extId: participant.extId});
        if(!parseParticipant){
          diff.toSave.participants.push(participant);
        } else if(_shouldUpdate(parseParticipant, participant)){
          diff.toSave.participants.push(_merge(parseParticipant, participant));
        }
      });
      _.map(oldAndNewData.parse.participants, function(participant){
        if(!_.find(oldAndNewData.devoxx.participants, {extId: participant.extId})){
          diff.toDelete.participants.push(participant);
        }
      });
      _.map(oldAndNewData.devoxx.sessions, function(session){
        var parseSession = _.find(oldAndNewData.parse.sessions, {extId: session.extId});
        if(!parseSession){
          diff.toSave.sessions.push(session);
        } else if(_shouldUpdate(parseSession, session)){
          var merge = _merge(parseSession, session);
          diff.toSave.sessions.push(merge);
        }
      });
      _.map(oldAndNewData.parse.sessions, function(session){
        if(!_.find(oldAndNewData.devoxx.sessions, {extId: session.extId})){
          diff.toDelete.sessions.push(session);
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
        promises = promises.concat(_.map(diff.toSave.participants, function(participant){
          participant.event = ParseUtils.toPointer('Event', parseEvent);
          console.log('SAVE participant', participant);
          participantCrud.save(participant);
        }));
        promises = promises.concat(_.map(diff.toSave.sessions, function(session){
          session.event = ParseUtils.toPointer('Event', parseEvent);
          console.log('SAVE session', session);
          sessionCrud.save(session);
        }));
        promises = promises.concat(_.map(diff.toDelete.participants, function(participant){
          console.log('DELETE participant', participant);
          participantCrud.remove(participant);
        }));
        promises = promises.concat(_.map(diff.toDelete.sessions, function(session){
          console.log('DELETE session', session);
          sessionCrud.remove(session);
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
        event ? participantCrud.find({event: ParseUtils.toPointer('Event', event)}, '&limit=1000') : $q.when([]),
        event ? sessionCrud.find({event: ParseUtils.toPointer('Event', event)}, '&limit=1000') : $q.when([])
      ]).then(function(results){
        return {
          event: event,
          participants: results[0],
          sessions: results[1]
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
    getEvents: getEvents,//function(){ return _get('data/devoxx/events.json'); },
    getEvent: getEvent,//function(eventId){ return _get('data/devoxx/events.json').then(function(events){ return _.find(events, {extId: eventId}); }); },
    getSessions: getSessions,//function(eventId){ return _get('data/devoxx/sessions.json'); },
    getParticipants: getParticipants,//function(eventId){ return _get('data/devoxx/participants.json'); },
    getSessionsByIds: getSessionsByIds,//function(){ return _get('data/devoxx/missing-sessions.json'); },
    getParticipantsByIds: getParticipantsByIds//function(){ return _get('data/devoxx/missing-participants.json'); }
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
  
  function getSessions(eventId){
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

  function getParticipants(eventId){
    return _get(baseUrl+'conferences/'+eventId+'/speakers').then(function(participants){
      if(Array.isArray(participants)){
        var filteredParticipants = _.filter(participants, function(participant){
          return participant && Array.isArray(participant.links) && participant.links.length > 0;
        });
        var promises = _.map(filteredParticipants, function(participant){
          return _getSpeaker(participant.links[0].href);
        });
        return $q.all(promises);
      } else {
        return [];
      }
    });
  }
  
  function getSessionsByIds(eventId, ids){
    return $q.all(_.map(ids, function(id){
      return _getTalk(baseUrl+'conferences/'+eventId+'/talks/'+id);
    }));
  }
  
  function getParticipantsByIds(eventId, ids){
    return $q.all(_.map(ids, function(id){
      return _getSpeaker(baseUrl+'conferences/'+eventId+'/speakers/'+id);
    }));
  }
  
  function _getEvent(url){
    return _get(url).then(function(event){
      return {
        extId: event.eventCode,
        name: _cleanStr(event.label ? event.label.split(',')[0] : event.eventCode),
        address: _cleanStr(event.localisation),
        soureUrl: url
      };
    });
  }
  
  function _getSpeaker(url){
    return _get(url).then(function(participant){
      return {
        extId: participant.uuid,
        role: 'speaker',
        name: _cleanStr(participant.firstName+' '+participant.lastName),
        avatar: participant.avatarURL,
        bio: _cleanStr(participant.bio),
        company: _cleanStr(participant.company),
        site: participant.blog,
        twitter: _cleanStr(participant.twitter),
        sessions: _.map(participant.acceptedTalks, function(talk){
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
            var session = {
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
              session.extId = slot.talk.id;
              session.format = _cleanStr(slot.talk.talkType);
              session.category = _cleanStr(slot.talk.track);
              session.title = _cleanStr(slot.talk.title);
              session.abstract = _cleanStr(slot.talk.summary);
              session.lang = _cleanStr(slot.talk.lang);
              session.participants = _.map(slot.talk.speakers, function(participant){
                var urlArray = participant.link.href.split('/');
                return {
                  extId: urlArray[urlArray.length-1],
                  name: _cleanStr(participant.name)
                };
              });
            } else if(slot.break){
              session.extId = slot.slotId;
              session.format = 'break';
              session.category = 'break';
              session.title = _cleanStr(slot.break.nameFR ? slot.break.nameFR : slot.break.nameEN);
            }
            
            if(session.extId){
              return session;
            }
          }
        }));
      } else {
        return [];
      }
    });
  }
  
  // used for a participant session not referenced in schedule
  // I noticed it's generally a 'Autres formats de conférence' talkType & it has no schedule or room...
  function _getTalk(url){
    return _get(url).then(function(talk){
      var session = {};
      session.extId = talk.id;
      session.format = _cleanStr(talk.talkType);
      session.category = _cleanStr(talk.track);
      session.title = _cleanStr(talk.title);
      session.abstract = _cleanStr(talk.summary);
      session.lang = _cleanStr(talk.lang);
      session.participants = _.map(talk.speakers, function(participant){
        var urlArray = participant.link.href.split('/');
        return {
          extId: urlArray[urlArray.length-1],
          name: _cleanStr(participant.name)
        };
      });
      session.soureUrl = url;
      return session;
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
