(function(){
  'use strict';
  angular.module('app', ['ionic', 'ngCordova', 'LocalForageModule', 'btford.markdown', 'monospaced.elastic', 'angulartics', 'angulartics.segment.io'])
    .config(configure)
    .config(fixiOS8)
    .run(runBlock);

  configure.$inject = ['$urlRouterProvider', '$compileProvider', '$provide', 'markdownConverterProvider'];
  function configure($urlRouterProvider, $compileProvider, $provide, markdownConverterProvider){
    $urlRouterProvider.otherwise('/app/loading');

    // allow more url scheme (otherwise angular will add 'unsafe:')
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|sms|geo|file):/);

    // configure markdown directive
    markdownConverterProvider.config({
      parseImgDimensions: true,
      headerLevelStart: 3
    });

    // improve angular logger
    $provide.decorator('$log', ['$delegate', 'customLogger', function($delegate, customLogger){
      return customLogger($delegate);
    }]);
  }

  //https://github.com/angular/angular.js/issues/9128
  fixiOS8.$inject = ['$provide'];
  function fixiOS8($provide){
    // Minification-safe hack.
    var $$watchers = '$$watchers',
        $$nextSibling = '$$nextSibling',
        $$childHead = '$$childHead',
        $$childTail = '$$childTail',
        $$listeners = '$$listeners',
        $$listenerCount = '$$listenerCount',
        $$ChildScope = '$$childScope',
        $id = '$id',
        $parent = '$parent',
        $$prevSibling = '$$prevSibling',
        $root = '$root';

    $provide.decorator('$rootScope', ['$delegate', function($rootScope) {
      var proto = Object.getPrototypeOf($rootScope);

      function nextUid () {
        return ++$rootScope.$id;
      }

      proto.$new = function(isolate, parent) {
        var child;

        function destroyChild() {
          child.$$destroyed = true;
        }

        parent = parent || this;

        if (isolate) {
          child = new proto.constructor();
          child[$root] = this.$root;
        } else {
          // Only create a child scope class if somebody asks for one,
          // but cache it to allow the VM to optimize lookups.
          if (!this.$$ChildScope) {
            this[$$ChildScope] = function ChildScope() {
              this[$$watchers] = this[$$nextSibling] =
                this[$$childHead] = this[$$childTail] = null;
              this[$$listeners] = {};
              this[$$listenerCount] = {};
              this[$id] = nextUid();
              this[$$ChildScope] = null;
            };
            this[$$ChildScope].prototype = this;
          }
          child = new this[$$ChildScope]();
        }

        child[$parent] = parent;
        child[$$prevSibling] = parent.$$childTail;
        if (parent.$$childHead) {
          parent[$$childTail][$$nextSibling] = child;
          parent[$$childTail] = child;
        } else {
          parent[$$childHead] = parent[$$childTail] = child;
        }

        // When the new scope is not isolated or we inherit from `this`, and
        // the parent scope is destroyed, the property `$$destroyed` is inherited
        // prototypically. In all other cases, this property needs to be set
        // when the parent scope is destroyed.
        // The listener needs to be added after the parent is set
        if (isolate || parent != this) child.$on('$destroy', destroyChild);

        return child;
      };
      $rootScope.$new = proto.$new;
      return $rootScope;
    }]);
  }

  function runBlock($rootScope, $state, StorageUtils, KeyboardPlugin){
    //hide "done, back, next" on iOS
    KeyboardPlugin.hideKeyboardAccessoryBar();
    KeyboardPlugin.disableScroll(true);

    var statesToSave = ['app.events', 'app.event.infos', 'app.event.program', 'app.event.schedule'];
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
      var lastState = {
        name: toState.name,
        params: toParams
      };
      if(statesToSave.indexOf(lastState.name) > -1){
        StorageUtils.set('last-state', lastState);
      }
    });
  }
})();
