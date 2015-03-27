angular.module('app')

.controller('WelcomeCtrl', function($scope, $state, $ionicHistory, UserSrv, LinkedinSrv, OnboardingSrv){
  'use strict';
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.loading = false;
  data.error = null;

  fn.loginLinkedin = function(){
    data.loading = true;
    data.error = null;
    try {
      LinkedinSrv.login().then(function(profile){
        $ionicHistory.nextViewOptions({disableBack:true});
        UserSrv.loginOAuth(LinkedinSrv.provider, profile).then(function(){
          $state.go('app.live.users');
          data.loading = false;
          data.error = null;
        }, function(err){
          OnboardingSrv.setProfile(LinkedinSrv.provider, profile);
          $state.go('createaccountwithprofile');
          data.loading = false;
          data.error = null;
        });
      }, function(err){
        data.loading = false;
        data.error = err.message ? err.message : err;
      });
    } catch(err) {
      data.loading = false;
      data.error = err.message ? err.message : err;
      throw err;
    }
  };
})

.controller('CreateAccountWithProfileCtrl', function($scope, $state, $ionicHistory, $ionicPlatform, ToastPlugin, OnboardingSrv, UserSrv){
  'use strict';
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.credentials = {
    email: OnboardingSrv.getEmail(),
    password: '',
    pseudo: OnboardingSrv.getSuggestedPseudo(),
    actualPurpose: OnboardingSrv.getSuggestedPurpose(),
    interests: OnboardingSrv.getSuggestedInterests()
  };
  data.loading = false;
  data.error = null;

  fn.createAccount = function(credentials){
    data.loading = true;
    data.error = null;
    var user = angular.copy(credentials);
    OnboardingSrv.extendUserWithSocialProfile(user);
    user.interests = [];
    for(var i in credentials.interests){
      if(credentials.interests[i].interested){
        user.interests.push({name: credentials.interests[i].name});
      }
    }
    UserSrv.register(user, OnboardingSrv.getProvider()).then(function(user){
      OnboardingSrv.clearOnboarding();
      $ionicHistory.nextViewOptions({disableBack:true});
      $state.go('app.live.users');
      data.credentials.password = '';
      data.loading = false;
      data.error = null;
    }, function(err){
      data.loading = false;
      data.error = err.message ? err.message : err;
    });
  };

  fn.canSubmit = function(){
    return data.credentials.email && OnboardingSrv.isValidPassword(data.credentials.password) && data.loading === false;
  };

  var cancelBackButtonAction = null;
  $scope.$on('$ionicView.enter', function(){
    if(cancelBackButtonAction){ cancelBackButtonAction(); }
    cancelBackButtonAction = $ionicPlatform.registerBackButtonAction(function(event){
      ToastPlugin.show('Un dernier effort pour valider ton profil...');
    }, 100);
  });
  $scope.$on('$ionicView.leave', function(){
    if(cancelBackButtonAction){ cancelBackButtonAction(); }
    cancelBackButtonAction = null;
  });
})

.controller('RegisterCtrl', function($scope, $state, $ionicHistory, OnboardingSrv, UserSrv){
  'use strict';
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.credentials = {};
  data.loading = false;
  data.error = null;

  fn.register = function(credentials){
    data.loading = true;
    data.error = null;
    UserSrv.register(credentials).then(function(profile){
      OnboardingSrv.setProfile('email', profile);
      $ionicHistory.nextViewOptions({disableBack:true});
      $state.go('fillprofile');
      data.credentials.password = '';
      data.loading = false;
      data.error = null;
    }, function(err){
      data.credentials.password = '';
      data.loading = false;
      data.error = err.message ? err.message : err;
    });
  };

  fn.canSubmit = function(){
    return data.credentials.email && OnboardingSrv.isValidPassword(data.credentials.password) && data.loading === false;
  };
})

.controller('SigninCtrl', function($scope, $state, $ionicHistory, UserSrv, OnboardingSrv, ToastPlugin){
  'use strict';
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.credentials = {};
  data.loading = false;
  data.error = null;

  fn.login = function(credentials){
    data.loading = true;
    data.error = null;
    UserSrv.login(credentials).then(function(){
      $ionicHistory.nextViewOptions({disableBack:true});
      $state.go('app.live.users');
      data.credentials.password = '';
      data.loading = false;
      data.error = null;
    }, function(err){
      data.credentials.password = '';
      data.loading = false;
      data.error = err.message ? err.message : err;
    });
  };

  fn.passwordRecover = function(credentials){
    ToastPlugin.showLongBottom('Et voilà ! Plus qu\'a suivre les instructions dans le mail !');
    UserSrv.passwordRecover(credentials).then(null, function(err){
      ToastPlugin.show('Oups ! '+(err.message ? err.message : err));
    });
  };

  fn.canSubmit = function(){
    return data.credentials.email && OnboardingSrv.isValidPassword(data.credentials.password) && data.loading === false;
  };
})

.controller('FillProfileCtrl', function($scope, $state, $ionicHistory, $ionicPlatform, ToastPlugin, OnboardingSrv, UserSrv){
  'use strict';
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.credentials = {
    pseudo: OnboardingSrv.getSuggestedPseudo(),
    actualPurpose: OnboardingSrv.getSuggestedPurpose(),
    interests: OnboardingSrv.getSuggestedInterests()
  };
  data.loading = false;
  data.error = null;

  fn.extendAccount = function(credentials){
    data.loading = true;
    data.error = null;
    UserSrv.getCurrent().then(function(user){
      user.pseudo = credentials.pseudo;
      user.actualPurpose = credentials.actualPurpose;
      user.interests = [];
      for(var i in credentials.interests){
        if(credentials.interests[i].interested){
          user.interests.push({name: credentials.interests[i].name});
        }
      }
      UserSrv.setCurrent(user).then(function(){
        OnboardingSrv.clearOnboarding();
        $ionicHistory.nextViewOptions({disableBack:true});
        $state.go('app.live.users');
        data.loading = false;
        data.error = null;
      }, function(err){
        data.loading = false;
        data.error = err;
      });
    }, function(err){
      data.loading = false;
      data.error = err;
    });
  };

  fn.canSubmit = function(){
    return data.credentials.pseudo && data.loading === false;
  };

  var cancelBackButtonAction = null;
  $scope.$on('$ionicView.enter', function(){
    if(cancelBackButtonAction){ cancelBackButtonAction(); }
    cancelBackButtonAction = $ionicPlatform.registerBackButtonAction(function(event){
      ToastPlugin.show('Un dernier effort pour valider ton profil...');
    }, 100);
  });
  $scope.$on('$ionicView.leave', function(){
    if(cancelBackButtonAction){ cancelBackButtonAction(); }
    cancelBackButtonAction = null;
  });
});
