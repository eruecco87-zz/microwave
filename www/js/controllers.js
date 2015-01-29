angular.module('microwave.controllers', ['ionic', 'microwave.services'])


/**
 * Configuration Page Controller.
 */
.controller('ConfigCtrl', ['$timeout', '$scope', '$location', '$ionicScrollDelegate', '$cordovaBarcodeScanner', '$translate', 'Config', 'Devices', 'Popcorn', function($timeout, $scope, $location, $ionicScrollDelegate, $cordovaBarcodeScanner, $translate, Config, Devices, Popcorn) { 

  // Check for device form submit to validate data.
  $scope.deviceSubmitAttempt = function() {

    $scope.deviceFormSubmitted = true;

  }

  // Saves the device form data.
  $scope.saveDevice = function(device) {

    // Sets the new device as active by default.
    device.active = true;

    // Saves the device.
    Devices.save(device);

    $scope.test = false; // Hides test information.
    $scope.saved = true; // Shows success message.
    $ionicScrollDelegate.anchorScroll('device-notifications');

    $timeout(function() {

      // Redirects to the devices tab.
      $location.path('/tab/devices');
      $scope.saved = false; 

    }, 1000);

  }

  // Pings the API to check for connection.
  $scope.testDevice = function(device) {

    $scope.test = true; // Displays test status.
    $ionicScrollDelegate.anchorScroll('device-notifications');

    // Hides test status after 3 seconds.
    $timeout(function() {

      $scope.test = false; // Hides test information.

    }, 2000);

    if (device) {

      Popcorn.ping(device).then(function(ping) {

        if ( ping.error ) {

          $scope.error = ping.error; // Displays test error.
          $scope.test = false // Hides test information.

        } else {

          $scope.connected = ping; // Displays test information.
          $scope.error = false; // Removes test error if any.

        }

      });

    }

  }

  $scope.readQR = function() {

     $cordovaBarcodeScanner.scan().then(function(QR) {

        var deviceData = JSON.parse(QR.text);

        // Calls the translation service before assigning the read data.
        $translate(['CONFIG.scannedDeviceName']).then(function(translations) {

          $scope.device = {
            name: translations['CONFIG.scannedDeviceName'],
            ip: deviceData.ip,
            port: deviceData.port,
            user: deviceData.user,
            pass: deviceData.pass
          };

        });

      }, function(error) {

        console.log("An error happened -> " + error);

      });

  }

  // Get a list of all available languages.
  $scope.languages = Config.listLanguages();

  // Run through each available language to match with selected language.
  angular.forEach($scope.languages, function(val, index) {

    if ( val.key === Config.getLanguage() ) {

      $scope.language = $scope.languages[index];

    }

  });

  // Set the language to the received language key.
  $scope.setLanguage = function(language) {

    Config.setLanguage(language.key);

    // Immediatly translate the app to the selected language.
    $translate.use(Config.getLanguage());

    $scope.languageSaved = true; // Shows success message.

    $timeout(function() {

      $scope.languageSaved = false; // Hides success message.

    }, 1000);

  }

}])


/**
 * Devices List Controller.
 */
.controller('DevicesCtrl', ['$scope', 'Devices', function($scope, Devices) {

  // Gets the device list.
  $scope.devices = Devices.list();

}])


/**
 * Devices Details Controller.
 */
