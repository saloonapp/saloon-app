angular.module('app')

.controller('TabsCtrl', function($scope, $state, $ionicHistory, $ionicPopover, $ionicModal, TabSrv, UserSrv, ToastPlugin){
  'use strict';
  var loaded = false; // TODO : $ionicView.loaded is fired twice... :(
  $scope.$on('$ionicView.loaded', function(){
    if(!loaded){
      loaded = true;
      UserSrv.fetchCurrent().then(function(){
        UserSrv.updatePosition();
      }, function(err){
        ToastPlugin.show('Votre compte n\'existe pas en base :(');
        $scope.logout();
      });
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
      $ionicHistory.nextViewOptions({disableBack:true});
      $state.go('welcome');
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
    if(value !== undefined && oldValue !== undefined && value !== oldValue){
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
});

