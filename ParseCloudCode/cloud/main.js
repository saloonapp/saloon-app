// from https://github.com/HeinrichFilter/pusher-parse-cloud-code-server
var credentials = require('cloud/credentials.js');
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

  var query = new Parse.Query('_User');
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
  });
});
