angular.module('app')

.controller('UsersCtrl', function($scope, TabSrv, UserSrv, UsersSrv){
  'use strict';
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  $scope.$on('$ionicView.enter', function(){
    if(!data.users){
      fn.refresh();
    }
  });

  fn.refresh = function(){
    UsersSrv.getNearUsers().then(function(users){
      TabSrv.badges.users = users.length;
      data.users = users;
      $scope.$broadcast('scroll.refreshComplete');
    });
    UserSrv.updatePosition();
    // screenshot data
    /*TabSrv.badges.users = 9;
    data.users = [
      {avatar: 'http://loic.knuchel.org/blog/wp-content/uploads/2013/10/loicknuchel.jpg', pseudo: 'Loïc Knuchel', actualPurpose: 'Discuter de startup, scala, angular et ionic.'},
      {avatar: 'https://media.licdn.com/media/p/3/005/051/360/2398350.jpg', pseudo: 'Samir Bouaked', actualPurpose: 'Apprenti developpeur chez Neocase Software, Inc.'},
      {avatar: 'https://media.licdn.com/media/p/6/005/064/324/04b3525.jpg', pseudo: 'Audrey Stroppa', actualPurpose: 'Fondatrice de Cookers & Prof de langues'},
      {avatar: 'http://matparisot.fr/content/images/2014/12/matparisot_square_min.jpg', pseudo: 'Mathieu Parisot', actualPurpose: 'Développeur Web, formateur et co-organisateur des Humantalks Paris'},
      {avatar: 'https://media.licdn.com/mpr/mpr/shrinknp_400_400/p/1/005/0b7/3a0/13ab331.jpg', pseudo: 'Hadil Filali', actualPurpose: 'Chasseur de jobs.  Belles opportunités dans des starups.'},
      {avatar: 'https://media.licdn.com/media/p/1/005/080/1d5/11e201b.jpg', pseudo: 'Jean-Loup Karst', actualPurpose: 'Lead Talent & Co-founder at breaz.io / techtalent.io'},
    ];
    $scope.$broadcast('scroll.refreshComplete');*/
  };

  $scope.$watch('user.active', function(value, oldValue){
    if(value !== undefined && oldValue !== undefined && value !== oldValue){
      if(value){
        fn.refresh();
      } else {
        TabSrv.badges.users = 0;
        delete data.users;
      }
    }
  });
})

.controller('UserCtrl', function($scope, $state, $stateParams, $timeout, $ionicScrollDelegate, UserSrv, UsersSrv, RelationsSrv, PrivateMessageSrv, RealtimeSrv, ToastPlugin){
  'use strict';
  var userId = $stateParams.id;
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  var channel = null;
  var channelName = null;
  data.currentUser = null;
  data.user = null;
  data.relation = null;
  data.messages = [];

  $scope.$on('$ionicView.enter', function(){
    UserSrv.getCurrent().then(function(currentUser){
      data.currentUser = currentUser;
      channelName = userId+'-'+currentUser.objectId;
      channel = RealtimeSrv.subscribe(channelName);
      RealtimeSrv.bind(channel, 'PrivateMessage', onMessage);
    });
    UsersSrv.get(userId).then(function(user){
      if(user){
        data.user = user;
        RelationsSrv.get(user).then(function(relation){
          data.relation = relation;
        });
        PrivateMessageSrv.getAll(user).then(function(messages){
          data.messages = messages;
          if($stateParams.section){ $timeout(function(){scrollTo($stateParams.section);}, 100); }
        });
      } else {
        $state.go('app.live.users');
      }
    });
  });

  $scope.$on('$ionicView.leave', function(){
    RealtimeSrv.unbind(channel, 'PrivateMessage', onMessage);
    RealtimeSrv.unsubscribe(channelName);
    channel = null;
    channelName = null;
  });


  fn.hasRelation = function(relation){ return relation !== null && !!relation; };
  fn.hasNoRelation = function(relation){ return relation !== null && !relation; };
  fn.isInitiator = function(relation, user){ return relation && relation.from && relation.from.objectId === user.objectId; };
  fn.isPending = function(relation){ return relation && relation.status === RelationsSrv.status.INVITED; };
  fn.isAccepted = function(relation){ return relation && relation.status === RelationsSrv.status.ACCEPTED; };
  fn.isDeclined = function(relation){ return relation && relation.status === RelationsSrv.status.DECLINED; };

  fn.invite = function(user){
    RelationsSrv.invite(user).then(function(relationCreated){
      data.relation = relationCreated;
      ToastPlugin.show('Invitation envoyée :)');
    });
  };
  fn.acceptInvite = function(relation){
    RelationsSrv.acceptInvite(relation).then(function(){
      data.relation.status = RelationsSrv.status.ACCEPTED;
      ToastPlugin.show('Invitation acceptée :)');
    });
  };
  fn.declineInvite = function(relation){
    RelationsSrv.declineInvite(relation).then(function(){
      data.relation.status = RelationsSrv.status.DECLINED;
      ToastPlugin.show('Invitation refusée :(');
    });
  };

  fn.sendMessage = function(){
    if(fn.isAccepted(data.relation) && data.message && data.message.length > 0){
      PrivateMessageSrv.sendTo(data.user, data.message).then(function(message){
        onMessage(message);
        data.message = '';
        scrollTo('chat');
      });
    }
  };


  function onMessage(message){
    $scope.safeApply(function(){
      data.messages.unshift(message);
    });
  }

  function scrollTo(className){
    var scroll = $ionicScrollDelegate.getScrollPosition();
    var elt = document.getElementsByClassName(className);
    if(elt && elt[0] && elt[0].offsetTop){
      $ionicScrollDelegate.scrollTo(scroll.left, elt[0].offsetTop, true);
    }
  }
});
