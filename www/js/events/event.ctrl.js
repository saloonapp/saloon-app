(function(){
  'use strict';
  angular.module('app')
    .controller('EventCtrl', EventCtrl)
    .controller('EventInfosCtrl', EventInfosCtrl)
    .controller('EventSessionsCtrl', EventSessionsCtrl)
    .controller('EventSessionCtrl', EventSessionCtrl)
    .controller('EventExponentsCtrl', EventExponentsCtrl)
    .controller('EventExponentCtrl', EventExponentCtrl)
    .controller('EventScheduleCtrl', EventScheduleCtrl);

  function EventCtrl($scope, event, userData){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
  }

  function EventInfosCtrl($scope, $stateParams, EventSrv, event){
    var vm = {};
    $scope.vm = vm;

    vm.loading = false;
    vm.event = event;
    vm.doRefresh = doRefresh;

    function doRefresh(){
      vm.loading = true;
      EventSrv.refreshEvent($stateParams.eventId).then(function(event){
        vm.event = event;
        vm.loading = false;
      }, function(err){
        vm.loading = false;
      });
    }
  }

  function EventSessionsCtrl($scope, EventUtils, event, userData){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
    vm.isFav = function(elt){ return EventUtils.isFavorite(userData, elt); };
  }

  function EventSessionCtrl($scope, EventSrv, EventUtils, event, userData, session){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
    vm.elt = session;
    vm.favLoading = false;
    vm.newCommentSaving = false;
    vm.editCommentSaving = false;
    vm.commentEdited = undefined;
    vm.similar = [];

    vm.isFav = function(elt){ return EventUtils.isFavorite(userData, elt); };
    vm.getComments = function(elt){ return EventUtils.getComments(userData, elt); };
    vm.toggleFav = toggleFav;
    vm.createComment = createComment;
    vm.toggleEditComment = toggleEditComment;
    vm.updateComment = updateComment;
    vm.deleteComment = deleteComment;

    function toggleFav(elt){
      if(!vm.favLoading){
        vm.favLoading = true;
        EventSrv.toggleFavoriteSession(userData, elt).then(function(){
          vm.favLoading = false;
        }, function(){
          vm.favLoading = false;
        });
      }
    }
    function createComment(elt, newText){
      if(!vm.newCommentSaving && newText){
        vm.newCommentSaving = true;
        EventSrv.createCommentSession(elt, newText).then(function(commentData){
          EventUtils.addComment(userData, commentData);
          vm.newCommentSaving = false;
          vm.newText = '';
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
        EventSrv.editCommentSession(comment, editText).then(function(commentData){
          EventUtils.updateComment(userData, commentData);
          vm.editCommentSaving = false;
          vm.commentEdited = undefined;
          vm.editText = undefined;
        }, function(){
          vm.editCommentSaving = false;
        });
      }
    }
    function deleteComment(comment){
      if(!vm.editCommentSaving){
        vm.editCommentSaving = true;
        EventSrv.deleteCommentSession(comment).then(function(){
          EventUtils.removeComment(userData, comment);
          vm.editCommentSaving = false;
          vm.commentEdited = undefined;
          vm.editText = undefined;
        }, function(){
          vm.editCommentSaving = false;
        });
      }
    }
  }

  function EventExponentsCtrl($scope, EventUtils, event, userData){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
    vm.isFav = function(elt){ return EventUtils.isFavorite(userData, elt); };
  }

  function EventExponentCtrl($scope, EventSrv, EventUtils, event, userData, exponent){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
    vm.elt = exponent;
    vm.favLoading = false;
    vm.similar = [];
    vm.comments = EventUtils.getComments(userData, exponent);

    vm.isFav = function(elt){ return EventUtils.isFavorite(userData, elt); };
    vm.toggleFav = toggleFav;

    function toggleFav(elt){
      if(!vm.favLoading){
        vm.favLoading = true;
        EventSrv.toggleFavoriteExponent(userData, elt).then(function(){
          vm.favLoading = false;
        }, function(){
          vm.favLoading = false;
        });
      }
    }
  }

  function EventScheduleCtrl($scope, EventUtils, event, userData){
    var vm = {};
    $scope.vm = vm;

    vm.event = event;
    $scope.$on('$ionicView.enter', function(){
      vm.sessions = EventUtils.getFavoriteSessions(event, userData);
      vm.exponents = EventUtils.getFavoriteExponents(event, userData);
    });
  }
})();
