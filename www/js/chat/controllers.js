angular.module('app')

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
});
