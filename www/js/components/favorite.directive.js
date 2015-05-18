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
      if(!checkParams(scope)){ return; }
      var vm = {};
      scope.vm = vm;

      vm.elt = scope.elt;
      vm.favoriteLoading = false;

      vm.isFavorite = function(elt){ return EventUtils.isFavorite(scope.userData, elt); };
      vm.toggleFavorite = toggleFavorite;

      function toggleFavorite(elt){
        if(!vm.favoriteLoading){
          vm.favoriteLoading = true;
          EventSrv.toggleFavorite(scope.userData, elt).then(function(){
            vm.favoriteLoading = false;
          }, function(){
            vm.favoriteLoading = false;
          });
        }
      }
    }
  }

  function checkParams(scope){
    if(!scope.userData){ console.error('Directive "favorite" need a "userData" argument !'); return false; }
    if(!scope.elt){ console.error('Directive "favorite" need a "elt" argument ! (session or exponent)'); return false; }
    return true;
  }
})();
