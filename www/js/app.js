(function(){
  'use strict';
  angular.module('app', ['ionic', 'ngCordova', 'LocalForageModule'])
    .config(configure)
    .run(runBlock);

  configure.$inject = ['$urlRouterProvider', '$provide'];
  function configure($urlRouterProvider, $provide){
    $urlRouterProvider.otherwise('/loading');

    // improve angular logger
    $provide.decorator('$log', ['$delegate', 'customLogger', function($delegate, customLogger){
      return customLogger($delegate);
    }]);
  }

  function runBlock(){

  }
})();
