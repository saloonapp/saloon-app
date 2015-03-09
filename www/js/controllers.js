angular.module('app')

.controller('TabsCtrl', function($scope, $state, $ionicPopover, $ionicModal, TabSrv, UserSrv, ToastPlugin){
  'use strict';
  var loaded = false; // TODO : $ionicView.loaded is fired twice... :(
  $scope.$on('$ionicView.loaded', function(){
    if(!loaded){
      loaded = true;
      UserSrv.updatePosition();
    }
  });
  $scope.$on('$ionicView.enter', function(){
    UserSrv.getCurrent().then(function(user){
      $scope.user = user;
    });
  });
  $scope.$on('$ionicView.leave', function(){
    delete $scope.user;
  });

  $scope.badges = TabSrv.badges;

  $ionicPopover.fromTemplateUrl('views/partials/menu-popover.html', {
    scope: $scope
  }).then(function(popover){
    $scope.menuPopover = popover;
  });
  $ionicModal.fromTemplateUrl('views/partials/profile-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.profileModal = modal;
  });

  $scope.logout = function(){
    UserSrv.logout().then(function(){
      $state.go('login_welcome');
    });
  };

  var welcomeSentences = [
    'If you want to achieve greatness stop asking for permission',
    'Mistakes are proof that you are trying',
    'Always be positive !',
    'Stay focused and never give up',
    'Sometimes you win, sometimes you learn'
  ];
  $scope.$watch('user.active', function(value, oldValue){
    if(value !== oldValue && oldValue !== undefined){
      UserSrv.updateStatus(value);
      if(value){
        ToastPlugin.show(welcomeSentences[Math.floor(Math.random()*welcomeSentences.length)]);
      } else {
        ToastPlugin.show('A bientôt :)');
      }
    }
  });

  $scope.$on('$destroy', function(){
    if($scope.menuPopover)  { $scope.menuPopover.remove();  }
    if($scope.profileModal) { $scope.profileModal.remove(); }
  });
})

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
  };

  $scope.$watch('user.active', function(value, oldValue){
    if(value !== oldValue && oldValue !== undefined){
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
})

.controller('ChatsCtrl', function($scope, $state, $ionicPopup, ChatSrv, ToastPlugin, KeyboardPlugin){
  'use strict';
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.rooms = null;
  function loadRooms(){
    ChatSrv.getPublicRooms().then(function(rooms){
      if(!data.rooms){ data.rooms = []; }
      for(var i in rooms){
        if(_.find(data.rooms, {id: rooms[i].id}) === undefined){
          data.rooms.push(rooms[i]);
        }
      }
      $scope.$broadcast('scroll.refreshComplete');
    });
  }
  loadRooms();

  fn.refresh = function(){
    loadRooms();
  };

  fn.createRoom = function(){
    KeyboardPlugin.onNextShow(function(e){
      var popupScope = $scope.$new(true);
      popupScope.data = {};
      $ionicPopup.show({
        template: '<input type="text" ng-model="data.newRoomName" autofocus>',
        title: 'Nom de votre room :',
        scope: popupScope,
        buttons: [
          { text: 'Annuler' },
          {
            text: '<b>Créer</b>',
            type: 'button-positive',
            onTap: function(e){
              if(!popupScope.data.newRoomName){
                e.preventDefault();
                ToastPlugin.showShortCenter('Vous devez donner un nom à votre room');
              } else {
                return popupScope.data.newRoomName;
              }
            }
          },
        ]
      }).then(function(name) {
        KeyboardPlugin.close();
        if(name){
          if(!data.rooms){ data.rooms = []; }
          data.rooms.unshift({id: name});
          $state.go('tabs.chat', {id: name});
        }
      });
    });
    KeyboardPlugin.show();
  };
})

.controller('ChatCtrl', function($scope, $stateParams, ChatSrv){
  'use strict';
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;
  data.chatId = $stateParams.id;

  $scope.$on('$ionicView.enter', function(){
    data.chat = ChatSrv.setupPublicChat(data.chatId);
  });
  $scope.$on('$ionicView.leave', function(){
    ChatSrv.destroy(data.chat);
  });

  fn.sendMessage = function(){
    if(data.chat && data.message && data.message.length > 0){
      ChatSrv.sendToPublicChat(data.chat, data.message).then(function(){
        data.message = '';
      });
    }
  };
})

.controller('PollsCtrl', function($scope){
  'use strict';
})

.controller('IssuesCtrl', function($scope){
  'use strict';
});

