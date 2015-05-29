(function(){
  'use strict';
  angular.module('app')
    .directive('moodBar', moodBarDirective);

  function moodBarDirective($analytics, EventSrv, EventUtils){
    var directive = {
      restrict: 'E',
      replace: true,
      templateUrl: 'js/components/moodBar.html',
      scope: {
        userData: '=userData',
        elt: '=elt',
        click: '&'
      },
      link: link
    };
    return directive;

    function link(scope, element, attrs){
      if(!checkParams(scope)){ return; }
      var vm = {};
      scope.vm = vm;

      vm.elt = scope.elt;
      vm.moodSaving = false;

      vm.isMood = function(elt, mood){ return EventUtils.isMood(scope.userData, elt, mood); };
      vm.setMood = setMood;

      function setMood(elt, mood){
        if(!vm.moodSaving){
          vm.moodSaving = true;
          EventSrv.setMood(elt, mood).then(function(moodData){
            EventUtils.setMood(scope.userData, moodData);
            vm.moodSaving = false;
            scope.click({value: mood});
            $analytics.eventTrack('itemRated', {eventId: elt.eventId, itemType: elt.className, itemId: elt.uuid, itemName: elt.name, rating: mood});
          }, function(){
            vm.moodSaving = false;
          });
        }
      }
    }
  }

  function checkParams(scope){
    if(!scope.userData){ console.error('Directive "mood-bar" need a "userData" argument !'); return false; }
    if(!scope.elt){ console.error('Directive "mood-bar" need a "elt" argument ! (session or exponent)'); return false; }
    return true;
  }
})();
