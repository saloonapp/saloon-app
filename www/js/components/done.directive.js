(function(){
  'use strict';
  angular.module('app')
    .directive('done', doneDirective);

  function doneDirective($analytics, EventSrv, EventUtils){
    var directive = {
      restrict: 'E',
      templateUrl: 'js/components/done.html',
      scope: {
        userData: '=',
        elt: '=',
        click: '&'
      },
      link: link
    };
    return directive;

    function link(scope, element, attrs){
      if(!checkParams(attrs)){ return; }
      var vm = {};
      scope.vm = vm;

      vm.loading = false;

      vm.isSet = function(elt){ return EventUtils.isDone(scope.userData, elt); };
      vm.set = set;
      vm.unset = unset;

      function set(elt){
        if(!vm.loading){
          vm.loading = true;
          return EventSrv.done(elt).then(function(data){
            vm.loading = false;
            EventUtils.setDone(scope.userData, data);
            scope.click({value: true});
            $analytics.eventTrack('itemDone', {eventId: elt.eventId, itemType: elt.className, itemId: elt.uuid, itemName: elt.name});
          }, function(){
            vm.loading = false;
          });
        }
      }

      function unset(elt){
        if(!vm.loading){
          vm.loading = true;
          return EventSrv.undone(elt).then(function(data){
            vm.loading = false;
            EventUtils.setUndone(scope.userData, data);
            scope.click({value: false});
            $analytics.eventTrack('itemUndone', {eventId: elt.eventId, itemType: elt.className, itemId: elt.uuid, itemName: elt.name});
          }, function(){
            vm.loading = false;
          });
        }
      }
    }
  }

  function checkParams(attrs){
    if(!attrs.userData){ console.error('Directive "done" need a "userData" argument !'); return false; }
    if(!attrs.elt){ console.error('Directive "done" need a "elt" argument ! (session or exponent)'); return false; }
    return true;
  }
})();
