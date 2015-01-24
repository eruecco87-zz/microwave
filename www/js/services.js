angular.module('microwave.services', ['angular-json-rpc'])


/**
 * Service that interacts with localstorage to manage config params.
 */
.factory('Config', ['$window', function($window) {

  return {

    // Returns an array of available languages.
    listLanguages: function() {

      return [
        {name: 'English', key: 'en_US'},
        {name: 'Español', key: 'es_US'}
      ]

    },

    // Saves the selected language into localstorage
    setLanguage: function(key) {

      $window.localStorage.setItem('microwave-language', key);

    },

    // Get the current language from localstorage
    getLanguage: function() {

      return $window.localStorage.getItem('microwave-language') || 'en_US';

    }

  }

}])


/**
 * Service that interacts with localstorage to manage saved devices.
 */
.factory('Devices', ['$window', function($window) {

  return {

    // Saves the device into the localstorage devices object.
    save: function(config) {

      // Stores localstorage config in an variable or initializes an array if null.
      var configArray = $window.localStorage.getItem('microwave-devices') || [];

      // Converts JSON string back to object.
      if (configArray.length > 0) {

        configArray = JSON.parse(configArray);

        // Runs through all devices and deactivates them.
        angular.forEach(configArray, function(value, key) {

          configArray[key].active = false;

        });


      }

      // Pushes the new config into the object.
      configArray.push(config);

      // Saves the compiled config object into a JSON string.
      $window.localStorage.setItem('microwave-devices', JSON.stringify(configArray));

    },

    // Removes the device from the localstorage devices object.
    remove: function(index) {

      var deviceWasActive;

      // Stores localstorage config in an variable.
      var configArray = $window.localStorage.getItem('microwave-devices');

      // Converts JSON string back to object.
      if (configArray.length > 0) {

        configArray = JSON.parse(configArray);

      }

      // Checks if the device about to be deleted was active.
      if ( configArray[index].active === true ) {

        deviceWasActive = true;

      }

      // Removes the selected device from the object.
      configArray.splice(index, 1);


      // If removed device was active set the first in the update list as active.
      if ( deviceWasActive && configArray.length > 0 ) {

        configArray[0].active = true;

      }

      // Saves the compiled config object into a JSON string.
      $window.localStorage.setItem('microwave-devices', JSON.stringify(configArray));

    },

    // Gets a specific device from the localstorage devices object.
    get: function(index) {


      // Stores localstorage config in an variable.
      var configArray = $window.localStorage.getItem('microwave-devices');

      // Converts JSON string back to object.
      if (configArray.length > 0) {

        configArray = JSON.parse(configArray);

      }

      return configArray[index];

    },

    // Edits the device from the localstorage devices object.
    edit: function(config, index) {

      // Stores localstorage config in an variable.
      var configArray = $window.localStorage.getItem('microwave-devices');

      // Converts JSON string back to object.
      if (configArray.length > 0) {

        configArray = JSON.parse(configArray);

      }

      // Overrride the device's config values.
      configArray[index].name = config.name;
      configArray[index].ip = config.ip;
      configArray[index].port = config.port;
      configArray[index].user = config.user;
      configArray[index].pass = config.pass;

      // Saves the compiled config object into a JSON string.
      $window.localStorage.setItem('microwave-devices', JSON.stringify(configArray));


    },

    // Loads the localstorage config.
    list: function() {

      return JSON.parse($window.localStorage.getItem('microwave-devices'))

    },

    setActive:  function(index) {

      // Stores localstorage config in an variable.
      var configArray = $window.localStorage.getItem('microwave-devices');

      // Converts JSON string back to object.
      if (configArray.length > 0) {

        configArray = JSON.parse(configArray);

      }

      // Runs through all devices and deactivates them.
      angular.forEach(configArray, function(value, key) {

        configArray[key].active = false;

      });

      // Activates the selected device
      configArray[index].active = true;

      // Saves the compiled config object into a JSON string.
      $window.localStorage.setItem('microwave-devices', JSON.stringify(configArray));

    },

    getActive: function() {

      var activeDevice;

      // Stores localstorage config in an variable.
      var configArray = $window.localStorage.getItem('microwave-devices');

      // Converts JSON string back to object.
      if (configArray.length > 0) {

        configArray = JSON.parse(configArray);

      }

      // Runs through all devices and stores the active device.
      angular.forEach(configArray, function(value, key) {

        if ( configArray[key].active === true ) {

          activeDevice =  configArray[key];

        }

      });

      return activeDevice;


    }

  }

}])


/**
 * Popcorn Time API Wrapper.
 */
