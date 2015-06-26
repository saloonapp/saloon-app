(function(){
  'use strict';
  angular.module('app')
    .factory('EventSrv', EventSrv)
    .factory('EventLastRefresh', EventLastRefresh)
    .factory('EventUtils', EventUtils);

  EventSrv.$inject = ['$q', '$http', 'UserSrv', 'UserActionSync', 'EventUtils', 'DataUtils', 'StorageUtils', 'Config', '_'];
  function EventSrv($q, $http, UserSrv, UserActionSync, EventUtils, DataUtils, StorageUtils, Config, _){
    var storageKey = 'events';
    function eventKey(eventId){ return storageKey+'-'+eventId; }
    function userDataKey(eventId){ return storageKey+'-'+eventId+'-userData'; }

    var service = {
      getAll: getAll,
      get: get,
      getExponent: getExponent,
      getSession: getSession,
      getUserData: getUserData,

      favorite: favorite,
      unfavorite: unfavorite,
      done: done,
      undone: undone,
      setMood: setMood,
      deleteMood: deleteMood,
      createComment: createComment,
      editComment: editComment,
      deleteComment: deleteComment,
      subscribe: subscribe,
      unsubscribe: unsubscribe,

      refreshEventList: refreshEventList,
      refreshEvent: refreshEvent
    };
    return service;

    function getAll(){
      return DataUtils.getOrFetch(storageKey, '/events/all');
    }

    function get(eventId){
      var key = eventKey(eventId);
      return DataUtils.getOrFetch(key, '/events/'+eventId+'/full');
    }

    function getUserData(eventId){
      var key = userDataKey(eventId);
      return UserSrv.getUser().then(function(user){
        return DataUtils.getOrFetch(key, '/users/'+user.uuid+'/actions/'+eventId);
      });
    }

    function favorite(elt){
      return UserSrv.getUser().then(function(user){
        var tmpAction = _createTmpAction(user, elt, {favorite: true});
        var key = userDataKey(elt.eventId);
        return getUserData(elt.eventId).then(function(userData){
          EventUtils.setFavorite(userData, tmpAction);
          return StorageUtils.set(key, userData).then(function(){
            UserActionSync.syncUserAction(key);
            return tmpAction;
          });
        });
      });
    }

    function unfavorite(elt){
      return UserSrv.getUser().then(function(user){
        var tmpAction = _createTmpAction(user, elt, {favorite: false});
        var key = userDataKey(elt.eventId);
        return getUserData(elt.eventId).then(function(userData){
          EventUtils.setUnfavorite(userData, tmpAction);
          return StorageUtils.set(key, userData).then(function(){
            UserActionSync.syncUserAction(key);
            return tmpAction;
          });
        });
      });
    }

    function done(elt){
      return UserSrv.getUser().then(function(user){
        var tmpAction = _createTmpAction(user, elt, {done: true});
        var key = userDataKey(elt.eventId);
        return getUserData(elt.eventId).then(function(userData){
          EventUtils.setDone(userData, tmpAction);
          return StorageUtils.set(key, userData).then(function(){
            UserActionSync.syncUserAction(key);
            return tmpAction;
          });
        });
      });
    }

    function undone(elt){
      return UserSrv.getUser().then(function(user){
        var tmpAction = _createTmpAction(user, elt, {done: false});
        var key = userDataKey(elt.eventId);
        return getUserData(elt.eventId).then(function(userData){
          EventUtils.setUndone(userData, tmpAction);
          return StorageUtils.set(key, userData).then(function(){
            UserActionSync.syncUserAction(key);
            return tmpAction;
          });
        });
      });
    }

    function setMood(elt, rating){
      return UserSrv.getUser().then(function(user){
        var tmpAction = _createTmpAction(user, elt, {rating: rating, mood: true});
        var key = userDataKey(elt.eventId);
        return getUserData(elt.eventId).then(function(userData){
          EventUtils.setMood(userData, tmpAction);
          return StorageUtils.set(key, userData).then(function(){
            UserActionSync.syncUserAction(key);
            return tmpAction;
          });
        });
      });
    }

    function deleteMood(elt){
      return UserSrv.getUser().then(function(user){
        var tmpAction = _createTmpAction(user, elt, {mood: false});
        var key = userDataKey(elt.eventId);
        return getUserData(elt.eventId).then(function(userData){
          EventUtils.removeMood(userData, tmpAction);
          return StorageUtils.set(key, userData).then(function(){
            UserActionSync.syncUserAction(key);
            return tmpAction;
          });
        });
      });
    }

    function createComment(elt, text){
      return UserSrv.getUser().then(function(user){
        var tmpAction = _createTmpAction(user, elt, {text: text, comment: true});
        var key = userDataKey(elt.eventId);
        return getUserData(elt.eventId).then(function(userData){
          EventUtils.addComment(userData, tmpAction);
          return StorageUtils.set(key, userData).then(function(){
            UserActionSync.syncUserAction(key);
            return tmpAction;
          });
        });
      });
    }

    function editComment(comment, text){
      return UserSrv.getUser().then(function(user){
        var tmpAction = angular.copy(comment);
        tmpAction.dirty = true;
        tmpAction.action.text = text;
        tmpAction.updated = Date.now();
        var key = userDataKey(comment.eventId);
        return getUserData(comment.eventId).then(function(userData){
          EventUtils.updateComment(userData, tmpAction);
          return StorageUtils.set(key, userData).then(function(){
            UserActionSync.syncUserAction(key);
            return tmpAction;
          });
        });
      });
    }

    function deleteComment(comment){
      return UserSrv.getUser().then(function(user){
        var tmpAction = angular.copy(comment);
        tmpAction.dirty = true;
        tmpAction.action.comment = false;
        var key = userDataKey(comment.eventId);
        return getUserData(comment.eventId).then(function(userData){
          EventUtils.removeComment(userData, tmpAction);
          return StorageUtils.set(key, userData).then(function(){
            UserActionSync.syncUserAction(key);
            return tmpAction;
          });
        });
      });
    }

    function subscribe(event, form){
      return UserSrv.getUser().then(function(user){
        var tmpAction = _createTmpAction(user, event, {email: form.email, filter: form.filter, subscribe: true}, event.uuid);
        var key = userDataKey(event.uuid);
        return getUserData(event.uuid).then(function(userData){
          EventUtils.setSubscribe(userData, tmpAction);
          return StorageUtils.set(key, userData).then(function(){
            UserActionSync.syncUserAction(key);
            return tmpAction;
          });
        });
      });
    }

    function unsubscribe(event){
      return UserSrv.getUser().then(function(user){
        var tmpAction = _createTmpAction(user, event, {subscribe: false}, event.uuid);
        var key = userDataKey(event.uuid);
        return getUserData(event.uuid).then(function(userData){
          EventUtils.setSubscribe(userData, tmpAction);
          return StorageUtils.set(key, userData).then(function(){
            UserActionSync.syncUserAction(key);
            return tmpAction;
          });
        });
      });
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
      var key = eventKey(eventId);
      return DataUtils.refresh(key, '/events/'+eventId+'/full');
    }

    function _createTmpAction(user, elt, action, _eventId){
      return {
        dirty: true,
        userId: user.uuid,
        action: action,
        itemType: elt.className,
        itemId: elt.uuid,
        eventId: _eventId ? _eventId : elt.eventId,
        created: Date.now(),
        updated: Date.now()
      };
    }
  }

  EventLastRefresh.$inject = ['StorageUtils'];
  function EventLastRefresh(StorageUtils){
    var storageKey = 'events-last-refresh';
    var refreshRate = 60*60*1000; // one hour
    var service = {
      shouldRefresh: shouldRefresh,
      refresed: refresed
    };
    return service;

    function shouldRefresh(eventId){
      return StorageUtils.get(storageKey, {}).then(function(refreshData){
        // refresh every hour...
        return !refreshData[eventId] || refreshData[eventId] < Date.now()-refreshRate;
      });
    }
    function refresed(eventId){
      return StorageUtils.get(storageKey, {}).then(function(refreshData){
        refreshData[eventId] = Date.now();
        return StorageUtils.set(storageKey, refreshData);
      });
    }
  }

  EventUtils.$inject = ['moment', '_'];
  function EventUtils(moment, _){
    var service = {
      isEventNow: isEventNow,
      getSessionDays: getSessionDays,
      getSessionsForDay: getSessionsForDay,
      isFavorite: isFavorite,
      setFavorite: setFavorite,
      setUnfavorite: setUnfavorite,
      isDone: isDone,
      setDone: setDone,
      setUndone: setUndone,
      isMood: isMood,
      getMood: getMood,
      setMood: setMood,
      removeMood: removeMood,
      getMoodFor: getMoodFor,
      addComment: addComment,
      updateComment: updateComment,
      removeComment: removeComment,
      isSubscribe: isSubscribe,
      getSubscribe: getSubscribe,
      setSubscribe: setSubscribe,
      setUnsubscribe: setUnsubscribe,
      getComments: getComments,
      getFavoriteExponents: getFavoriteExponents,
      getFavoriteSessions: getFavoriteSessions
    };
    return service;

    function isEventNow(event){
      if(event){
        var isToday = moment(event.start).format('DD/MM/YYYY') === moment().format('DD/MM/YYYY') || moment(event.end).format('DD/MM/YYYY') === moment().format('DD/MM/YYYY');
        var isRunning = event.start < Date.now() && Date.now() < event.end
        return isRunning || isToday;
      }
      return false;
    }

    function getSessionDays(sessions){
      var days = {};
      _.map(sessions, function(session){
        if(session.start){
          var day = moment(new Date(session.start)).format('MM/DD/YYYY');
          if(!days[day] || days[day] > session.start){
            days[day] = session.start;
          }
        }
      });
      return _.map(days, function(day){
        return day;
      });
    }

    function getSessionsForDay(sessions, day){
      var daySessions = [];
      var dayStr = moment(new Date(day)).format('MM/DD/YYYY');
      _.map(sessions, function(session){
        if(session.start && moment(new Date(session.start)).format('MM/DD/YYYY') === dayStr){
          daySessions.push(session);
        }
      });
      return daySessions;
    }

    function isFavorite(userData, elt){
      return elt && elt.uuid && _.find(userData.actions, {itemId: elt.uuid, action: {favorite: true}}) !== undefined;
    }

    function setFavorite(userData, data){
      _.remove(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {favorite: false}});
      var oldFavorite = _.find(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {favorite: true}});
      if(!oldFavorite){
        userData.actions.push(data);
      }
    }

    function setUnfavorite(userData, data){
      _.remove(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {favorite: true}});
      var oldUnfavorite = _.find(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {favorite: false}});
      if(!oldUnfavorite){
        userData.actions.push(data);
      }
    }

    function isDone(userData, elt){
      return elt && elt.uuid && _.find(userData.actions, {itemId: elt.uuid, action: {done: true}}) !== undefined;
    }

    function setDone(userData, data){
      _.remove(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {done: false}});
      var oldDone = _.find(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {done: true}});
      if(!oldDone){
        userData.actions.push(data);
      }
    }

    function setUndone(userData, data){
      _.remove(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {done: true}});
      var oldUndone = _.find(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {done: false}});
      if(!oldUndone){
        userData.actions.push(data);
      }
    }

    function isMood(userData, elt, mood){
      var uuid = typeof elt === 'object' ? elt.uuid : elt;
      var data = _.find(userData.actions, {itemId: uuid, action: {mood: true}});
      return data !== undefined && data.action.rating === mood;
    }

    function getMood(userData, elt){
      var uuid = typeof elt === 'object' ? elt.uuid : elt;
      var data = _.find(userData.actions, {itemId: uuid, action: {mood: true}});
      return data !== undefined ? data.action.rating : undefined;
    }

    function setMood(userData, data){
      var oldMood = _.find(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {mood: true}});
      if(oldMood){
        angular.extend(oldMood, data);
      } else {
        userData.actions.push(data);
      }
    }

    function removeMood(userData, data){
      _.remove(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {mood: true}});
      var oldUnmood = _.find(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {mood: false}});
      if(!oldUnmood){
        userData.actions.push(data);
      }
    }

    function getMoodFor(userData, elts){
      var moods = {};
      _.map(elts, function(elt){
        var uuid = typeof elt === 'object' ? elt.uuid : elt;
        moods[uuid] = getMood(userData, elt);
      });
      return moods;
    }

    function addComment(userData, data){
      userData.actions.push(data);
    }

    function updateComment(userData, data){
      var oldComment = _.find(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {comment: true}, created: data.created});
      angular.extend(oldComment, data);
    }

    function removeComment(userData, data){
      var oldComment = _.find(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {comment: true}, created: data.created});
      data.uuid = oldComment.uuid;
      _.remove(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {comment: true}, created: data.created});
      userData.actions.push(data);
    }

    function getComments(userData, elt){
      return _.filter(userData.actions, {itemId: elt.uuid, action: {comment: true}});
    }

    function isSubscribe(userData, elt){
      return _.find(userData.actions, {itemId: elt.uuid, action: {subscribe: true}}) !== undefined;
    }

    function getSubscribe(userData, elt){
      return _.find(userData.actions, {itemId: elt.uuid, action: {subscribe: true}});
    }

    function setSubscribe(userData, data){
      _.remove(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {subscribe: false}});
      var oldSubscribe = _.find(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {subscribe: true}});
      if(oldSubscribe){
        angular.extend(oldSubscribe, data);
      } else {
        userData.actions.push(data);
      }
    }

    function setUnsubscribe(userData, data){
      _.remove(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {subscribe: true}});
      var oldUnsubscribe = _.find(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {subscribe: false}});
      if(!oldUnsubscribe){
        userData.actions.push(data);
      }
    }

    function getFavoriteExponents(event, userData){
      var userFavs = _.filter(userData.actions, {itemType: 'exponents', action: {favorite: true}});
      var favorites = _.map(userFavs, function(fav){
        var elt = _.find(event.exponents, {uuid: fav.itemId});
        return elt;
      });
      return _.filter(favorites, function(s){ return !!s; });
    }

    function getFavoriteSessions(event, userData){
      var userFavs = _.filter(userData.actions, {itemType: 'sessions', action: {favorite: true}});
      var favorites = _.map(userFavs, function(fav){
        var elt = _.find(event.sessions, {uuid: fav.itemId});
        return elt;
      });
      return _.filter(favorites, function(s){ return !!s; });
    }
  }
})();
