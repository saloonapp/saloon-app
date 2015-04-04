angular.module('app')

.filter('sessionFilter', function($filter){
  'use strict';
  
  function isMatch(item, filter){
    for(var i in filter){
      if(filter[i]){
        if(!item[i] || ((typeof item[i]) !== (typeof filter[i]))){
          return false;
        } else if(typeof filter[i] === 'object' && !isMatch(item[i], filter[i])){
          return false;
        } else if(typeof filter[i] === 'string' && item[i] !== filter[i]){
          return false;
        }
      }
    }
    return true;
  }
  
  return function(items, data){
    var filtered = [];
    angular.forEach(items, function(item){
      if(!data || !data.filter || isMatch(item, data.filter)){
        filtered.push(item);
      }
    });
    return data && data.search ? $filter('filter')(filtered, data.search) : filtered;
  };
});
