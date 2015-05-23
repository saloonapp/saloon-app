(function(){
  'use strict';
  angular.module('app')
    .filter('place', place)
    .filter('commentDate', commentDate)

    .filter('inSlicesOf', inSlicesOf)
    .filter('date', date)
    .filter('datetime', datetime)
    .filter('time', time)
    .filter('humanTime', humanTime)
    .filter('duration', duration)
    .filter('humanDuration', humanDuration)
    .filter('mynumber', mynumber)
    .filter('rating', rating);

  // project filters

  function place(){
    return function(place){
      return place ? (place.name ? place.name : place.ref) : '';
    };
  }

  function commentDate(Utils, moment){
    return function(date, format){
      var jsDate = Utils.toDate(date);
      return jsDate ? moment(jsDate).format(format ? format : '[le] D MMM YYYY à HH:mm') : '';
    };
  }

  // common filters

  function inSlicesOf($rootScope){
    return function(items, count){
      if(!angular.isArray(items) && !angular.isString(items)) return items;
      if(!count){ count = 3; }
      var array = [];
      for(var i = 0; i < items.length; i++){
        var chunkIndex = parseInt(i / count, 10);
        var isFirst = (i % count === 0);
        if(isFirst){ array[chunkIndex] = []; }
        array[chunkIndex].push(items[i]);
      }

      if(angular.equals($rootScope.arrayinSliceOf, array)){
        return $rootScope.arrayinSliceOf;
      } else {
        $rootScope.arrayinSliceOf = array;
      }

      return array;
    };
  }

  function date(Utils, moment){
    return function(date, format){
      var jsDate = Utils.toDate(date);
      return jsDate ? moment(jsDate).format(format ? format : 'll') : '';
    };
  }

  function datetime(Utils, moment){
    return function(date, format){
      var jsDate = Utils.toDate(date);
      return jsDate ? moment(jsDate).format(format ? format : 'D MMM YYYY, HH:mm:ss') : '';
    };
  }

  function time(Utils, moment){
    return function(date, format){
      var jsDate = Utils.toDate(date);
      return jsDate ? moment(jsDate).format(format ? format : 'LT') : '';
    };
  }

  function humanTime(Utils, moment){
    return function(date, suffix){
      var jsDate = Utils.toDate(date);
      return jsDate ? moment(jsDate).fromNow(suffix === true) : '';
    };
  }

  function duration($log, moment){
    return function(seconds, humanize){
      if(seconds || seconds === 0){
        if(humanize){
          return moment.duration(seconds, 'seconds').humanize();
        } else {
          var prefix = -60 < seconds && seconds < 60 ? '00:' : '';
          return prefix + moment.duration(seconds, 'seconds').format('hh:mm:ss');
        }
      } else {
        $log.warn('Unable to format duration', seconds);
        return '';
      }
    };
  }

  function humanDuration(moment){
    return function(start, end, humanize){
      var millis = end - start;
      return moment.duration(millis/1000, 'seconds').humanize();
    };
  }

  function mynumber($filter){
    return function(number, round){
      var mul = Math.pow(10, round ? round : 0);
      return $filter('number')(Math.round(number*mul)/mul);
    };
  }

  function rating($filter){
    return function(rating, max, withText){
      var stars = rating ? new Array(Math.floor(rating)+1).join('★') : '';
      var maxStars = max ? new Array(Math.floor(max)-Math.floor(rating)+1).join('☆') : '';
      var text = withText ? ' ('+$filter('mynumber')(rating, 1)+' / '+$filter('mynumber')(max, 1)+')' : '';
      return stars+maxStars+text;
    };
  }
})();
