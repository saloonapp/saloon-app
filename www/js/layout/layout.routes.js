(function(){
  'use strict';
  angular.module('app')
    .config(configure);

  function configure($stateProvider){
    $stateProvider
      .state('loading', {
      url: '/loading',
      templateUrl: 'js/layout/loading.html',
      controller: 'LoadingCtrl'
    })
      .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'js/layout/tabs.html',
      controller: 'TabsCtrl'
    });
  }
})();
