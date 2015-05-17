(function(){
  'use strict';
  angular.module('app')
    .directive('favorite', favorite);

  function favorite(EventSrv, EventUtils){
    var directive = {
      restrict: 'E',
      templateUrl: 'js/components/favorite.html',
      scope: {
        userData: '=userData',
        elt: '=elt',
        eltType: '@eltType'
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
          EventSrv.toggleFavorite(scope.userData, elt, getType(scope.eltType)).then(function(){
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
    if(!scope.eltType){ console.error('Directive "favorite" need a "eltType" argument ! (session or exponent)'); return false; }
    if(!getType(scope.eltType)){ console.error('Attribute "eltType" of directive "favorite" should be in : session, sessions, exponent, exponents !!!'); return false; }
    return true;
  }

  function getType(eltType){
    if(eltType === 'session' || eltType === 'sessions'){ return 'sessions'; }
    else if(eltType === 'exponent' || eltType === 'exponents'){ return 'exponents'; }
  }
})();
