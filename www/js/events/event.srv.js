(function(){
  'use strict';
  angular.module('app')
    .factory('EventSrv', EventSrv)
    .factory('EventUtils', EventUtils);

  EventSrv.$inject = ['$q', '$http', 'UserSrv', 'EventUtils', 'DataUtils', 'StorageUtils', 'Config', '_'];
  function EventSrv($q, $http, UserSrv, EventUtils, DataUtils, StorageUtils, Config, _){
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
      return DataUtils.getOrFetch(key, '/events/'+eventId+'/full', false, _formatEvent);
    }

    function getUserData(eventId){
      var key = userDataKey(eventId);
      return UserSrv.getUser().then(function(user){
        return DataUtils.getOrFetch(key, '/users/'+user.uuid+'/actions/'+eventId);
      });
    }

    function favorite(elt, eltType){
      var key = userDataKey(elt.eventId);
      return UserSrv.getUser().then(function(user){
        return $http.post(Config.backendUrl+'/events/'+elt.eventId+'/'+eltType+'/'+elt.uuid+'/favorites', {}, {headers: {userId: user.uuid}}).then(function(res){
          return getUserData(elt.eventId).then(function(userData){
            if(EventUtils.isFavorite(userData, elt)){
              return $q.when(res.data);
            } else {
              EventUtils.addFavorite(userData, res.data);
              return StorageUtils.set(key, userData).then(function(){
                return res.data;
              });
            }
          });
        });
      });
    }

    function unfavorite(elt, eltType){
      var key = userDataKey(elt.eventId);
      return UserSrv.getUser().then(function(user){
        return $http.delete(Config.backendUrl+'/events/'+elt.eventId+'/'+eltType+'/'+elt.uuid+'/favorites', {headers: {userId: user.uuid}}).then(function(res){
          return getUserData(elt.eventId).then(function(userData){
            EventUtils.removeFavorite(userData, elt);
            return StorageUtils.set(key, userData);
          });
        });
      });
    }

    function toggleFavorite(userData, elt, eltType){
      if(EventUtils.isFavorite(userData, elt)){
        return unfavorite(elt, eltType).then(function(){
          EventUtils.removeFavorite(userData, elt);
        });
      } else {
        return favorite(elt, eltType).then(function(favData){
          EventUtils.addFavorite(userData, favData);
        });
      }
    }

    function setMood(elt, eltType, rating){
      var key = userDataKey(elt.eventId);
      return UserSrv.getUser().then(function(user){
        return $http.post(Config.backendUrl+'/events/'+elt.eventId+'/'+eltType+'/'+elt.uuid+'/mood', {rating: rating}, {headers: {userId: user.uuid}}).then(function(res){
          return getUserData(elt.eventId).then(function(userData){
            EventUtils.setMood(userData, res.data);
            return StorageUtils.set(key, userData).then(function(){
              return res.data;
            });
          });
        });
      });
    }

    function createComment(elt, eltType, text){
      var key = userDataKey(elt.eventId);
      return UserSrv.getUser().then(function(user){
        return $http.post(Config.backendUrl+'/events/'+elt.eventId+'/'+eltType+'/'+elt.uuid+'/comments', {text: text}, {headers: {userId: user.uuid}}).then(function(res){
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
      return DataUtils.refresh(key, '/events/'+eventId+'/full', false, _formatEvent);
    }

    // TODO : remove this function when changes are made in the backend !!!
    function _formatEvent(event){
      event.className = 'events';
      _.map(event.sessions, function(session){
        session.className = 'sessions';
        session.name = session.name ? session.name : session.title;
        session.description = session.description ? session.description : session.summary;
        delete session.title;
        delete session.summary;
      });
      _.map(event.exponents, function(exponent){
        exponent.className = 'exponents';
      });
      return event;
    }
  }

  EventUtils.$inject = ['_'];
  function EventUtils(_){
    var service = {
      isFavorite: isFavorite,
      addFavorite: addFavorite,
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
      return _.find(userData, {itemId: elt.uuid, action: {favorite: true}}) !== undefined;
    }

    function addFavorite(userData, favData){
      userData.push(favData);
    }

    function removeFavorite(userData, elt){
      return _.remove(userData, {itemId: elt.uuid, action: {favorite: true}});
    }

    function isMood(userData, elt, mood){
      var data = _.find(userData, {itemId: elt.uuid, action: {mood: true}});
      return data !== undefined && data.action.rating === mood;
    }

    function setMood(userData, moodData){
      var oldMood = _.find(userData, {uuid: moodData.uuid, action: {mood: true}});
      if(oldMood){
        angular.extend(oldMood, moodData);
      } else {
        userData.push(moodData);
      }
    }

    function addComment(userData, commentData){
      userData.push(commentData);
    }

    function updateComment(userData, commentData){
      var oldComment = _.find(userData, {uuid: commentData.uuid, action: {comment: true}});
      angular.extend(oldComment, commentData);
    }

    function removeComment(userData, comment){
      return _.remove(userData, {uuid: comment.uuid, action: {comment: true}});
    }

    function getComments(userData, elt){
      return _.filter(userData, {itemId: elt.uuid, action: {comment: true}});
    }

    function getFavoriteExponents(event, userData){
      return _.map(_.filter(userData, {itemType: 'Exponents', action: {favorite: true}}), function(item){
        return _.find(event.exponents, {uuid: item.itemId});
      });
    }

    function getFavoriteSessions(event, userData){
      return _.map(_.filter(userData, {itemType: 'Sessions', action: {favorite: true}}), function(item){
        return _.find(event.sessions, {uuid: item.itemId});
      });
    }
  }
})();
