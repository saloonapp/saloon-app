var Config = (function(){
  'use strict';
  var cfg = {
    appVersion: '~',
    debug: true, // to toggle features between dev & prod
    verbose: true, // should log in console more infos
    track: false, // should send tracking events & crashs to the server
    storage: true, // should save data to browser storage
    storagePrefix: 'saloon-', // prefix all stoarge entries with this prefix
    backendUrl: 'https://dev-saloon.herokuapp.com/api/v1',
    //backendUrl: 'http://localhost:9000/api/v1',
    emailSupport: 'contact@saloonapp.co'
  };
  return cfg;
})();
