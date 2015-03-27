angular.module('app')

.controller('LoadingCtrl', function($scope, $state, $ionicHistory, AuthSrv, OnboardingSrv, GeolocationPlugin, DialogPlugin, WebIntentPlugin){
  'use strict';
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.retry = false;

  fn.init = function(){
    data.retry = false;
    GeolocationPlugin.getCurrentPosition().then(function(pos){
      $ionicHistory.nextViewOptions({
        disableAnimate: true,
        disableBack: true,
        historyRoot: true
      });

      var onboardingProvider = OnboardingSrv.getProvider();
      if(onboardingProvider === 'email'){
        $state.go('fillprofile');
      } else if(onboardingProvider){
        $state.go('createaccountwithprofile');
      } else if(AuthSrv.isLogged()){
        $state.go('app.live.users');
      } else {
        $state.go('welcome');
      }
    }, function(err){
      data.retry = true;
      DialogPlugin.confirm('Impossible d\'accéder à votre géolocalisation. Merci d\'activer le gps').then(function(res){
        if(res){
          WebIntentPlugin.startActivity({
            action: WebIntentPlugin.android.Settings.ACTION_LOCATION_SOURCE_SETTINGS
          });
        }
      });
    });
  };

  fn.init();
})

.controller('SidemenuCtrl', function($scope, $state, $ionicHistory, $ionicPopover, $ionicModal, UserSrv, ToastPlugin){
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

  $ionicPopover.fromTemplateUrl('views/partials/menu-popover.html', {
    scope: $scope
  }).then(function(popover){
    $scope.menuPopover = popover;
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
  });
})

.controller('TabsCtrl', function($scope, TabSrv){
  'use strict';
  $scope.badges = TabSrv.badges;
});

