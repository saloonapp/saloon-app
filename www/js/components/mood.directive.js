(function(){
  'use strict';
  angular.module('app')
    .directive('mood', moodDirective);

  function moodDirective(EventSrv, EventUtils){
    var directive = {
      restrict: 'A',
      templateUrl: 'js/components/mood.html',
      scope: {
        mood: '='
      },
      link: link
    };
    return directive;

    function link(scope, element, attrs){
    }
  }
})();
