angular.module('app')

.filter('filteredMatches', function(DeepFilter){
  'use strict';
  return function(item, search, prefixLength, suffixLength){
    var matches = _.uniq(DeepFilter.getMatches(item, search));
    return _.flatten(_.map(matches, function(match){
      return DeepFilter.parseMatch(match, search, prefixLength, suffixLength);
    }));
  };
})

.filter('deepFilter', function(DeepFilter){
  'use strict';
  return function(items, search){
    var filtered = [];
    angular.forEach(items, function(item){
      if(search && search.length > 1){
        var matches = DeepFilter.getMatches(item, search);
        if(matches.length > 0){
          filtered.push(item);
        }
      } else {
        filtered.push(item);
      }
    });
    return filtered;
  };
})

.service('DeepFilter', function(Utils){
  'use strict';
  var service = {
    getMatches: getMatches,
    parseMatch: parseMatch
  };

  function isMatch(str, search){
    return search && str.match(new RegExp(search, 'gi')) !== null;
  }

  function shouldExclude(paramName, value){
    return paramName.indexOf('_') === 0
    || paramName.indexOf('$') === 0
    || paramName === 'id'
    || paramName === 'objectId'
    || paramName === 'platform'
    || typeof value === 'number'
    || typeof value === 'boolean'
    || Utils.isEmail(value)
    || Utils.isUrl(value)
    || Utils.isDate(value);
  }

  function getMatches(obj, search){
    var matches = [];
    for(var i in obj){
      if(!shouldExclude(i, obj[i])){
        if(obj[i] && typeof obj[i] === 'object'){
          matches = matches.concat(getMatches(obj[i], search));
        } else if(typeof obj[i] === 'string') {
          if(isMatch(obj[i], search)){
            matches.push(obj[i]);
          }
        } else {
          // number, boolean
        }
      }
    }
    return matches;
  }

  function parseMatch(source, search, prefixLength, suffixLength){
    if(!prefixLength){ prefixLength = 30; }
    if(!suffixLength){ suffixLength = 30; }
    search = search.toLowerCase();
    var str = source.toLowerCase();
    var results = [];
    var start = 0;
    var index = str.indexOf(search, start);
    while(index !== -1){
      var match = source.slice(index, index+search.length);

      var min = index-prefixLength > 0 ? index-prefixLength : 0;
      var prefix = (min > 0 ? '...' : '')+source.slice(min, index);
      if(prefix.lastIndexOf('\n') > -1){
        prefix = prefix.slice(prefix.lastIndexOf('\n'), prefix.length);
      }

      var max = index+search.length+suffixLength < source.length ? index+search.length+suffixLength : source.length;
      var suffix = source.slice(index+search.length, max)+(max < source.length ? '...' : '');
      if(suffix.indexOf('\n') > -1){
        suffix = suffix.slice(0, suffix.indexOf('\n'));
      }

      results.push(prefix+'<b>'+match+'</b>'+suffix);

      start = index+1;
      index = str.indexOf(search, start);
    }
    return results;
  }

  return service;
});
