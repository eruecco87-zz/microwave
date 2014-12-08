angular.module('microwave.services', ['angular-json-rpc'])


/**
 * Service that interacts with localstorage to manage config params.
 */
.factory('Config', ['$window', function($window) {

  return {

    // Loads the localstorage config.
    load: function() {

      return JSON.parse($window.localStorage.getItem('microwave-config'));

    },

    // Saves the localstorage config.
    save: function(config) {

      $window.localStorage.setItem('microwave-config', angular.toJson(config));

    },

    // Clears the localstorage config.
    clear: function() {

      $window.localStorage.removeItem('microwave-config');

    }

  }

}])


/**
 * Popcorn Time API Wrapper.
 */
.factory('Popcorn', ['Config', '$http', '$q', function(Config, $http, $q) {

  // Global deferred object to return API responses.
  var deferred;
  
  // json RPC wrapper for API calls.
  var jsonRPC = function(method, params, configTest) {

    // Deferred object instantiation.
    deferred = $q.defer();

    // Sets the config for API calls.
    var apiConfig = configTest || Config.load(),
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
