angular.module('app')

.controller('PollsCtrl', function($scope, PollSrv,UserSrv){
  'use strict';

  var fn = {};
  $scope.displayForm = false;
  $scope.fn = fn;
  $scope.choices = [
	  {
	  	id : 'choice1'
	  },
	  {
	  	id : 'choice2'
	  }
  ];
  $scope.selectedChoices = {};

  fn.initForm = function(){
  	$scope.displayForm = true;
  };

  fn.addChoice = function(){
  	var newIdChoice = $scope.choices.length + 1;
  	$scope.choices.push({
  		id : 'choice' + newIdChoice
  	});
  };

  fn.removeChoice = function(id){
  	$scope.choices = _.filter($scope.choices, function(elt){
  		return elt.id !== id;
  	});
  };

  fn.submitForm = function(poll){
  	poll.choices = $scope.choices;
  	console.log(poll);
  	UserSrv.getCurrent().then(function(user){
  		PollSrv.setPollsData(poll, user);
  	});

  };

  fn.getAroundPolls = function(){
  	PollSrv.getPollsAround().then(function(polls){

      _.map(polls, function(poll){
        poll.anwsers = PollSrv.getAnswers(poll.objectId);

      });
      $scope.polls = polls;
      console.log($scope.polls);
  	});
  };

  fn.submitChoice = function(poll, choices){
  	var selected = null;
  	if(poll.singleChoise === 1){
  		  selected = _.filter(choices, {selected:true});
  	}else{
  		selected = _.filter(choices, {selected:true});
  	}
    UserSrv.getCurrent().then(function(user){
     $scope.anwsers = PollSrv.saveAnswer(poll,selected,user);
    });
  };

  fn.getAroundPolls();


});
