(function(){
  'use strict';
  angular.module('app')
    .factory('customLogger', customLogger);

  function customLogger(){
    return function($delegate){
      return {
        debug: function(){$delegate.debug.apply(null, arguments);},
        log: function(){
          Logger.track(arguments[0], arguments[1]);
          $delegate.log.apply(null, arguments);
        },
        info: function(){$delegate.info.apply(null, arguments);},
        warn:function(){$delegate.warn.apply(null, arguments);},
        error: function(){
          if(typeof arguments[0] === 'string'){
            Logger.track('error', {message: arguments[0], data: arguments[1]});
          } else {
            var exception = arguments[0];
            var cause = arguments[1];
            var data = {
              type: 'angular'
            };
            if(exception && exception.name)     { data.name     = exception.name;     }
            if(exception && exception.message)  { data.message  = exception.message;  }
            if(cause)                           { data.cause    = cause;              }
            if(exception && exception.stack)    { data.stack    = exception.stack;    }
            Logger.crash({error: data});
          }
          $delegate.error.apply(null, arguments);
        }
      };
    };
  }
})();
