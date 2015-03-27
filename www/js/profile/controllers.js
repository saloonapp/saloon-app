angular.module('app')

.controller('ProfileCtrl', function($scope, UserSrv){
  'use strict';
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  $scope.$on('$ionicView.enter', function(){
    UserSrv.getCurrent().then(function(user){
      data.user = user;
    });
  });
})

.controller('ProfileEditCtrl', function($scope, $state, $ionicPopup, UserSrv, OnboardingSrv){
  'use strict';
  var data = {}, fn = {};
  $scope.data = data;
  $scope.fn = fn;

  data.loading = false;
  data.error = null;

  $scope.$on('$ionicView.enter', function(){
    data.loading = false;
    data.error = null;
    UserSrv.getCurrent().then(function(user){
      data.user = user;
      data.initProfile = toProfile(user);
      data.profile = angular.copy(data.initProfile);
    });
  });

  fn.addInterest = function(){
    var popupScope = $scope.$new(true);
    popupScope.data = {};
    $ionicPopup.show({
      template: '<input type="text" ng-model="data.interestName" autofocus>',
      title: 'De quoi veux-tu discuter ?',
      scope: popupScope,
      buttons: [
        { text: 'Annuler' },
        {
          text: '<b>Valider</b>',
          type: 'button-positive',
          onTap: function(e){
            return popupScope.data.interestName;
          }
        },
      ]
    }).then(function(name){
      if(name){
        data.profile.interests.push({name: name, interested: true});
      }
    });
  };
  fn.updateProfile = function(profile){
    data.loading = true;
    data.error = null;
    fromProfile(data.user, profile);
    UserSrv.setCurrent(data.user).then(function(){
      $state.go('app.profile');
      data.loading = false;
      data.error = null;
    }, function(err){
      data.loading = false;
      data.error = err;
    });
  };
  fn.canSubmit = function(){
    return !angular.equals(data.initProfile, data.profile);
  };

  function toProfile(user){
    var profile = {};
    profile.pseudo = user.pseudo;
    profile.actualPurpose = user.actualPurpose;
    profile.interests = OnboardingSrv.getSuggestedInterests();
    for(var i in user.interests){
      var found = _.find(profile.interests, {name: user.interests[i].name});
      if(found){
        found.interested = true;
      } else {
        profile.interests.push({name: user.interests[i].name, interested: true});
      }
    }
    return profile;
  }
  function fromProfile(user, profile){
    user.pseudo = profile.pseudo;
    user.actualPurpose = profile.actualPurpose;
    user.interests = [];
    for(var i in profile.interests){
      if(profile.interests[i].interested){
        user.interests.push({name: profile.interests[i].name});
      }
    }
  }
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
});
