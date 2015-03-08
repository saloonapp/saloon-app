angular.module('app')

.factory('TabSrv', function(){
  'use strict';
  var service = {
    badges: {
      users: 0
    }
  };

  return service;
})

.factory('UsersSrv', function($q, $timeout, UserSrv, ParseUtils, Utils, GeolocationPlugin){
  'use strict';
  var matchDistance = 1; // 1 km
  var matchMaxAge = 60 * 60 * 1000; // 1h
  var tmpUsers = null;
  var service = {
    getNearUsers: getNearUsers,
    get: get
  };
  var userCrud = ParseUtils.createUserCrud(null, function(){}, false);

  function getNearUsers(){
    return UserSrv.getCurrent().then(function(user){
      return GeolocationPlugin.getCurrentPosition().then(function(pos){
        return userCrud.find({
          objectId: {$ne: user.objectId},
          active: true,
          updatedAt: {$gt: ParseUtils.toDate(Date.now() - matchMaxAge)},
          location: {
            $nearSphere: ParseUtils.toGeoPoint(pos.coords.latitude, pos.coords.longitude),
            $maxDistanceInKilometers: matchDistance
          }
        }).then(function(users){
          tmpUsers = users;
          return users;
        });
      });
    });
  }

  function get(id){
    if(Array.isArray(tmpUsers)){
      for(var i in tmpUsers){
        if(tmpUsers[i].objectId === id){
          return $q.when(angular.copy(tmpUsers[i]));
        }
      }
    }
    return userCrud.get(id);
  }

  return service;
})

.factory('RelationsSrv', function($state, UserSrv, UsersSrv, DialogPlugin, ParseUtils, PushPlugin, GeolocationPlugin){
  'use strict';
  var relationCrud = ParseUtils.createCrud('Relation');
  var service = {
    status: {
      INVITED: 'invited',
      DECLINED: 'declined',
      ACCEPTED: 'accepted'
    },
    get: get,
    invite: invite,
    acceptInvite: acceptInvite,
    declineInvite: declineInvite,
    onInvitation: onInvitation
  };

  function get(user){
    return UserSrv.getCurrent().then(function(currentUser){
      return relationCrud.findOne({
        from: {$in: [ParseUtils.toPointer('_User', user), ParseUtils.toPointer('_User', currentUser)]},
        to: {$in: [ParseUtils.toPointer('_User', user), ParseUtils.toPointer('_User', currentUser)]}
      });
    });
  }

  function invite(user){
    return UserSrv.getCurrent().then(function(currentUser){
      return GeolocationPlugin.getCurrentPosition().then(function(pos){
        var relation = {
          from: ParseUtils.toPointer('_User', currentUser),
          to: ParseUtils.toPointer('_User', user),
          location: ParseUtils.toGeoPoint(pos.coords.latitude, pos.coords.longitude),
          locationAccuracy: pos.coords.accuracy,
          status: service.status.INVITED
        };
        return relationCrud.save(relation).then(function(){
          if(user && user.push && user.push.id && user.push.platform === 'android'){
            return PushPlugin.sendPush([user.push.id], {
              type: 'relation_invite',
              userId: currentUser.objectId,
              title: 'Invitation reçue',
              message: currentUser.pseudo+' vous invite à le rencontrer'
            });
          } else {
            console.log('no able to push to user', user);
          }
        });
      });
    });
  }

  function acceptInvite(relation){
    return UserSrv.getCurrent().then(function(currentUser){
      var rel = angular.copy(relation); // do not update scope relation
      rel.status = service.status.ACCEPTED;
      return relationCrud.save(rel).then(function(){
        relation.status = service.status.ACCEPTED; // update scope relation
        return UsersSrv.get(relation.from.objectId);
      }).then(function(user){
        if(user && user.push && user.push.id && user.push.platform === 'android'){
          return PushPlugin.sendPush([user.push.id], {
            type: 'relation_accept',
            userId: currentUser.objectId,
            title: 'Invitation acceptée',
            message: currentUser.pseudo+' a accepté votre invitation :)'
          });
        } else {
          console.log('no able to push to user', user);
        }
      });
    });
  }

  function declineInvite(relation){
    return UserSrv.getCurrent().then(function(currentUser){
      var rel = angular.copy(relation); // do not update scope relation
      rel.status = service.status.DECLINED;
      return relationCrud.save(rel).then(function(){
        relation.status = service.status.DECLINED; // update scope relation
        return UsersSrv.get(relation.from.objectId);
      }).then(function(user){
        if(user && user.push && user.push.id && user.push.platform === 'android'){
          return PushPlugin.sendPush([user.push.id], {
            type: 'relation_decline',
            userId: currentUser.objectId,
            title: 'Invitation ignorée',
            message: currentUser.pseudo+' a ignorée votre invitation :('
          });
        } else {
          console.log('no able to push to user', user);
        }
      });
    });
  }

  function onInvitation(notification, data){
    if(notification.foreground){
      DialogPlugin.confirmMulti(data.message,data.title, ['Voir profil', 'Ignorer']).then(function(btnIndex){
        if(btnIndex === 1){ $state.go('tabs.user', {id: data.userId}); }
        else if(btnIndex === 2){}
      });
    } else {
      $state.go('tabs.user', {id: data.userId});
    }
  }

  return service;
})

.factory('NotificationSrv', function(RelationsSrv){
  'use strict';
  var service = {
    received: received
  };

  function received(notification){
    if(notification.payload.type === 'relation_invite'){ RelationsSrv.onInvitation(notification, notification.payload); }
    else if(notification.payload.type === 'relation_accept'){ RelationsSrv.onInvitation(notification, notification.payload); }
    else if(notification.payload.type === 'relation_decline'){ RelationsSrv.onInvitation(notification, notification.payload); }
    else { console.log('Notification received', notification); }
  }

  return service;
});
