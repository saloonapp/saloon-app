var Config = (function(){
  'use strict';
  var cfg = {
    appVersion: '~',
    debug: true, // to toggle features between dev & prod
    verbose: true, // should log in console more infos
    track: false, // should send tracking events to a server
    storage: true, // should save data to browser storage
    storagePrefix: 'app-', // prefix all stoarge entries with this prefix
    emailSupport: 'exemple@mail.com',
    //backendUrl: '',
    parse: {
      // create application here : https://parse.com/
      applicationId: 'YOUR_PARSE_APPLICATION_ID',
      restApiKey: 'YOUR_PARSE_REST_API_KEY',
      clientKey: 'YOUR_PARSE_CLIENT_KEY'
    },
    pusher: {
      // create application here : https://pusher.com/
      key: 'YOUR_PUSHER_KEY'
    },
    firebase: {
      // create account & app here : https://www.firebase.com/
      url: 'https://<YOUR_FIREBASE_ID>.firebaseio.com'
    },
    gcm: {
      // create project here : https://console.developers.google.com/
      projectNumber: 'YOUR_GOOGLE_PROJECT_NUMBER', // Google project number
      apiServerKey: 'YOUR_GOOGLE_SERVER_API_KEY' // used only to send notifications
    },
    linkedin: {
      // create linkedin app here : https://www.linkedin.com/secure/developer
      clientId: 'YOUR_LINKEDIN_KEY', // Clé API | Consumer Key
      clientSecret: 'YOUR_LINKEDIN_SECRET', // Clé secrète | Consumer Secret
      state: 'AValueOfYourChoice...' // A unique string value of your choice that is hard to guess.
    }
  };
  return cfg;
})();
