(function(){
  'use strict';
  angular.module('app')
    .factory('EventSrv', EventSrv)
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
      setMood: setMood,
      createComment: createComment,
      editComment: editComment,
      deleteComment: deleteComment,

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

      /*var key = userDataKey(elt.eventId);
      return UserSrv.getUser().then(function(user){
        return $http.post(Config.backendUrl+'/events/'+elt.eventId+'/'+elt.className+'/'+elt.uuid+'/favorites', {}, {headers: {userId: user.uuid}}).then(function(res){
          return getUserData(elt.eventId).then(function(userData){
            if(EventUtils.isFavorite(userData, elt)){
              return $q.when(res.data);
            } else {
              EventUtils.setFavorite(userData, res.data);
              return StorageUtils.set(key, userData).then(function(){
                return res.data;
              });
            }
          });
        });
      });*/
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

      /*var key = userDataKey(elt.eventId);
      return UserSrv.getUser().then(function(user){
        return $http.delete(Config.backendUrl+'/events/'+elt.eventId+'/'+elt.className+'/'+elt.uuid+'/favorites', {headers: {userId: user.uuid}}).then(function(res){
          return getUserData(elt.eventId).then(function(userData){
            EventUtils.removeFavorite(userData, elt);
            return StorageUtils.set(key, userData);
          });
        });
      });*/
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

      /*var key = userDataKey(elt.eventId);
      return UserSrv.getUser().then(function(user){
        return $http.post(Config.backendUrl+'/events/'+elt.eventId+'/'+elt.className+'/'+elt.uuid+'/mood', {rating: rating}, {headers: {userId: user.uuid}}).then(function(res){
          return getUserData(elt.eventId).then(function(userData){
            EventUtils.setMood(userData, res.data);
            return StorageUtils.set(key, userData).then(function(){
              return res.data;
            });
          });
        });
      });*/
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

      /*var key = userDataKey(elt.eventId);
      return UserSrv.getUser().then(function(user){
        return $http.post(Config.backendUrl+'/events/'+elt.eventId+'/'+elt.className+'/'+elt.uuid+'/comments', {text: text}, {headers: {userId: user.uuid}}).then(function(res){
          return getUserData(elt.eventId).then(function(userData){
            EventUtils.addComment(userData, res.data);
            return StorageUtils.set(key, userData).then(function(){
              return res.data;
            });
          });
        });
      });*/
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

      /*var key = userDataKey(comment.eventId);
      return UserSrv.getUser().then(function(user){
        var eltType = comment.itemType.toLowerCase();
        return $http.put(Config.backendUrl+'/events/'+comment.eventId+'/'+eltType+'/'+comment.itemId+'/comments/'+comment.uuid, {text: text}, {headers: {userId: user.uuid}}).then(function(res){
          return getUserData(comment.eventId).then(function(userData){
            EventUtils.updateComment(userData, res.data);
            return StorageUtils.set(key, userData).then(function(){
              return res.data;
            });
          });
        });
      });*/
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

      /*var key = userDataKey(comment.eventId);
      return UserSrv.getUser().then(function(user){
        var eltType = comment.itemType.toLowerCase();
        return $http.delete(Config.backendUrl+'/events/'+comment.eventId+'/'+eltType+'/'+comment.itemId+'/comments/'+comment.uuid, {headers: {userId: user.uuid}}).then(function(){
          return getUserData(comment.eventId).then(function(userData){
            EventUtils.removeComment(userData, comment);
            return StorageUtils.set(key, userData);
          });
        });
      });*/
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

    function _createTmpAction(user, elt, action){
      return {
        dirty: true,
        userId: user.uuid,
        action: action,
        itemType: elt.className,
        itemId: elt.uuid,
        eventId: elt.eventId,
        created: Date.now(),
        updated: Date.now()
      };
    }
  }

  EventUtils.$inject = ['_'];
  function EventUtils(_){
    var service = {
      isFavorite: isFavorite,
      setFavorite: setFavorite,
      setUnfavorite: setUnfavorite,
      isMood: isMood,
      setMood: setMood,
      addComment: addComment,
      updateComment: updateComment,
      removeComment: removeComment,
      getComments: getComments,
      getFavoriteExponents: getFavoriteExponents,
      getFavoriteSessions: getFavoriteSessions
    };
    return service;

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

    function isMood(userData, elt, mood){
      var data = _.find(userData.actions, {itemId: elt.uuid, action: {mood: true}});
      return data !== undefined && data.action.rating === mood;
    }

    function setMood(userData, data){
      var oldMood = _.find(userData.actions, {eventId: data.eventId, itemType: data.itemType, itemId: data.itemId, action: {mood: true}});
      if(oldMood){
        angular.extend(oldMood, data);
      } else {
        userData.actions.push(data);
      }
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
