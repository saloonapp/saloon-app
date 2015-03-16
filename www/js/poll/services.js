angular.module('app')
.factory('PollSrv', function(ParseUtils, UserSrv, $firebaseArray, Config, $q){


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
      var pollsToReturn = [];

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
          var deferred = $q.defer();
          var promises = [];
            _.map(polls, function(poll){
              //Maybe we need a Poll Model in order to be sure to have the right informations every time
              //and to have a cleaner code?
              //var pollFormated = {};
              //pollFormated = ;

              promises.push(getAnswers(poll.objectId).then(function(result){
                pollsToReturn.push(angular.extend({poll : poll},result));
              }));
            });
          $q.all(promises).then(function(){
            deferred.resolve(pollsToReturn);
            //return pollsToReturn;
          });
          return deferred.promise;
	        });

    	})
    }

    function initFirebase(){

    }
    function getAnswers(pollid){
      var answers;
      var answersPath = getAnswersPath(pollid);
      var statsPath = getStatsPath(pollid);
      var defer = $q.defer();
      answers = $firebaseArray(answersPath);
      var answersStats = null;
        answers.$loaded().then(function(answers){
        $firebaseArray(statsPath).$loaded().then(function(stats){
          answersStats = stats;
          var toReturn = {
            answers : answers,
            answersStats: answersStats,
            pollid : pollid
          };
          defer.resolve(toReturn);


        });
      });

      return defer.promise;


    }

    function saveAnswer(poll, choices, user){

      var answers = $firebaseArray(getAnswersPath(poll.poll.objectId));
      var statsPath = getStatsPath(poll.poll.objectId);
      var answersStats = $firebaseArray(statsPath);

      _.map(choices, function(choice){
        answers.$add({
          choice : choice.id,
          user : user.objectId
        });

        var statsChoice = statsPath.child(choice.id);
        statsChoice.transaction(function(current_val){
          if(!current_val){
            current_val = 0;
          }
          current_val++;
          return current_val;
        });
        var totalVotes = statsPath.child('totalVotes');
        totalVotes.transaction(function(current_val){
          if(!current_val){
            current_val = 0;
          }
          current_val++;
          return current_val;
        });
      });
      poll.poll.answers = answers;
      poll.poll.answersStats = answersStats;
      return {
        answers : answers,
        answersStats: answersStats,
        pollid : poll.poll.objectId,
        poll : structurePolls([poll])[0]

      };
    }

    function structurePolls(polls){
      var structuredPolls = [];
      _.map(polls, function(poll){
        _.map(poll.poll.choices, function(choice){
          var index = poll.answersStats[_.findIndex(poll.answersStats, function(chr){ return chr.$id == choice.id})];
          if( index === undefined){
            index = {};
            index.$value = 0;
          }
          choice.nbVotes = index.$value;
        });
        var totalVotes = poll.answersStats[_.findIndex(poll.answersStats, function(chr){ return chr.$id == "totalVotes"})];
        if(totalVotes === undefined){
          totalVotes = {};
          totalVotes.$value = 0;
        }
        poll.totalVotes = totalVotes.$value;
      });
      return polls;
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
    structurePolls : structurePolls
  };


});
