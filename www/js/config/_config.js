var Config = (function(){
  'use strict';
  var cfg = {
    appVersion: '~',
    debug: true, // to toggle features between dev & prod
    verbose: true, // should log in console more infos
    track: false, // should send tracking events to a server
    storage: true, // should save data to browser storage
    storagePrefix: 'saloon-', // prefix all stoarge entries with this prefix
    emailSupport: 'loicknuchel@gmail.com',
    backendUrl: 'https://dev-saloon.herokuapp.com/api/v1',
    gcm: {
      // create project here : https://console.developers.google.com/
      senderID: '263462318850', // Google project number
      apiServerKey: 'AIzaSyDzM4XzyW9HWJNol9OePz4cAXi7QbVANOs' // used only to send notifications
    }
  };
  return cfg;
})();
