// from https://github.com/HeinrichFilter/pusher-parse-cloud-code-server
var credentials = require('cloud/credentials.js')[Parse.applicationId];
var Pusher = require('cloud/pusher.js');
var pusher = new Pusher(credentials.pusher);

function toUtf8(obj){
  if(typeof obj === 'string'){
    return unescape(encodeURIComponent(obj));
  } else if(typeof obj === 'object'){
    for(var i in obj){
      obj[i] = toUtf8(obj[i]);
    }
    return obj;
  } else {
    return obj;
  }
}

Parse.Cloud.afterSave('PrivateMessage', function(request){
  var data = JSON.parse(JSON.stringify(request.object));
  var channel = data.from.objectId+'-'+data.to.objectId;
  var event = 'PrivateMessage';
  pusher.trigger(channel, event, toUtf8(data));

  /*var query = new Parse.Query('_User');
  query.get(data.from.objectId, {
    success: function(user){
      var userData = JSON.parse(JSON.stringify(user));
      data.from = {
        objectId: userData.objectId,
        pseudo: userData.pseudo,
        avatar: userData.avatar
      };
      pusher.trigger(channel, event, toUtf8(data));
    },
    error: function(object, error){
      pusher.trigger(channel, event, toUtf8(data));
    }
  });*/
});

Parse.Cloud.afterSave('PublicMessage', function(request){
  var matchDistance = 1; // 1 km
  var matchMaxAge = 60 * 60 * 1000; // 1h
  var data = JSON.parse(JSON.stringify(request.object));
  var event = 'PublicMessage';

  var query = new Parse.Query('_User');
  query.equalTo('active', true);
  query.greaterThan('updatedAt', new Date(Date.now() - matchMaxAge).toISOString());
  query.withinKilometers('location', request.object.get('location'), matchDistance);
  query.find({
    success: function(users){
      var usersData = JSON.parse(JSON.stringify(users));
      for(var i in usersData){
        var channel = usersData[i].objectId+'-'+data.room;
        pusher.trigger(channel, event, toUtf8(data));
      }
    },
    error: function(object, error){}
  });
});
