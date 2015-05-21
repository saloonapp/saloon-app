(function(){
  'use strict';
  angular.module('app')
    .directive('favorite', favoriteDirective);

  function favoriteDirective(EventSrv, EventUtils){
    var directive = {
      restrict: 'E',
      templateUrl: 'js/components/favorite.html',
      scope: {
        userData: '=userData',
        elt: '=elt'
      },
      link: link
    };
    return directive;

    function link(scope, element, attrs){
      if(!checkParams(attrs)){ return; }
      var vm = {};
      scope.vm = vm;

      vm.favoriteLoading = false;

      vm.isFavorite = function(elt){ return EventUtils.isFavorite(scope.userData, elt); };
      vm.favorite = favorite;
      vm.unfavorite = unfavorite;

      function favorite(elt){
        if(!vm.favoriteLoading){
          vm.favoriteLoading = true;
          return EventSrv.favorite(elt).then(function(data){
            EventUtils.setFavorite(scope.userData, data);
            vm.favoriteLoading = false;
          }, function(){
            vm.favoriteLoading = false;
          });
        }
      }

      function unfavorite(elt){
        if(!vm.favoriteLoading){
          vm.favoriteLoading = true;
          return EventSrv.unfavorite(elt).then(function(data){
            EventUtils.setUnfavorite(scope.userData, data);
            vm.favoriteLoading = false;
          }, function(){
            vm.favoriteLoading = false;
          });
        }
      }
    }
  }

  function checkParams(attrs){
    if(!attrs.userData){ console.error('Directive "favorite" need a "userData" argument !'); return false; }
    if(!attrs.elt){ console.error('Directive "favorite" need a "elt" argument ! (session or exponent)'); return false; }
    return true;
  }
})();
