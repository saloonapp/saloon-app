(function(){
  'use strict';
  angular.module('app')
    .directive('memoBox', memoBoxDirective);

  function memoBoxDirective($analytics, EventSrv, EventUtils){
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
      vm.newCommentSaving = false;
      vm.editCommentSaving = false;
      vm.commentEdited = undefined;

      vm.getComments = function(elt){ return EventUtils.getComments(scope.userData, elt); };
      vm.createComment = createComment;
      vm.toggleEditComment = toggleEditComment;
      vm.updateComment = updateComment;
      vm.deleteComment = deleteComment;

      function createComment(elt, newText){
        if(!vm.newCommentSaving && newText){
          vm.newCommentSaving = true;
          EventSrv.createComment(elt, newText).then(function(commentData){
            EventUtils.addComment(scope.userData, commentData);
            vm.newCommentSaving = false;
            vm.newText = '';
            $analytics.eventTrack('itemCommented', {eventId: elt.eventId, itemType: elt.className, itemId: elt.uuid, itemName: elt.name});
          }, function(){
            vm.newCommentSaving = false;
          });
        }
      }
      function toggleEditComment(comment){
        if(vm.commentEdited === comment){
          vm.commentEdited = undefined;
          vm.editText = undefined;
        } else {
          vm.commentEdited = comment;
          vm.editText = comment.action.text;
        }
      }
      function updateComment(comment, editText){
        if(!vm.editCommentSaving && editText && editText !== comment.action.text){
          vm.editCommentSaving = true;
          EventSrv.editComment(comment, editText).then(function(commentData){
            EventUtils.updateComment(scope.userData, commentData);
            vm.editCommentSaving = false;
            vm.commentEdited = undefined;
            vm.editText = undefined;
            $analytics.eventTrack('itemCommented', {eventId: elt.eventId, itemType: elt.className, itemId: elt.uuid, itemName: elt.name});
          }, function(){
            vm.editCommentSaving = false;
          });
        }
      }
      function deleteComment(comment){
        if(!vm.editCommentSaving){
          vm.editCommentSaving = true;
          EventSrv.deleteComment(comment).then(function(commentData){
            EventUtils.removeComment(scope.userData, commentData);
            vm.editCommentSaving = false;
            vm.commentEdited = undefined;
            vm.editText = undefined;
            $analytics.eventTrack('itemUncommented', {eventId: elt.eventId, itemType: elt.className, itemId: elt.uuid, itemName: elt.name});
          }, function(){
            vm.editCommentSaving = false;
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