.controller('DevicesDetailsCtrl', ['$timeout', '$scope', '$stateParams', '$translate', '$ionicPopup', '$location', 'Devices', 'Popcorn', function($timeout, $scope, $stateParams, $translate, $ionicPopup, $location, Devices, Popcorn) {

  // Gets the device list.
  $scope.device = Devices.get($stateParams.deviceId);

  // Check for form submit to validate data.
  $scope.submitAttempt = function() {

    $scope.formSubmitted = true;

  }

  // Saves the device form data.
  $scope.editDevice = function(config) {

    Devices.edit(config, $stateParams.deviceId);

    $scope.test = false; // Hides test information.
    $scope.saved = true; // Shows success message.

    $timeout(function() {

      // Redirects to the devices tab.
      $location.path('/tab/devices');
      $scope.saved = false; 

    }, 1000);

  }

  // Pings the API to check for connection.
  $scope.testDevice = function(config) {

    $scope.test = true; // Displays test status.

    // Hides test status after 3 seconds.
    $timeout(function() {

      $scope.test = false; // Hides test information.

    }, 2000);

    Popcorn.ping(config).then(function(ping) {

      if ( ping.error ) {

        $scope.error = ping.error; // Displays test error.
        $scope.test = false // Hides test information.

      } else {

        $scope.connected = ping; // Displays test information.
        $scope.error = false; // Removes test error if any.

      }

    });

  }

  // Sets the device being edited as active.
  $scope.setActive = function() {

    // Sets the selected item as active;
    Devices.setActive($stateParams.deviceId);

    // Redirects to the devices tab.
    $location.path('/tab/devices');

    // Upatdes the scope with the current list.
    $scope.devices = Devices.list();

  }

  // Removes the selected device from localstorage.
  $scope.remove = function() {

    // Calls the translation service before initializing the delete modal.
    $translate(['DEVICES_DETAILS.deleteModal.deleteModalTitle', 'DEVICES_DETAILS.deleteModal.deleteModalText', 'DEVICES_DETAILS.deleteModal.deleteModalCancel', 'DEVICES_DETAILS.deleteModal.deleteModalDelete']).then(function(translations) {

      $scope.translations = translations;

      $ionicPopup.show({
        template: '<p>'+ $scope.translations['DEVICES_DETAILS.deleteModal.deleteModalText'] +'</p>',
        title: $scope.translations['DEVICES_DETAILS.deleteModal.deleteModalTitle'],
        scope: $scope,
        buttons: [
          { 
            text: $scope.translations['DEVICES_DETAILS.deleteModal.deleteModalCancel'],
            type: 'button-small'
          },
          {
            text: '<b>'+ $scope.translations['DEVICES_DETAILS.deleteModal.deleteModalDelete'] +'</b>',
            type: 'button-assertive button-small',
            onTap: function(event) {

              Devices.remove($stateParams.deviceId);

              // Redirects to the devices tab.
              $location.path('/tab/devices');

              // Upatdes the scope with the current list.
              $scope.devices = Devices.list();

            }
          },
        ]
      });

    });

  }

}])


/**
 * Remote Control Controller.
 */
