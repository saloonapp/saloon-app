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

      dataPoll = $firebaseArray(ref.child(pollid));
      return dataPoll;
    }

    function saveAnswer(poll, choice, user){
      var dataPoll;

      dataPoll = $firebaseArray(ref.child(poll.objectId));
      dataPoll.$add({
        choice : choice[0].id,
        user : user.objectId
      });
      return dataPoll;
    }

    function hasUserAlreadyVoted(answers, user){

    }

  return {
  	setPollsData : setPollsData,
  	getPollsAround : getPollsAround,
    saveAnswer : saveAnswer,
    getAnswers : getAnswers,
    hasUserAlreadyVoted : hasUserAlreadyVoted
  };


});
