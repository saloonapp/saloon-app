(function(){
  'use strict';
  angular.module('app')
    .directive('memoBox', memoBoxDirective);

  function memoBoxDirective($analytics, EventSrv, EventUtils, ToastPlugin){
    var directive = {
      restrict: 'E',
      templateUrl: 'js/components/memoBox.html',
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
      vm.memoSaving = false;
      vm.comments = EventUtils.getComments(scope.userData, vm.elt);
      vm.memo = vm.comments.length > 0 ? vm.comments[0] : undefined;
      vm.memoText = vm.memo ? vm.memo.action.text : '';

      vm.saveMemo = saveMemo;

      function saveMemo(){
        console.log('save memo');
        if(!vm.memo && vm.memoText && !vm.memoSaving){ // create
          console.log('create comment');
          vm.memoSaving = true;
          EventSrv.createComment(vm.elt, vm.memoText).then(function(memoData){
            EventUtils.addComment(scope.userData, memoData);
            vm.comments = EventUtils.getComments(scope.userData, vm.elt);
            vm.memo = vm.comments.length > 0 ? vm.comments[0] : undefined;
            vm.memoText = vm.memo ? vm.memo.action.text : '';
            vm.memoSaving = false;
            $analytics.eventTrack('itemCommented', {eventId: vm.elt.eventId, itemType: vm.elt.className, itemId: vm.elt.uuid, itemName: vm.elt.name});
            ToastPlugin.show('✓ Notes personnelles enregistrées !');
          }, function(){
            vm.memoSaving = false;
          });
        } else if(vm.memo && vm.memo.action && vm.memoText && vm.memo.action.text !== vm.memoText && !vm.memoSaving){ // update
          console.log('update comment');
          vm.memoSaving = true;
          EventSrv.editComment(vm.memo, vm.memoText).then(function(memoData){
            EventUtils.updateComment(scope.userData, memoData);
            vm.comments = EventUtils.getComments(scope.userData, vm.elt);
            vm.memo = vm.comments.length > 0 ? vm.comments[0] : undefined;
            vm.memoText = vm.memo ? vm.memo.action.text : '';
            vm.memoSaving = false;
            $analytics.eventTrack('itemCommented', {eventId: vm.elt.eventId, itemType: vm.elt.className, itemId: vm.elt.uuid, itemName: vm.elt.name});
            ToastPlugin.show('✓ Notes personnelles enregistrées !');
          }, function(){
            vm.memoSaving = false;
          });
        } else if(vm.memo && vm.memo.action && !vm.memoText && !vm.memoSaving){ // delete
          console.log('delete comment');
          vm.memoSaving = true;
          EventSrv.deleteComment(vm.memo).then(function(memoData){
            EventUtils.removeComment(scope.userData, memoData);
            vm.comments = EventUtils.getComments(scope.userData, vm.elt);
            vm.memo = vm.comments.length > 0 ? vm.comments[0] : undefined;
            vm.memoText = vm.memo ? vm.memo.action.text : '';
            vm.memoSaving = false;
            $analytics.eventTrack('itemUncommented', {eventId: vm.elt.eventId, itemType: vm.elt.className, itemId: vm.elt.uuid, itemName: vm.elt.name});
            ToastPlugin.show('✓ Notes personnelles enregistrées !');
          }, function(){
            vm.memoSaving = false;
          });
        }
      }
    }
  }

  function checkParams(scope){
    if(!scope.userData){ console.error('Directive "memo-box" need a "userData" argument !'); return false; }
    if(!scope.elt){ console.error('Directive "memo-box" need a "elt" argument ! (session or exponent)'); return false; }
    return true;
  }
})();