.factory('Popcorn', ['Devices', '$http', '$q', function(Devices, $http, $q) {

  // Global deferred object to return API responses.
  var deferred;
  
  // json RPC wrapper for API calls.
  var jsonRPC = function(method, params, configTest) {

    // Deferred object instantiation.
    deferred = $q.defer();

    // Sets the config for API calls.
    var apiConfig = configTest || Devices.getActive(),
        ipAddress = apiConfig.ip,
        portNumber = apiConfig.port,
        username = apiConfig.user,
        password = apiConfig.pass;

    // Sets the API url and authorization based on the config.
    var apiUrl = 'http://' + ipAddress + ':' + portNumber;
    $http.defaults.headers.common.Authorization = 'Basic ' + btoa(username + ':' + password);

    // Makes the API call and sets the global deferred object with the response.
    $http.jsonrpc(apiUrl, method, params).success(function(data){
      
      deferred.resolve(data);

    }).error(function(error, status, headers){

      deferred.resolve(false);

    });

  }


  /**
   * This are all the Popcorn Time API Methods used.
   */ 
  return {

    ping: function(configTest) {

      jsonRPC('ping', [], configTest);
      return deferred.promise;

    },

    toggleTab: function() {
      
      jsonRPC('toggletab', []);
      return deferred.promise;

    },

    showFavorites: function() {
      
      jsonRPC('showfavourites', []);
      return deferred.promise;

    },

    showWatchlist: function() {
      
      jsonRPC('showwatchlist', []);
      return deferred.promise;

    },

    showSettings: function() {
      
      jsonRPC('showsettings', []);
      return deferred.promise;

    },

    up: function() {
      
      jsonRPC('up', []);
      return deferred.promise;

    },

    down: function() {
      
      jsonRPC('down', []);
      return deferred.promise;

    },

    right: function() {
      
      jsonRPC('right', []);
      return deferred.promise;

    },

    left: function() {
      
      jsonRPC('left', []);
      return deferred.promise;

    },

    enter: function() {
      
      jsonRPC('enter', []);
      return deferred.promise;

    },

    getGenres: function() {

      jsonRPC('getgenres', []);
      return deferred.promise;

    },

    filterGenre: function(genre) {

      jsonRPC('filtergenre', [genre]);
      return deferred.promise;

    },

    getSorters: function() {

      jsonRPC('getsorters', []);
      return deferred.promise;

    },

    filterSorter: function(sorter) {

      jsonRPC('filtersorter', [sorter]);
      return deferred.promise;

    },

    back: function() {
      
      jsonRPC('back', []);
      return deferred.promise;

    },

    toggleMute: function() {
      
      jsonRPC('togglemute', []);
      return deferred.promise;

    },

    seasonUp: function() {

      jsonRPC('previousseason', []);
      return deferred.promise;

    },

    seasonDown: function() {

      jsonRPC('nextseason', []);
      return deferred.promise;

    },

    volume: function(volumeLevel) {

      jsonRPC('volume', [volumeLevel]);
      return deferred.promise;

    },

    subtitleOffset: function(offset) {

      jsonRPC('subtitleoffset', [offset]);
      return deferred.promise;

    },

    getPlaying: function() {

      jsonRPC('getplaying', []);
      return deferred.promise;
    
    },

    togglePlaying: function() {
      
      jsonRPC('toggleplaying', []);
      return deferred.promise;

    },

    toggleWatched: function() {
      
      jsonRPC('togglewatched', []);
      return deferred.promise;

    },

    toggleFavorite: function() {
      
      jsonRPC('togglefavourite', []);
      return deferred.promise;

    },

    getSubtitles: function() {
      
      jsonRPC('getsubtitles', []);
      return deferred.promise;

    },

    setSubtitle: function(language) {

      jsonRPC('setsubtitle', [language]);
      return deferred.promise;

    },

    toggleQuality: function() {
      
      jsonRPC('togglequality', []);
      return deferred.promise;

    },

    watchTrailer: function() {
      
      jsonRPC('watchtrailer', []);
      return deferred.promise;

    },

    getPlayers: function() {
      
      jsonRPC('getplayers', []);
      return deferred.promise;

    },

    setPlayer: function(player) {

      jsonRPC('setplayer', [player]);
      return deferred.promise;

    },

    toggleFullscreen: function() {
      
      jsonRPC('togglefullscreen', []);
      return deferred.promise;

    },

    filterSearch: function(searchString) {

      jsonRPC('filtersearch', [searchString]);
      return deferred.promise;

    },

    clearSearch: function() {

      jsonRPC('clearsearch', []);
      return deferred.promise;

    }

  }

}]);
