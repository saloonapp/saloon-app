angular.module('app')

.controller('ChatsCtrl', function($scope, $state, $ionicPopup, PublicMessageSrv, ToastPlugin, KeyboardPlugin){
  'use strict';
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.rooms = null;
  function loadRooms(){
    PublicMessageSrv.getNearMessages().then(function(roomMessages){
      data.rooms = roomMessages;
      $scope.$broadcast('scroll.refreshComplete');
    });
  }

  $scope.$on('$ionicView.enter', function(){
    console.log('view enter');
    loadRooms();
  });

  fn.refresh = function(){
    loadRooms();
  };

  fn.createRoom = function(){
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
    }).then(function(name){
      KeyboardPlugin.close();
      if(name){
        if(!data.rooms){ data.rooms = {}; }
        data.rooms[name] = [];
        $state.go('app.live.chat', {id: name});
      }
    });
  };
})

.controller('ChatCtrl', function($scope, $stateParams, UserSrv, PublicMessageSrv, RealtimeSrv){
  'use strict';
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;
  data.roomId = $stateParams.id;
  data.room = null;

  var channel = null;
  var channelName = null;

  $scope.$on('$ionicView.enter', function(){
    PublicMessageSrv.getNearMessagesByRoom(data.roomId).then(function(room){
      console.log('room', room);
      data.room = room;
    });
    UserSrv.getCurrent().then(function(currentUser){
      channelName = currentUser.objectId+'-'+data.roomId;
      channel = RealtimeSrv.subscribe(channelName);
      RealtimeSrv.bind(channel, 'PublicMessage', onMessage);
    });
  });
  $scope.$on('$ionicView.leave', function(){
    RealtimeSrv.unbind(channel, 'PublicMessage', onMessage);
    RealtimeSrv.unsubscribe(channelName);
    channel = null;
    channelName = null;
  });

  fn.refresh = function(){
    PublicMessageSrv.getNearMessagesByRoom(data.roomId, true).then(function(room){
      data.room = room;
      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  fn.sendMessage = function(){
    if(data.message && data.message.length > 0){
      PublicMessageSrv.sendTo(data.roomId, data.message).then(function(){
        data.message = '';
      });
    }
  };

  function onMessage(message){
    $scope.safeApply(function(){
      data.room.messages.unshift(message);
    });
  }
});
