angular.module('app')

.controller('PollsCtrl', function($scope, PollSrv,UserSrv){
  'use strict';

  var fn = {};
  $scope.displayForm = false;
  $scope.fn = fn;
  $scope.polls = [];

  $scope.choices = [
	  {
	  	id : 'choice1'
	  },
	  {
	  	id : 'choice2'
	  }
  ];

    fn.init = function(){
      UserSrv.getCurrent().then(function(user){
        $scope.user = user;
        fn.getAroundPolls();
      });
    };

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
  	UserSrv.getCurrent().then(function(user){
  		PollSrv.setPollsData(poll, user);
  	});

  };

  fn.getAroundPolls = function(){
  	PollSrv.getPollsAround().then(function(polls){


          $scope.polls = PollSrv.structurePolls(polls);
          console.log($scope.polls);
    });

  };


  fn.submitChoice = function(poll, choices){
  	var selected = null;
  	if(poll.poll.singleChoise === true){
  		  selected = _.filter(choices, {selected : "selected"});
  	}else{
  		selected = _.filter(choices, {selected:true});
  	}
    UserSrv.getCurrent().then(function(user){

      var dataPoll = PollSrv.saveAnswer(poll,selected,user);
      console.log(dataPoll);
      $scope.polls[_.findIndex($scope.polls, {'pollid' : poll.objectId})] = dataPoll;
    });
  };

 fn.init();


});
