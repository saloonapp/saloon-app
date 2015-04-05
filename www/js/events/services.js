angular.module('app')

.factory('IonicSrv', function($ionicLoading, $ionicScrollDelegate, $ionicPosition){
  'use strict';
  var service = {
    withLoading: withLoading,
    scrollTo: scrollTo
  };

  function withLoading(promise){
    $ionicLoading.show();
    return promise.then(function(res){
      return res;
    }).finally(function(){
      $ionicLoading.hide();
    });
  }

  function scrollTo(className, _shouldAnimate){
    var elt = document.getElementsByClassName(className);
    if(elt){
      var scrollElt = _getParentWithClass(angular.element(elt), 'scroll-content');
      if(scrollElt){
        try {
          var eltOffset = $ionicPosition.offset(elt); // get an error when element is not visible :(
          var scrollOffset = $ionicPosition.offset(scrollElt);
          var handle = scrollElt.attr('delegate-handle');
          var $scroll = handle ? $ionicScrollDelegate.$getByHandle(handle) : $ionicScrollDelegate;
          var scroll = $scroll.getScrollPosition();
          $scroll.scrollTo(scroll.left, eltOffset.top-scrollOffset.top, _shouldAnimate);
        } catch(e){
          console.warn('scrollTo('+className+') error :(', e);
        }
      } else {
        console.warn('Parent element with class <scroll-content> not found !');
      }
    } else {
      console.warn('Element with class <'+className+'> not found !');
    }
  }

  // because  ionic.DomUtil.getParentWithClass(elt, 'scroll-content') doesn't seems to work :(
  function _getParentWithClass(elt, className, _maxDeep){
    if(_maxDeep === undefined){ _maxDeep = 10; }
    var parent = elt.parent();
    if(parent.hasClass(className)){ return parent; }
    else if(_maxDeep > 0){ return _getParentWithClass(parent, className, _maxDeep-1); }
    else { return null; }
  }

  return service;
})

