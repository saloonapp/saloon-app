(function(){
  'use strict';
  angular.module('app', ['ionic', 'ngCordova', 'LocalForageModule', 'btford.markdown', 'monospaced.elastic'])
    .config(configure)
    .run(runBlock);

  configure.$inject = ['$urlRouterProvider', '$provide'];
  function configure($urlRouterProvider, $provide){
    $urlRouterProvider.otherwise('/app/loading');

    // improve angular logger
    $provide.decorator('$log', ['$delegate', 'customLogger', function($delegate, customLogger){
      return customLogger($delegate);
    }]);
  }

  function runBlock(KeyboardPlugin){
    //hide "done, back, next" on iOS
    KeyboardPlugin.hideKeyboardAccessoryBar();
  }
})();
