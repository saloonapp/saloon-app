(function(){
  'use strict';
  angular.module('app')
    .directive('moodBox', moodBoxDirective);

  function moodBoxDirective(){
    var directive = {
      restrict: 'E',
      templateUrl: 'js/components/moodBox.html',
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
    }
  }

  function checkParams(scope){
    if(!scope.userData){ console.error('Directive "mood-box" need a "userData" argument !'); return false; }
    if(!scope.elt){ console.error('Directive "mood-box" need a "elt" argument ! (session or exponent)'); return false; }
    return true;
  }
})();