.controller('RemoteCtrl', ['$scope', '$timeout', '$location', '$translate', '$ionicLoading', '$ionicPopup', 'Devices', 'Popcorn', function($scope, $timeout, $location, $translate, $ionicLoading, $ionicPopup, Devices, Popcorn) {

  // Get all stored devices.
  var devicesList = Devices.list();

  // If there are devices stored try to ping the active device on load.
  if ( devicesList && devicesList.length > 0 ) {

    // Shows a connecting message while the API is being pinged to check for conenction.
    $translate(['REMOTE.messages.connectingMessage']).then(function(translations) {

      $scope.translations = translations;

      // Show a Connecting Message.
      $ionicLoading.show({
        template: $scope.translations['REMOTE.messages.connectingMessage'],
        duration: false
      });

    });

    // Ping the api when the remote tab is opened to check for connection.
    Popcorn.ping().then(function(ping) {

      // When the API was succesfuly reached.
      if ( ping.result ) {

        $ionicLoading.hide();

        // Calls the translation service before initializing the Connected Message.
        $translate(['REMOTE.messages.connectedMessage']).then(function(translations) {

          $scope.translations = translations;

          // Show a Connected Message and dismiss the message after 1 second.
          $ionicLoading.show({
            template: $scope.translations['REMOTE.messages.connectedMessage'],
            duration: 1000
          });

        });

      } else {

        $ionicLoading.hide();
        
        // Calls the translation service before initializing the Failed Connection Modal.
        $translate(['REMOTE.pingModal.pingModalTitle', 'REMOTE.pingModal.pingModalText', 'REMOTE.pingModal.pingModalDismiss', 'REMOTE.pingModal.pingModalDevices']).then(function(translations) {

          $scope.translations = translations;

          // Show a message when the API cannot be reached.
          $ionicPopup.show({
            template: '<p>'+ $scope.translations['REMOTE.pingModal.pingModalText'] +'</p>',
            title: $scope.translations['REMOTE.pingModal.pingModalTitle'],
            scope: $scope,
            buttons: [
              { 
                text: $scope.translations['REMOTE.pingModal.pingModalDismiss'],
                type: 'button-small'
              },
              {
                text: '<b>'+ $scope.translations['REMOTE.pingModal.pingModalDevices'] +'</b>',
                type: 'button-assertive button-small',
                onTap: function(event) {

                  $location.path('/tab/devices');

                }
              },
            ]
          });

        });

      }

    });

  }

  if ( !devicesList || devicesList.length === 0 ) {

    // Timeout needed for the translation service to kick in.
    $timeout(function() {

      // Calls the translation service before initializing the No Device Added Modal.
      $translate(['REMOTE.noDeviceModal.noDeviceModalTitle', 'REMOTE.noDeviceModal.noDeviceModalText', 'REMOTE.noDeviceModal.noDeviceModalDismiss', 'REMOTE.noDeviceModal.noDeviceModalAdd']).then(function(translations) {

        $scope.translations = translations;

        // Show a message when there are no devices Added.
        $ionicPopup.show({
          template: '<p>'+ $scope.translations['REMOTE.noDeviceModal.noDeviceModalText'] +'</p>',
          title: $scope.translations['REMOTE.noDeviceModal.noDeviceModalTitle'],
          scope: $scope,
          buttons: [
            { 
              text: $scope.translations['REMOTE.noDeviceModal.noDeviceModalDismiss'],
              type: 'button-small'
            },
            {
              text: '<b>'+ $scope.translations['REMOTE.noDeviceModal.noDeviceModalAdd'] +'</b>',
              type: 'button-assertive button-small',
              onTap: function(event) {

                $location.path('/tab/config');

              }
            },
          ]
        });

      });

    }, 100);
  }

  // Popcorn Service Calls
  $scope.toggleTab = function() {
    Popcorn.toggleTab();
  };

  $scope.showFavorites = function() {
    Popcorn.showFavorites();
  };

  $scope.showWatchlist = function() {
    Popcorn.showWatchlist();
  };

  $scope.showSettings = function() {
    Popcorn.showSettings();
  };

  $scope.up = function() {
    Popcorn.up();
  };

  $scope.down = function() {
    Popcorn.down();
  };

  $scope.left = function() {
    Popcorn.left();
  };

  $scope.right = function() {
    Popcorn.right();
  };

  $scope.enter = function() {
    Popcorn.enter();
  };

  $scope.showFilterOptions = function() {

    $scope.filterOption = {};

    Popcorn.getGenres().then(function(genres) {

      $scope.genresList = genres.result.genres;

      // Calls the translation service before initializing the filter modal.
      $translate(['REMOTE.filterModal.filterModalTitle', 'REMOTE.filterModal.filterModalDropdown', 'REMOTE.filterModal.filterModalCancel', 'REMOTE.filterModal.filterModalFilter']).then(function(translations) {

        $scope.translations = translations;

        // Displays filter modal.
        $ionicPopup.show({
          template: '<div class="list"><label class="item item-input item-select"><div class="input-label">'+ $scope.translations['REMOTE.filterModal.filterModalDropdown'] +'</div><select name="genre" ng-model="filterOption.genre" ng-options="o as o for o in genresList"></select></label></div>',
          title: $scope.translations['REMOTE.filterModal.filterModalTitle'],
          scope: $scope,
          buttons: [
            { 
              text: $scope.translations['REMOTE.filterModal.filterModalCancel'],
              type: 'button-small'
            },
            {
              text: '<b>'+ $scope.translations['REMOTE.filterModal.filterModalFilter'] +'</b>',
              type: 'button-assertive button-small',
              onTap: function(event) {

                var selectedGenre = $scope.filterOption.genre || 'All';
                
                Popcorn.filterGenre(selectedGenre);

              }
            },
          ]
        });

      });

    });

  };

  $scope.showSortOptions = function() {

    $scope.sortOption = {};

    Popcorn.getSorters().then(function(sorters) {

      $scope.sortersList = sorters.result.sorters;

      // Calls the translation service before initializing the sort modal.
      $translate(['REMOTE.sortModal.sortModalTitle', 'REMOTE.sortModal.sortModalDropdown', 'REMOTE.sortModal.sortModalCancel', 'REMOTE.sortModal.sortModalSort']).then(function(translations) {

        $scope.translations = translations;

        $ionicPopup.show({
          template: '<div class="list"><label class="item item-input item-select"><div class="input-label">'+ $scope.translations['REMOTE.sortModal.sortModalDropdown'] +'</div><select name="sort" ng-model="sortOption.sort" ng-options="o as o for o in sortersList"></select></label></div>',
          title: $scope.translations['REMOTE.sortModal.sortModalTitle'],
          scope: $scope,
          buttons: [
            { 
              text: $scope.translations['REMOTE.sortModal.sortModalCancel'],
              type: 'button-small'
            },
            {
              text: '<b>'+ $scope.translations['REMOTE.sortModal.sortModalSort'] +'</b>',
              type: 'button-assertive button-small',
              onTap: function(event) {

                var selectedSorter = $scope.sortOption.sort || 'popularity';
                
                Popcorn.filterSorter(selectedSorter);

              }
            },
          ]
        });

      });

    });

  };

  $scope.back = function() {
    Popcorn.back();
  };

  $scope.toggleMute = function() {
    Popcorn.toggleMute();
  };

  $scope.seasonUp = function() {
    Popcorn.seasonUp();
  };

  $scope.seasonDown = function() {
    Popcorn.seasonDown();
  };

  $scope.volumeUp = function() {
    
    Popcorn.getPlaying().then(function(response) {
      
      if ( response.result.volume === 1 ) {

        return;

      } else {

        Popcorn.volume(response.result.volume + 0.1);

      }

    });

  };

  $scope.volumeDown = function() {
    
    Popcorn.getPlaying().then(function(response) {
      
      if ( response.result.volume === 0 ) {

        return;

      } else {

        Popcorn.volume(response.result.volume - 0.1);

      }

    });

  };

  $scope.subtitleOffsetLess = function() {

    Popcorn.subtitleOffset(0.5);

  };

  $scope.subtitleOffsetMore = function() {


    Popcorn.subtitleOffset(-0.5);

  };

  $scope.play = function() {
    
    Popcorn.getPlaying().then(function(response) {
      
      if ( response.result.playing === false ) {

        Popcorn.togglePlaying();

      } 

    });

  };

  $scope.pause = function() {
    
    Popcorn.getPlaying().then(function(response) {
      
      if ( response.result.playing === true ) {

        Popcorn.togglePlaying();

      } 

    });

  };

  $scope.backward = function() {
    Popcorn.left();
  };

  $scope.forward = function() {
    Popcorn.right();
  };

  $scope.toggleWatched = function() {
    Popcorn.toggleWatched();
  };

  $scope.toggleFavorite = function() {
    Popcorn.toggleFavorite();
  };

  $scope.showSubtitleList = function() {

    $scope.subtitleOption = {};

    Popcorn.getSubtitles().then(function(subtitles) {

      $scope.subtitleList = subtitles.result.subtitles;

      // Calls the translation service before initializing the subtitles modal.
      $translate(['REMOTE.subtitlesModal.subtitlesModalTitle', 'REMOTE.subtitlesModal.subtitlesModalDropdown', 'REMOTE.subtitlesModal.subtitlesModalCancel', 'REMOTE.subtitlesModal.subtitlesModalSet']).then(function(translations) {

        $scope.translations = translations;

        $ionicPopup.show({
          template: '<div class="list"><label class="item item-input item-select"><div class="input-label">'+ $scope.translations['REMOTE.subtitlesModal.subtitlesModalDropdown'] +'</div><select name="language" ng-model="subtitleOption.subtitle" ng-options="o as o for o in subtitleList"></select></label></div>',
          title: $scope.translations['REMOTE.subtitlesModal.subtitlesModalTitle'],
          scope: $scope,
          buttons: [
            { 
              text: $scope.translations['REMOTE.subtitlesModal.subtitlesModalCancel'],
              type: 'button-small'
            },
            {
              text: '<b>'+ $scope.translations['REMOTE.subtitlesModal.subtitlesModalSet'] +'</b>',
              type: 'button-assertive button-small',
              onTap: function(event) {

                var selectedSubtitle = $scope.subtitleOption.subtitle || '';
                
                Popcorn.setSubtitle(selectedSubtitle);

              }
            },
          ]
        });

      });

    });

  };

  $scope.toggleQuality = function() {
    Popcorn.toggleQuality();
  };

  $scope.watchTrailer = function() {
    Popcorn.watchTrailer();
  };

  $scope.showPlayerList = function() {

    $scope.playerOption = {};

    var playerLIst = [];

    Popcorn.getPlayers().then(function(players) {

      players.result.players.forEach(function(element, index, array) {

        playerLIst.push(element.id);

      });

      $scope.playersList = playerLIst;

      // Calls the translation service before initializing the player modal.
      $translate(['REMOTE.playerModal.playerModalTitle', 'REMOTE.playerModal.playerModalDropdown', 'REMOTE.playerModal.playerModalCancel', 'REMOTE.playerModal.playerModalSelect']).then(function(translations) {

        $scope.translations = translations;

        $ionicPopup.show({
          template: '<div class="list"><label class="item item-input item-select"><div class="input-label">'+ $scope.translations['REMOTE.playerModal.playerModalDropdown'] +'</div><select name="player" ng-model="playerOption.player" ng-options="o as o for o in playersList"></select></label></div>',
          title: $scope.translations['REMOTE.playerModal.playerModalTitle'],
          scope: $scope,
          buttons: [
            { 
              text: $scope.translations['REMOTE.playerModal.playerModalCancel'],
              type: 'button-small'
            },
            {
              text: '<b>'+ $scope.translations['REMOTE.playerModal.playerModalSelect'] +'</b>',
              type: 'button-assertive button-small',
              onTap: function(event) {

                var selectedPlayer = $scope.playerOption.player || '';
                
                Popcorn.setPlayer(selectedPlayer);

              }
            },
          ]
        });

      });

    });

  };

  $scope.toggleFullscreen = function() {
    Popcorn.toggleFullscreen();
  };


  $scope.searchString = {};
  $scope.showSearchForm = function() {

    // Calls the translation service before initializing the search modal.
    $translate(['REMOTE.searchModal.searchModalTitle', 'REMOTE.searchModal.searchModalCancel', 'REMOTE.searchModal.searchModalClear', 'REMOTE.searchModal.searchModalGo']).then(function(translations) {

      $scope.translations = translations;

      var searchModal = $ionicPopup.show({
        template: '<label class="item item-input"><input type="text" ng-model="searchString.term"></label>',
        title: $scope.translations['REMOTE.searchModal.searchModalTitle'],
        scope: $scope,
        buttons: [
          { 
            text: $scope.translations['REMOTE.searchModal.searchModalCancel'],
            type: 'button-small' 
          },
          { 
            text: $scope.translations['REMOTE.searchModal.searchModalClear'], 
            type: 'button-energized button-small',
            onTap: function(event) {

              $scope.searchString.term = '';
              Popcorn.clearSearch();

            }
          },
          {
            text: '<b>'+ $scope.translations['REMOTE.searchModal.searchModalGo'] +'</b>',
            type: 'button-assertive button-small',
            onTap: function(event) {

              Popcorn.filterSearch($scope.searchString.term);

            }
          },
        ]
      });

    });

  };

}])
