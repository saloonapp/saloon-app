(function(){
  'use strict';
  angular.module('app')
    .filter('address', filterAddress)
    .filter('commentDate', filterCommentDate)
    .filter('customDate', filterCustomDate)
    .filter('datePeriod', filterDatePeriod)

    .filter('inSlicesOf', filterInSlicesOf)
    .filter('date', filterDate)
    .filter('datetime', filterDatetime)
    .filter('time', filterTime)
    .filter('humanTime', filterHumanTime)
    .filter('duration', filterDuration)
    .filter('humanDuration', filterHumanDuration)
    .filter('mynumber', filterMyNumber)
    .filter('rating', filterRating);

  // project filters

  function filterAddress(){
    return function(address){
      if(address){
         return (address.name ? address.name+', ' : '') +
           address.street +
           (address.zipCode ? ' '+address.zipCode : '') +
           (address.city ? ' '+address.city : '');
      }
      return address;
    };
  }

  function filterCommentDate(Utils, moment){
    return function(date, format){
      var jsDate = Utils.toDate(date);
      return jsDate ? moment(jsDate).format(format ? format : '[le] D MMM YYYY à HH:mm') : '';
    };
  }

  function filterCustomDate(Utils, moment){
    return function(date){
      var jsDate = Utils.toDate(date);
      if(jsDate){
        var momentDate = moment(jsDate);
        if(momentDate.isAfter(moment().subtract(1, 'days')) && momentDate.isBefore(moment().add(1, 'days'))){
          return moment(jsDate).fromNow();
        } else {
          return moment(jsDate).format('[le] DD MMM à HH[h]mm');
        }
      }
      return date;
    };
  }

  function filterDatePeriod(Utils, moment){
    return function(startDate, endDate, format){
      var jsStartDate = Utils.toDate(startDate);
      if(endDate){
        var jsEndDate = Utils.toDate(endDate);
        var prefix = moment(jsStartDate).format('DD') !== moment(jsEndDate).format('DD') ? moment(jsStartDate).format('D')+'-' : '';
        return jsEndDate ? prefix+moment(jsEndDate).format(format ? format : 'll') : '';
      } else {
        return jsStartDate ? moment(jsStartDate).format('ll') : '';
      }
    };
  }

  // common filters

  function filterInSlicesOf($rootScope){
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

  function filterDate(Utils, moment){
    return function(date, format){
      var jsDate = Utils.toDate(date);
      return jsDate ? moment(jsDate).format(format ? format : 'll') : '';
    };
  }

  function filterDatetime(Utils, moment){
    return function(date, format){
      var jsDate = Utils.toDate(date);
      return jsDate ? moment(jsDate).format(format ? format : 'D MMM YYYY, HH:mm:ss') : '';
    };
  }

  function filterTime(Utils, moment){
    return function(date, format){
      var jsDate = Utils.toDate(date);
      return jsDate ? moment(jsDate).format(format ? format : 'LT') : '';
    };
  }

  function filterHumanTime(Utils, moment){
    return function(date, suffix){
      var jsDate = Utils.toDate(date);
      return jsDate ? moment(jsDate).fromNow(suffix === true) : date;
    };
  }

  function filterDuration($log, moment){
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

  function filterHumanDuration(moment){
    return function(start, end, humanize){
      var millis = end - start;
      return moment.duration(millis/1000, 'seconds').humanize();
    };
  }

  function filterMyNumber($filter){
    return function(number, round){
      var mul = Math.pow(10, round ? round : 0);
      return $filter('number')(Math.round(number*mul)/mul);
    };
  }

  function filterRating($filter){
    return function(rating, max, withText){
      var stars = rating ? new Array(Math.floor(rating)+1).join('★') : '';
      var maxStars = max ? new Array(Math.floor(max)-Math.floor(rating)+1).join('☆') : '';
      var text = withText ? ' ('+$filter('mynumber')(rating, 1)+' / '+$filter('mynumber')(max, 1)+')' : '';
      return stars+maxStars+text;
    };
  }
})();
