// Define Logger
var Logger = (function(){
  'use strict';
  var cfg = {
    track: Config.track,
    backendUrl: Config.backendUrl,
    storagePrefix: Config.storagePrefix,
    storageCrashKey:   'sync-crashs',
    storageCrashIdKey: 'sync-crashs-clientId',
    storageEventKey:   'sync-events',
    storageEventIdKey: 'sync-events-clientId',
  };
  var cache = {
    crashs: getLocalStorage(cfg.storageCrashKey) || [],
    currentCrashId: getLocalStorage(cfg.storageCrashIdKey),
    syncCrashRunning: false,
    events: getLocalStorage(cfg.storageEventKey) || [],
    currentEventId: getLocalStorage(cfg.storageEventIdKey),
    syncEventRunning: false
  };
  var $http;
  getHttpSrv(function(srv){
    $http = srv;
    sync();
  });
  var service = {
    track: track,
    crash: crash,
    sync: sync
  };
  return service;

  function track(name, data){
    var formattedData = formatEvent(name, data);
    console.log('$[TRACK]', formattedData);
    if(cfg.track){
      cache.events.push(formattedData);
      setLocalStorage(cfg.storageEventKey, cache.events);
      syncEvents();
    } else {
    }
  }

  function crash(data){
    var formattedData = formatCrash(data);
    console.log('$[CRASH]', formattedData);
    if(cfg.track){
      cache.crashs.push(formattedData);
      setLocalStorage(cfg.storageCrashKey, cache.crashs);
      syncCrashs();
    } else {
    }
  }

  function sync(){
    syncEvents();
    syncCrashs();
  }

  function formatEvent(name, data){
    var d = copy(data);
    d.name = name;
    d.clientId = createUuid();
    d.previousClientId = cache.currentEventId;
    cache.currentEventId = d.clientId;
    setLocalStorage(cfg.storageEventIdKey, cache.currentEventId);
    d.time = Date.now();
    d.userId = getLocalUserId();
    d.deviceId = getDeviceId();
    d.application = getApplicationCfg();
    return d;
  }

  function formatCrash(data){
    var d = copy(data);
    d.clientId = createUuid();
    d.previousClientId = cache.currentCrashId;
    cache.currentCrashId = d.clientId;
    setLocalStorage(cfg.storageCrashIdKey, cache.currentCrashId);
    d.time = Date.now();
    d.userId = getLocalUserId();
    d.device = getDevice();
    d.navigator = getNavigatorLite();
    d.application = getApplicationCfg();
    d.url = location ? location.href : undefined;
    return d;
  }

  function syncEvents(){
    if(!cache.syncEventRunning && cache.events.length > 0 && $http){
      var toSync = [];
      for(var i=0; i<cache.events.length && i<10; i++){
        toSync[i] = cache.events[i];
      }
      $http.post(cfg.backendUrl+'/tools/events/batch', toSync).then(function(res){
        if(res.data.inserted !== toSync.length){ console.warn(res.data.inserted+' events inserted while sending '+toSync.length+' events !'); }
        for(var i=0; i<toSync.length; i++){
          var removed = cache.events.shift();
          if(removed.clientId !== toSync[i].clientId){ console.warn('Remove event '+removed.clientId+' instead of event '+toSync[i].clientId); }
        }
        setLocalStorage(cfg.storageEventKey, cache.events);
        cache.syncEventRunning = false;
        syncEvents();
      }, function(err){
        console.warn('cant sync event ('+cache.events.length+' remaining)', err);
        cache.syncEventRunning = false;
      });
    }
  }

  function syncCrashs(){
    if(!cache.syncCrashRunning && cache.crashs.length > 0 && $http){
      var toSync = [];
      for(var i=0; i<cache.crashs.length && i<10; i++){
        toSync[i] = cache.crashs[i];
      }
      $http.post(cfg.backendUrl+'/tools/crashs/batch', toSync).then(function(res){
        if(res.data.inserted !== toSync.length){ console.warn(res.data.inserted+' crashs inserted while sending '+toSync.length+' crashs !'); }
        for(var i=0; i<toSync.length; i++){
          var removed = cache.crashs.shift();
          if(removed.clientId !== toSync[i].clientId){ console.warn('Remove crash '+removed.clientId+' instead of crash '+toSync[i].clientId); }
        }
        setLocalStorage(cfg.storageCrashKey, cache.crashs);
        cache.syncCrashRunning = false;
        syncCrashs();
      }, function(err){
        console.warn('cant sync crash ('+cache.crashs.length+' remaining)', err);
        cache.syncCrashRunning = false;
      });
    }
  }

  // because it takes time to setup...
  function getHttpSrv(callback){
    try {
      callback(angular.element(document.body).injector().get('$http'));
    } catch(e) {
      setTimeout(function(){
        getHttpSrv(callback);
      }, 300);
    }
  }

  function getApplicationCfg(){
    var ret = {};
    ret.appVersion = Config.appVersion;
    return ret;
  }

  function getLocalUserId(){
    var user = getLocalUser();
    return user ? user.uuid : undefined;
  }

  function getLocalUser(){
    return getLocalStorage('user');
  }

  function getDeviceId(){
    var device = getDevice();
    return device ? device.uuid : undefined;
  }

  function getDevice(){
    return window.device ? copy(window.device) : undefined;
  }

  function getNavigatorLite(){
    var ret = {};
    ret.userAgent = navigator.userAgent;
    ret.platform = navigator.platform;
    ret.vendor = navigator.vendor;
    ret.appCodeName = navigator.appCodeName;
    ret.appName = navigator.appName;
    ret.appVersion = navigator.appVersion;
    ret.product = navigator.product;
    return ret;
  }

  function getLocalStorage(key){
    if(localStorage){
      return JSON.parse(localStorage.getItem(cfg.storagePrefix+key));
    }
  }

  function setLocalStorage(key, value){
    if(localStorage){
      localStorage.setItem(cfg.storagePrefix+key, JSON.stringify(value));
    }
  }

  function createUuid(){
    function S4(){ return (((1+Math.random())*0x10000)|0).toString(16).substring(1); }
    return (S4() + S4() + '-' + S4() + '-4' + S4().substr(0,3) + '-' + S4() + '-' + S4() + S4() + S4()).toLowerCase();
  }

  function copy(data){
    return JSON.parse(JSON.stringify(data));
  }
})();


// catch exceptions
window.onerror = function(message, url, line, col, error){
  'use strict';
  var stopPropagation = false;
  var data = {
    type: 'javascript'
  };
  if(error && error.name)   { data.name         = error.name;   }
  if(message)               { data.message      = message;      }
  if(url)                   { data.fileName     = url;          }
  if(line)                  { data.lineNumber   = line;         }
  if(col)                   { data.columnNumber = col;          }
  if(error && error.stack)  { data.stack        = error.stack;  }

  Logger.crash({error: data});
  return stopPropagation;
};
