(function(){
  'use strict';
  angular.module('app')
    .controller('EventCtrl', EventCtrl)
    .controller('EventInfosCtrl', EventInfosCtrl)
    .controller('EventSessionsCtrl', EventSessionsCtrl)
    .controller('EventSessionCtrl', EventSessionCtrl)
    .controller('EventExponentsCtrl', EventExponentsCtrl)
    .controller('EventExponentCtrl', EventExponentCtrl);

  function EventCtrl($scope, event, userData){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
    vm.userData = userData;
  }

  function EventInfosCtrl($scope, $stateParams, EventSrv, event){
    var vm = {};
    $scope.vm = vm;

    vm.loading = false;
    vm.event = event;
    vm.doRefresh = doRefresh;

    function doRefresh(){
      vm.loading = true;
      EventSrv.refreshEvent($stateParams.eventId).then(function(event){
        vm.event = event;
        vm.loading = false;
      }, function(err){
        vm.loading = false;
      });
    }
  }

  function EventSessionsCtrl($scope, EventUtils, event, userData){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;

    vm.isFav = isFav;

    function isFav(session){
      return EventUtils.isFavorite(userData, session);
    }
  }

  function EventSessionCtrl($scope, EventSrv, EventUtils, event, userData, session){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
    vm.session = session;
    vm.favLoading = false;
    vm.similar = [];
    vm.comments = EventUtils.getComments(userData, session);

    vm.isFav = isFav;
    vm.toggleFav = toggleFav;

    function isFav(session){
      return EventUtils.isFavorite(userData, session);
    }
    function toggleFav(session){
      if(!vm.favLoading){
        vm.favLoading = true;
        if(isFav(session)){
          EventSrv.unfavoriteSession(session).then(function(res){
            EventUtils.removeFavorite(userData, session);
            vm.favLoading = false;
          }, function(err){
            vm.favLoading = false;
          });
        } else {
          EventSrv.favoriteSession(session).then(function(favData){
            EventUtils.addFavorite(userData, favData);
            vm.favLoading = false;
          }, function(err){
            vm.favLoading = false;
          });
        }
      }
    }
  }

  function EventExponentsCtrl($scope, EventUtils, event, userData){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;

    vm.isFav = isFav;

    function isFav(exponent){
      return EventUtils.isFavorite(userData, exponent);
    }
  }

  function EventExponentCtrl($scope, EventSrv, EventUtils, event, userData, exponent){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
    vm.exponent = exponent;
    vm.favLoading = false;
    vm.similar = [];
    vm.comments = EventUtils.getComments(userData, exponent);

    vm.isFav = isFav;
    vm.toggleFav = toggleFav;

    function isFav(exponent){
      console.log('exponent', exponent);
      return EventUtils.isFavorite(userData, exponent);
    }
    function toggleFav(exponent){
      if(!vm.favLoading){
        vm.favLoading = true;
        if(isFav(exponent)){
          EventSrv.unfavoriteExponent(exponent).then(function(res){
            EventUtils.removeFavorite(userData, exponent);
            vm.favLoading = false;
          }, function(err){
            vm.favLoading = false;
          });
        } else {
          EventSrv.favoriteExponent(exponent).then(function(favData){
            EventUtils.addFavorite(userData, favData);
            vm.favLoading = false;
          }, function(err){
            vm.favLoading = false;
          });
        }
      }
    }
  }
})();
