(function(){
  'use strict';
  angular.module('app')
    .config(configure);

  function configure($stateProvider){
    $stateProvider
      .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'js/layout/layout.html'
    })
      .state('app.loading', {
      url: '/loading',
      templateUrl: 'js/layout/loading.html',
      controller: 'LoadingCtrl'
    });
  }
})();
