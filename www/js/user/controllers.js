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
    UserSrv.getCurrent().then(function(user){
      if(user.active){
        UsersSrv.getNearUsers().then(function(users){
          TabSrv.badges.users = users.length;
          data.users = users;
          $scope.$broadcast('scroll.refreshComplete');
        });
        UserSrv.updatePosition();
      } else {
        $scope.$broadcast('scroll.refreshComplete');
      }
    });
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

.controller('ContactsCtrl', function($scope, RelationsSrv, UsersSrv){
  'use strict';
  var data = {};
  $scope.data = data;
  data.users = null;

  $scope.$on('$ionicView.enter', function(){
    RelationsSrv.getContactsIds().then(function(ids){
      return UsersSrv.getAll(ids);
    }).then(function(users){
      data.users = users;
    });
  });
})

.controller('UserCtrl', function($scope, $state, $stateParams, $ionicScrollDelegate, UserSrv, UsersSrv, RelationsSrv, ChatSrv, ToastPlugin){
  'use strict';
  var userId = $stateParams.id;
  var chatSetupTime = null;
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.user = null;
  data.relation = null;
  UserSrv.getCurrent().then(function(currentUser){
    data.currentUser = currentUser;
  });
  UsersSrv.get(userId).then(function(user){
    if(user){
      data.user = user;
      RelationsSrv.get(user).then(function(relation){
        data.relation = relation;
        setupChatIfNeeded(relation);
      });
    } else {
      $state.go('tabs.users');
    }
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
      setupChatIfNeeded(relationCreated);
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
    if(fn.isAccepted(data.relation) && data.chat && data.message && data.message.length > 0){
      ChatSrv.sendToRelationChat(data.chat, data.message).then(function(){
        data.message = '';
        scrollTo('chat');
      });
    }
  };

  function setupChatIfNeeded(relation){
    if(relation && relation.objectId && !data.chat){
      data.chat = ChatSrv.setupRelationChat(relation);
      data.chat.$watch(function onMessage(infos){
        if(infos.event === 'child_added'){
          var message = data.chat.$getRecord(infos.key);
          if(message && chatSetupTime !== null && message.time > chatSetupTime && message.user.objectId !== data.currentUser.objectId){
            ToastPlugin.showLongBottom('Nouveau message de '+message.user.pseudo+' : \n'+message.content);
          }
        }
      });
      chatSetupTime = Date.now();
    }
  }
  function scrollTo(className){
    var scroll = $ionicScrollDelegate.getScrollPosition();
    var elt = document.getElementsByClassName(className);
    if(elt && elt[0] && elt[0].offsetTop){
      $ionicScrollDelegate.scrollTo(scroll.left, elt[0].offsetTop, true);
    }
  }
});
