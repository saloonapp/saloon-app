angular.module('app')
.factory('PollSrv', function(ParseUtils, UserSrv, $firebaseArray, Config){


	var pollCrud = ParseUtils.createCrud('Polls');
  var url = Config.firebase.url +'/polls';
    var ref = new Firebase(url);

	function setPollsData(poll, user){
      return pollCrud.save({
        question: poll.question,
        singleChoise : poll.singleanswer,
        choices : poll.choices,
        location : user.location,
        user: ParseUtils.toPointer('_User', user)
      });
    }

    function getPollsAround(){
      var matchDistance = 0.1; // 100m
      var matchMaxAge = 60 * 60 * 1000; // 1h
      return UserSrv.getCurrent().then(function(user){
    	  return pollCrud.find({
	          updatedAt: {
              $gt: ParseUtils.toDate(Date.now() - matchMaxAge)
            },
	          location: {
	            $nearSphere: ParseUtils.toGeoPoint(user.location.latitude, user.location.longitude),
	            $maxDistanceInKilometers: matchDistance
	          }
	        }).then(function(polls){
	          return polls;
	        });
    	})
    }

    function initFirebase(){

    }
    function getAnswers(pollid){
      var dataPoll;
      var answersPath = getAnswersPath(pollid);

      dataPoll = $firebaseArray(answersPath);
      return dataPoll;
    }

    function saveAnswer(poll, choices, user){

      var answers = $firebaseArray(getAnswersPath(poll.objectId));
      var statsPath = getStatsPath(poll.objectId);
      var answersStats = $firebaseArray(statsPath);

      //dataPoll['nbVotes'][choice[0].id] = dataPoll['nbVotes'][choice[0].id]++;
      //dataPoll.$save('nbVotes');
      _.map(choices, function(choice){
        answers.$add({
          choice : choice.id,
          user : user.objectId
        });
        //var id = choice.id;

        var statsChoice = statsPath.child(choice.id);
        statsChoice.transaction(function(current_val){
          if(!current_val){
            current_val = 0;
          }
          current_val++;
          return current_val;
        });
      });

      return {
        answers : answers,
        answersStats: answersStats
      };
    }

/*
maybe use some or every. The use of break can be good for a performance point of view...
 */
    function hasUserAlreadyVoted(answers, user){
      var isFound = false;
      _.map(answers, function(answer){
        if(answer.user == user.objectId){
          isFound = true;
        }
      });
      return isFound;
    }

    function getRootPath(pollid){
      return ref.child(pollid);
    }

    function getAnswersPath(pollid){
      return getRootPath(pollid).child('answers');
    }

    function getStatsPath(pollid){
      return getRootPath(pollid).child('stats');
    }

  return {
  	setPollsData : setPollsData,
  	getPollsAround : getPollsAround,
    saveAnswer : saveAnswer,
    getAnswers : getAnswers,
    hasUserAlreadyVoted : hasUserAlreadyVoted
  };


});
