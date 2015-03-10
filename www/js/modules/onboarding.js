angular.module('app')

.factory('OnboardingSrv', function(LinkedinSrv, Utils){
  'use strict';
  var data = {};
  var service = {
    setProfile: setProfile,
    getProvider: getProvider,
    getSuggestedPseudo: getSuggestedPseudo,
    getSuggestedPurpose: getSuggestedPurpose,
    getEmail: getEmail,
    extendUserWithSocialProfile: extendUserWithSocialProfile,
    getSuggestedInterests: getSuggestedInterests,
    isValidPassword: isValidPassword
  };

  function setProfile(provider, profile){
    data.provider = provider;
    data.profile = profile;
  }

  function getProvider(){
    return data.provider;
  }

  function getSuggestedPseudo(){
    if(data.profile){
      if(data.provider === 'email')               { return data.profile.email.split('@')[0];                 }
      if(data.provider === LinkedinSrv.provider)  { return data.profile.firstName+' '+data.profile.lastName; }
    }
    return 'Anonymous '+Utils.randInt(1, 1000);
  }

  function getSuggestedPurpose(){
    if(data.profile){
      if(data.provider === LinkedinSrv.provider){ return data.profile.headline; }
    }
    return '';
  }

  function getEmail(){
    if(data.profile){
      if(data.provider === 'email')     { return data.profile.email;        }
      if(data.provider === 'linkedin')  { return data.profile.emailAddress; }
    }
    return '';
  }

  function extendUserWithSocialProfile(user){
    if(data.provider === 'linkedin'){
      user.authData = {anonymous: {id: Utils.createUuid()}};
      if(data.profile){
        user[data.provider] = _formatLinkedinProfile(data.profile);
        user.avatar = user[data.provider].avatar;
      }
    }
  }

  function getSuggestedInterests(){
    return angular.copy([
      {name: 'Opportunités professionnelles', interested: false},
      {name: 'Nouveaux produits', interested: false},
      {name: 'Networker', interested: false}
    ]);
  }

  function isValidPassword(password){
    return password && password.length >= 6;
  }

  function _formatLinkedinProfile(profile){
    var res = {};
    if(profile.id)                                { res.id = profile.id;                            }
    if(profile.firstName)                         { res.firstName = profile.firstName;              }
    if(profile.lastName)                          { res.lastName = profile.lastName;                }
    if(profile.emailAddress)                      { res.email = profile.emailAddress;               }
    if(profile.pictureUrl)                        { res.avatar = profile.pictureUrl;                }
    if(profile.headline)                          { res.headline = profile.headline;                }
    if(profile.summary)                           { res.summary = profile.summary;                  }
    if(profile.location && profile.location.name) { res.location = profile.location.name;           }
    if(profile.numConnections)                    { res.connectionsCount = profile.numConnections;  }
    if(profile.publicProfileUrl)                  { res.publicUrl = profile.publicProfileUrl;       }
    if(profile._updated)                          { res._updated = profile._updated;                }
    if(profile.positions){
      res.currentPositions = [];
      for(var i in profile.positions){
        var position = profile.positions[i];
        if(position.isCurrent){
          var pos = {};
          if(position.id)         { pos.id = position.id;                                                                       }
          if(position.title)      { pos.title = position.title;                                                                 }
          if(position.summary)    { pos.summary = position.summary;                                                             }
          if(position.startDate)  { pos.started = new Date(position.startDate.year, position.startDate.month - 1, 1).getTime(); }
          // TODO : format linkedin company object...
          if(position.company)    { pos.company = position.company;                                                             }
          res.currentPositions.push(pos);
        }
      }
    }
    return res;
  }

  return service;
})

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
          $state.go('tabs.users');
          data.loading = false;
          data.error = null;
        }, function(err){
          OnboardingSrv.setProfile(LinkedinSrv.provider, profile);
          $state.go('login_createaccountwithprofile');
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
      $ionicHistory.nextViewOptions({disableBack:true});
      $state.go('tabs.users');
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
      $state.go('tabs.users');
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
        $ionicHistory.nextViewOptions({disableBack:true});
        $state.go('tabs.users');
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
