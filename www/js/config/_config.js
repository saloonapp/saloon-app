var Config = (function(){
  'use strict';
  var dev = {
    debug: true,
    verbose: true,
    track: false,
    backendUrl: 'https://dev-saloon.herokuapp.com/api/v1',
    //backendUrl: 'http://localhost:9000/api/v1',
    segmentio: {
      writeKey: ''
    }
  };
  var prod = {
    debug: false,
    verbose: false,
    track: true,
    backendUrl: 'https://saloonapp.herokuapp.com/api/v1',
    segmentio: {
      writeKey: 'G5zTzGBygajCfZoGb5xt2dd2djRI70mW'
    }
  };
  var env = dev;

  var cfg = {
    appVersion: '1.0.1~',
    debug: env.debug, // to toggle features between dev & prod
    verbose: env.verbose, // should log in console more infos
    track: env.track, // should send tracking events & crashs to the server
    storage: true, // should save data to browser storage
    storagePrefix: 'saloon-', // prefix all stoarge entries with this prefix
    backendUrl: env.backendUrl,
    emailSupport: 'contact@saloonapp.co',
    segmentio: {
      writeKey: env.segmentio.writeKey
    }
  };
  return cfg;
})();
