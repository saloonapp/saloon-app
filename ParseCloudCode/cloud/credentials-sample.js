module.exports = (function(){
  return {
    // dev
    'YOUR_PARSE_APPLICATION_ID_DEV': {
      pusher: {
        appId: 'YOUR_PUSHER_APP_ID',
        key: 'YOUR_PUSHER_APP_KEY',
        secret: 'YOUR_PUSHER_SECRET_KEY'
      }
    },
    // prod
    'YOUR_PARSE_APPLICATION_ID_PROD': {
      pusher: {
        appId: 'YOUR_PUSHER_APP_ID',
        key: 'YOUR_PUSHER_APP_KEY',
        secret: 'YOUR_PUSHER_SECRET_KEY'
      }
    }
  };
})();
