angular.module('app')
.factory('PollSrv', function(ParseUtils, UserSrv, $firebaseArray, Config, $q){


	var pollCrud = ParseUtils.createCrud('Polls');
  var url = Config.firebase.url +'/polls';
  var ref = new Firebase(url);

    /*
    Create poll & return the Poll with firebase link for answers & stats
    */
	function setPollsData(poll, user){
    var deferred = $q.defer();
    return pollCrud.save({
        question: poll.question,
        singleChoise : poll.singleChoise,
        choices : poll.choices,
        location : user.location,
        user: ParseUtils.toPointer('_User', user)
      }).then(function(poll){
        var answersPath = getAnswersPath(poll.objectId);
        var statsPath = getStatsPath(poll.objectId);
        var answersStats;
        $firebaseArray(answersPath).$loaded().then(function(result){
          answers = result;
          $firebaseArray(statsPath).$loaded().then(function(stats){
            answersStats = stats;
            var toReturn = angular.extend({
              answers : answers,
              answersStats: answersStats,
              pollid : poll.objectId
            }, poll);
            deferred.resolve(toReturn);
          });
        });
        return deferred.promise;
      });
    }
  /*
  Return Polls without firebase reference
   */
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
/*
Return Answers & Stats (firebase ref) for an array of polls
 */
    function getAnwsersForPolls(polls){
      var deferred = $q.defer();
      var promises = [];
      var pollsToReturn = [];

      _.map(polls, function(poll){
        //Maybe we need a Poll Model in order to be sure to have the right informations every time
        //and to have a cleaner code?
        promises.push(getAnswers(poll).then(function(result){
          pollsToReturn.push(angular.extend(poll,result));
        }));
      });
      //Wait for it... for then!
      $q.all(promises).then(function(){
        deferred.resolve(pollsToReturn);
      });
      return deferred.promise;
    }

    function getAnswers(poll){
      var answers;
      var answersPath = getAnswersPath(poll.objectId);
      var statsPath = getStatsPath(poll.objectId);
      var defer = $q.defer();

      var answersStats = null;
      $firebaseArray(answersPath).$loaded().then(function(result){
        answers = result;
        $firebaseArray(statsPath).$loaded().then(function(stats){
          answersStats = stats;
          var toReturn = angular.extend({
            answers : answers,
            answersStats: answersStats,
            pollid : poll.objectId
          }, poll);
          defer.resolve(toReturn);
        });
      });
      return defer.promise;
    }



    /*
    Save an answer for a poll
     */
    function saveAnswer(poll, choices, user){

      var statsPath = getStatsPath(poll.objectId);
      var deferred = $q.defer();
      _.map(choices, function(choice){
        poll.answers.$add({
          choice : choice.id,
          user : user.objectId
        });
        //increment values
        var statsChoice = statsPath.child(choice.id);
        statsChoice.transaction(function(current_val){
          if(!current_val){
            current_val = 0;
          }
          current_val++;
          return current_val;
        }, function(){
          var totalVotes = statsPath.child('totalVotes');
          totalVotes.transaction(function(current_val){
            if(!current_val){
              current_val = 0;
            }
            current_val++;
            return current_val;
          }, function(){
            poll.pollid = poll.objectId;
            deferred.resolve(poll);
          });
        });
      });
      return deferred.promise;
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
    hasUserAlreadyVoted : hasUserAlreadyVoted,
    getAnwsersForPolls : getAnwsersForPolls
  };


});
