(function(){
  'use strict';
  angular.module('app')
    .controller('MenuCtrl', MenuCtrl);

  function MenuCtrl($scope, $state){
    var vm = {};
    $scope.vm = vm;
  }
})();