.factory('EventSrv', function($rootScope, $q, $ionicModal, $ionicScrollDelegate, UserSrv, StorageUtils, ParseUtils, Utils, LocalNotificationPlugin){
  'use strict';
  var storageKey = 'events';
  var eventCrud = ParseUtils.createCrud('Event');
  var participantCrud = ParseUtils.createCrud('EventParticipant');
  var sessionCrud = ParseUtils.createCrud('EventSession');
  var userDataCrud = ParseUtils.createCrud('EventUserData');
  var service = {
    getEvents: getEvents,
    getEventInfo: getEventInfo,
    getEventSessions: getEventSessions,
    getEventParticipants: getEventParticipants,
    getEventSession: getEventSession,
    getEventParticipant: getEventParticipant,
    getEventUserData: getEventUserData,
    groupBySlot: groupBySlot,
    groupByDay: groupByDay,
    getSessionValues: getSessionValues,
    addSessionToFav: addSessionToFav,
    removeSessionFromFav: removeSessionFromFav,
    isSessionFav: isSessionFav,
    getSessionFilterModal: getSessionFilterModal,
    buildChooseSessionModal: buildChooseSessionModal
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

  function getEventInfo(eventId, _fromRemote){
    var key = storageKey+'-'+eventId;
    return _getLocalOrRemote(key, function(){
      return eventCrud.findOne({objectId: eventId});
    }, {}, _fromRemote);
  }

  function getEventSessions(eventId, _fromRemote){
    var key = storageKey+'-'+eventId+'-sessions';
    return _getLocalOrRemote(key, function(){
      return sessionCrud.find({event: ParseUtils.toPointer('Event', eventId)}, '&limit=1000');
    }, [], _fromRemote);
  }

  function getEventParticipants(eventId, _fromRemote){
    var key = storageKey+'-'+eventId+'-participants';
    return _getLocalOrRemote(key, function(){
      return participantCrud.find({event: ParseUtils.toPointer('Event', eventId)}, '&limit=1000');
    }, [], _fromRemote);
  }

  function getEventSession(eventId, sessionId){
    return getEventSessions(eventId).then(function(sessions){
      return _.find(sessions, {extId: sessionId});
    });
  }

  function getEventParticipant(eventId, participantId){
    return getEventParticipants(eventId).then(function(participants){
      return _.find(participants, {extId: participantId});
    });
  }

  function groupBySlot(sessions){
    var sessionsBySlot = [];
    _.map(sessions, function(session){
      var slot = session.from && session.to ? moment(session.from).format('ddd H\\hmm')+'-'+moment(session.to).format('H\\hmm') : 'Non planifié';
      var group = _.find(sessionsBySlot, {name: slot});
      if(!group){
        group = {
          name: slot,
          from: session.from,
          to: session.to,
          sessions: []
        };
        sessionsBySlot.push(group);
      }
      group.sessions.push(session);
    });
    return _.sortBy(sessionsBySlot, function(a){
      return new Date(a.from).getTime();
    });
  }

  function groupByDay(slots){
    var slotsByDay = [];
    _.map(slots, function(slot){
      if(slot.from){
        var date = Date.parse(moment(new Date(slot.from)).format('MM/DD/YYYY'));
        var day = moment(new Date(slot.from)).format('dddd');
        var group = _.find(slotsByDay, {date: date});
        if(!group){
          group = {
            date: date,
            day: day,
            slots: []
          };
          slotsByDay.push(group);
        }
        group.slots.push(slot);
      }
    });
    return _.sortBy(slotsByDay, 'date');
  }

  function getSessionValues(sessions){
    return _valueLists(['format', 'category', 'room'], sessions);
  }

  function getEventUserData(eventId, _fromRemote){
    var key = storageKey+'-'+eventId+'-userData';
    return StorageUtils.get(key).then(function(data){
      if(data && !_fromRemote){
        return data;
      } else {
        return UserSrv.getCurrent().then(function(user){
          return userDataCrud.findOne({
            event: ParseUtils.toPointer('Event', eventId),
            user: ParseUtils.toPointer('_User', user)
          }).then(function(data){
            if(!data){
              data = {
                event: ParseUtils.toPointer('Event', eventId),
                user: ParseUtils.toPointer('_User', user),
                sessionFavs: []
              };
            }
            return _setEventUserData(eventId, data);
          });
        });
      }
    });
  }

  function _setEventUserData(eventId, userData){
    var key = storageKey+'-'+eventId+'-userData';
    Utils.debounce('_setEventUserData', function(){
      userDataCrud.save(userData);
    }, 20000);
    return StorageUtils.set(key, userData).then(function(){
      return userData;
    });
  }

  function addSessionToFav(eventId, session){
    return getEventUserData(eventId).then(function(userData){
      if(userData.sessionFavs.indexOf(session.objectId) === -1){
        userData.sessionFavs.push(session.objectId);
        _scheduleSessionNotification(session);
        sessionCrud.savePartial(session, {
          favs: {__op: 'Increment', amount: 1}
        });
        getEventSessions(eventId).then(function(sessions){
          var s = _.find(sessions, {objectId: session.objectId});
          if(s){
            s.favs++;
            StorageUtils.set(storageKey+'-'+eventId+'-sessions', sessions);
          }
        });
        return _setEventUserData(eventId, userData);
      } else {
        return userData;
      }
    });
  }

  function removeSessionFromFav(eventId, session){
    return getEventUserData(eventId).then(function(userData){
      var index = userData.sessionFavs.indexOf(session.objectId);
      if(index > -1){
        userData.sessionFavs.splice(index, 1);
        _cancelSessionNotification(session);
        sessionCrud.savePartial(session, {
          favs: {__op: 'Increment', amount: -1}
        });
        getEventSessions(eventId).then(function(sessions){
          var s = _.find(sessions, {objectId: session.objectId});
          if(s){
            s.favs--;
            StorageUtils.set(storageKey+'-'+eventId+'-sessions', sessions);
          }
        });
        return _setEventUserData(eventId, userData);
      } else {
        return userData;
      }
    });
  }

  function _updateFavSessions(eventId, toAdd, toRemove){
    return getEventUserData(eventId).then(function(userData){
      if(!userData){ userData = {}; }
      if(!userData.sessionFavs){ userData.sessionFavs = []; }
      for(var i in toAdd){
        if(userData.sessionFavs.indexOf(toAdd[i].objectId) === -1){
          userData.sessionFavs.push(toAdd[i].objectId);
          _scheduleSessionNotification(toAdd[i]);
          sessionCrud.savePartial(toAdd[i], {
            favs: {__op: 'Increment', amount: 1}
          });
        }
      }
      for(var i in toRemove){
        var index = userData.sessionFavs.indexOf(toRemove[i].objectId);
        if(index > -1){
          userData.sessionFavs.splice(index, 1);
          _cancelSessionNotification(toRemove[i]);
          sessionCrud.savePartial(toRemove[i], {
            favs: {__op: 'Increment', amount: -1}
          });
        }
      }
      getEventSessions(eventId).then(function(sessions){
        for(var i in toAdd){
          var s = _.find(sessions, {objectId: toAdd[i].objectId});
          if(s){ s.favs++; }
        }
        for(var i in toRemove){
          var s = _.find(sessions, {objectId: toRemove[i].objectId});
          if(s){ s.favs--; }
        }
        StorageUtils.set(storageKey+'-'+eventId+'-sessions', sessions);
      });
      return _setEventUserData(eventId, userData);
    });
  }

  function _scheduleSessionNotification(session){
    LocalNotificationPlugin.schedule({
      id: session.objectId,
      title: 'Dans 10min, '+session.room.name,
      text: '['+session.format+'] '+session.title,
      at: new Date((new Date(session.from)).getTime() - (10 * 60 * 1000))
    });
  }

  function _cancelSessionNotification(session){
    LocalNotificationPlugin.cancel(session.objectId);
  }

  function isSessionFav(userData, session){
    if(userData && session && Array.isArray(userData.sessionFavs)){
      return userData.sessionFavs.indexOf(session.objectId) > -1;
    }
    return false;
  }

  function getSessionFilterModal($scope){
    return $ionicModal.fromTemplateUrl('views/events/filter-modal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    });
  }

  function buildChooseSessionModal(eventId, sessions){
    var modalScope = $rootScope.$new(true);
    modalScope.data = {};
    modalScope.fn = {};
    modalScope.fn.getFavs = function(session){ return session.favs ? session.favs : 0; }
    modalScope.fn.openModal = function(group){
      $ionicScrollDelegate.$getByHandle('modalChooseSessionContent').scrollTop(false); // does not work in ionic 1.0.0-rc2 but it should :(
      modalScope.data.group = group;
      modalScope.data.sessions = angular.copy(_.filter(sessions, function(session){
        return group.from === session.from && group.to === session.to;
      }));
      _.map(modalScope.data.sessions, function(session){
        session.checked = !!_.find(group.sessions, {objectId: session.objectId});
      });
      modalScope.modal.show();
    };
    modalScope.fn.validSessions = function(){
      var toAdd = [], toRemove = [];
      _.map(modalScope.data.sessions, function(session){
        if(_.find(modalScope.data.group.sessions, {objectId: session.objectId})){
          if(!session.checked){
            _.remove(modalScope.data.group.sessions, {objectId: session.objectId});
            toRemove.push(session);
          }
        } else {
          if(session.checked){
            modalScope.data.group.sessions.push(session);
            toAdd.push(session);
          }
        }
      });
      if(toAdd.length > 0 || toRemove.length > 0){
        _updateFavSessions(eventId, toAdd, toRemove);
      }
      modalScope.modal.hide();
    };

    return $ionicModal.fromTemplateUrl('views/events/choose-session-modal.html', {
      scope: modalScope,
      animation: 'slide-in-up'
    }).then(function(modal){
      modalScope.modal = modal;
      return modalScope;
    });
  }

  function _getLocalOrRemote(key, getRemote, remoteDefault, _fromRemote){
    return StorageUtils.get(key).then(function(data){
      if(data && !_fromRemote){
        return data;
      } else {
        return getRemote().then(function(remoteData){
          if(remoteData){
            return StorageUtils.set(key, remoteData).then(function(){
              return remoteData;
            });
          } else {
            return remoteDefault;
          }
        });
      }
    });
  }

  function _valueLists(fields, sessions){
    var values = {};
    _.map(fields, function(field){
      values[field] = [];
    });
    _.map(sessions, function(session){
      _.map(fields, function(field){
        var value = Utils.getDeep(session, field);
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

  return service;
});
