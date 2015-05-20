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
      toggleFavorite: toggleFavorite,
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
      /*return UserSrv.getUser().then(function(user){
        var actionCfg = {
          action: 'favorite',
          elt: {eventId: elt.eventId, className: elt.className, uuid: elt.uuid},
          userId: user.uuid,
          storageKey: userDataKey(elt.eventId),
          tmpAction: {eventId: elt.eventId, itemType: elt.className, itemId: elt.uuid, action: {favorite: true}}
        }
        UserActionSync.put(actionCfg);
        return angular.copy(actionCfg.tmpAction);
      });*/
      var key = userDataKey(elt.eventId);
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
      });
    }

    function unfavorite(elt){
      var key = userDataKey(elt.eventId);
      return UserSrv.getUser().then(function(user){
        return $http.delete(Config.backendUrl+'/events/'+elt.eventId+'/'+elt.className+'/'+elt.uuid+'/favorites', {headers: {userId: user.uuid}}).then(function(res){
          return getUserData(elt.eventId).then(function(userData){
            EventUtils.removeFavorite(userData, elt);
            return StorageUtils.set(key, userData);
          });
        });
      });
    }

    function toggleFavorite(userData, elt){
      if(EventUtils.isFavorite(userData, elt)){
        return unfavorite(elt).then(function(){
          EventUtils.removeFavorite(userData, elt);
        });
      } else {
        return favorite(elt).then(function(favData){
          EventUtils.setFavorite(userData, favData);
        });
      }
    }

    function setMood(elt, rating){
      var key = userDataKey(elt.eventId);
      return UserSrv.getUser().then(function(user){
        return $http.post(Config.backendUrl+'/events/'+elt.eventId+'/'+elt.className+'/'+elt.uuid+'/mood', {rating: rating}, {headers: {userId: user.uuid}}).then(function(res){
          return getUserData(elt.eventId).then(function(userData){
            EventUtils.setMood(userData, res.data);
            return StorageUtils.set(key, userData).then(function(){
              return res.data;
            });
          });
        });
      });
    }

    function createComment(elt, text){
      var key = userDataKey(elt.eventId);
      return UserSrv.getUser().then(function(user){
        return $http.post(Config.backendUrl+'/events/'+elt.eventId+'/'+elt.className+'/'+elt.uuid+'/comments', {text: text}, {headers: {userId: user.uuid}}).then(function(res){
          return getUserData(elt.eventId).then(function(userData){
            EventUtils.addComment(userData, res.data);
            return StorageUtils.set(key, userData).then(function(){
              return res.data;
            });
          });
        });
      });
    }

    function editComment(comment, text){
      var key = userDataKey(comment.eventId);
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
      });
    }

    function deleteComment(comment){
      var key = userDataKey(comment.eventId);
      return UserSrv.getUser().then(function(user){
        var eltType = comment.itemType.toLowerCase();
        return $http.delete(Config.backendUrl+'/events/'+comment.eventId+'/'+eltType+'/'+comment.itemId+'/comments/'+comment.uuid, {headers: {userId: user.uuid}}).then(function(){
          return getUserData(comment.eventId).then(function(userData){
            EventUtils.removeComment(userData, comment);
            return StorageUtils.set(key, userData);
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
  }

  EventUtils.$inject = ['_'];
  function EventUtils(_){
    var service = {
      isFavorite: isFavorite,
      setFavorite: setFavorite,
      removeFavorite: removeFavorite,
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
      return _.find(userData.actions, {itemId: elt.uuid, action: {favorite: true}}) !== undefined;
    }

    function setFavorite(userData, favData){
      var oldFavorite = _.find(userData.actions, {
        eventId: favData.eventId,
        itemType: favData.itemType,
        itemId: favData.itemId,
        action: {favorite: true}
      });
      if(oldFavorite){
        angular.extend(oldFavorite, favData);
      } else {
        userData.actions.push(favData);
      }
    }

    function removeFavorite(userData, elt){
      return _.remove(userData.actions, {itemId: elt.uuid, action: {favorite: true}});
    }

    function isMood(userData, elt, mood){
      var data = _.find(userData.actions, {itemId: elt.uuid, action: {mood: true}});
      return data !== undefined && data.action.rating === mood;
    }

    function setMood(userData, moodData){
      var oldMood = _.find(userData.actions, {uuid: moodData.uuid, action: {mood: true}});
      if(oldMood){
        angular.extend(oldMood, moodData);
      } else {
        userData.actions.push(moodData);
      }
    }

    function addComment(userData, commentData){
      userData.actions.push(commentData);
    }

    function updateComment(userData, commentData){
      var oldComment = _.find(userData.actions, {uuid: commentData.uuid, action: {comment: true}});
      angular.extend(oldComment, commentData);
    }

    function removeComment(userData, comment){
      return _.remove(userData.actions, {uuid: comment.uuid, action: {comment: true}});
    }

    function getComments(userData, elt){
      return _.filter(userData.actions, {itemId: elt.uuid, action: {comment: true}});
    }

    function getFavoriteExponents(event, userData){
      return _.map(_.filter(userData.actions, {itemType: 'exponents', action: {favorite: true}}), function(item){
        return _.find(event.exponents, {uuid: item.itemId});
      });
    }

    function getFavoriteSessions(event, userData){
      return _.map(_.filter(userData.actions, {itemType: 'sessions', action: {favorite: true}}), function(item){
        return _.find(event.sessions, {uuid: item.itemId});
      });
    }
  }
})();
