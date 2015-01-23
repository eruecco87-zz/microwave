// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('microwave', ['ionic', 'pascalprecht.translate', 'microwave.controllers', 'microwave.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $translateProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

    // setup an abstract state for the tabs directive
    .state('tab', {
      url: "/tab",
      abstract: true,
      templateUrl: "templates/tabs.html",
      resolve: {
        
        // Gets the current language from localhost.
        getLanguage: ['$window', '$translate', function($window, $translate) {

          // Translates the app to the selected language on initialization.
          $translate.use($window.localStorage.getItem('microwave-language'));

        }]
      }
    })

    // Each tab has its own nav history stack:
    .state('tab.remote', {
      url: '/remote',
      views: {
        'tab-remote': {
          templateUrl: 'templates/tab-remote.html',
          controller: 'RemoteCtrl'
        }
      }
    })

    .state('tab.devices', {
      url: '/devices',
      views: {
        'tab-devices': {
          templateUrl: 'templates/tab-devices.html',
          controller: 'DevicesCtrl'
        }
      }
    })

    .state('tab.device-details', {
      url: '/devices/:deviceId',
      views: {
        'tab-devices': {
          templateUrl: 'templates/tab-devices-details.html',
          controller: 'DevicesDetailsCtrl'
        }
      }
    })

    .state('tab.config', {
      url: '/config',
      views: {
        'tab-config': {
          templateUrl: 'templates/tab-config.html',
          controller: 'ConfigCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/remote');

  // Set up translation provider.
  $translateProvider.useStaticFilesLoader({
    prefix: 'languages/',
    suffix: '.json'
  });

  $translateProvider.preferredLanguage('en_US');

});
