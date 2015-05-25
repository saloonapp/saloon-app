(function(){
  'use strict';
  angular.module('app')
    .directive('mdCheckbox', mdCheckboxDirective);

  function mdCheckboxDirective(){
    var directive = {
      restrict: 'E',
      transclude: true,
      templateUrl: 'js/components/mdCheckbox.html',
      scope: {
      },
      link: link
    };
    return directive;

    function link(scope, element, attrs){
      
    }
  }
})();
