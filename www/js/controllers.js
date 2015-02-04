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
.controller('DevicesCtrl', ['$scope', '$location', '$ionicTabsDelegate', 'Devices', function($scope, $location, $ionicTabsDelegate, Devices) {

  // Gets the device list.
  $scope.devices = Devices.list();

  // Navigate to the config tab.
  $scope.addDevice = function() {

    // Set the correct animation direction to get to the config tab.
    $ionicTabsDelegate._instances[0].$scope.tabAnimation = 'left-right';

    // Redirects to the config tab.
    $location.path('/tab/config');

  },

  $scope.editDevice = function(index) {

    $location.path('/tab/devices/' + index);

    // Emit Device Feedback if enabled.
    window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

      DF = window.plugins.deviceFeedback;

      if( feedback.haptic && feedback.acoustic ) {

        DF.haptic(DF.VIRTUAL_KEY);
        DF.acoustic(DF.VIRTUAL_KEY);

      } else if( feedback.haptic ) {

        DF.haptic(DF.VIRTUAL_KEY);

      } else if( feedback.acoustic ) {

        DF.acoustic(DF.VIRTUAL_KEY);

      }

    });

  }

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
            type: 'button-small',
            onTap: function() {

              // Emit Device Feedback if enabled.
              window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

                DF = window.plugins.deviceFeedback;

                if( feedback.haptic && feedback.acoustic ) {

                  DF.haptic(DF.VIRTUAL_KEY);
                  DF.acoustic(DF.VIRTUAL_KEY);

                } else if( feedback.haptic ) {

                  DF.haptic(DF.VIRTUAL_KEY);

                } else if( feedback.acoustic ) {

                  DF.acoustic(DF.VIRTUAL_KEY);

                }

              });

            }
          },
          {
            text: '<b>'+ $scope.translations['DEVICES_DETAILS.deleteModal.deleteModalDelete'] +'</b>',
            type: 'button-assertive button-small',
            onTap: function(event) {

              Devices.remove($stateParams.deviceId);

              // Emit Device Feedback if enabled.
              window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

                DF = window.plugins.deviceFeedback;

                if( feedback.haptic && feedback.acoustic ) {

                  DF.haptic(DF.VIRTUAL_KEY);
                  DF.acoustic(DF.VIRTUAL_KEY);

                } else if( feedback.haptic ) {

                  DF.haptic(DF.VIRTUAL_KEY);

                } else if( feedback.acoustic ) {

                  DF.acoustic(DF.VIRTUAL_KEY);

                }

              });

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
.controller('RemoteCtrl', ['$scope', '$timeout', '$location', '$translate', '$ionicLoading', '$ionicPopup', '$ionicTabsDelegate', '$ionicActionSheet', 'Devices', 'Popcorn', function($scope, $timeout, $location, $translate, $ionicLoading, $ionicPopup, $ionicTabsDelegate, $ionicActionSheet, Devices, Popcorn) {

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
                type: 'button-small',
                onTap: function() {

                  // Emit Device Feedback if enabled.
                  window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

                    DF = window.plugins.deviceFeedback;

                    if( feedback.haptic && feedback.acoustic ) {

                      DF.haptic(DF.VIRTUAL_KEY);
                      DF.acoustic(DF.VIRTUAL_KEY);

                    } else if( feedback.haptic ) {

                      DF.haptic(DF.VIRTUAL_KEY);

                    } else if( feedback.acoustic ) {

                      DF.acoustic(DF.VIRTUAL_KEY);

                    }

                  });

                }
              },
              {
                text: '<b>'+ $scope.translations['REMOTE.pingModal.pingModalDevices'] +'</b>',
                type: 'button-assertive button-small',
                onTap: function(event) {

                  // Emit Device Feedback if enabled.
                  window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

                    DF = window.plugins.deviceFeedback;

                    if( feedback.haptic && feedback.acoustic ) {

                      DF.haptic(DF.VIRTUAL_KEY);
                      DF.acoustic(DF.VIRTUAL_KEY);

                    } else if( feedback.haptic ) {

                      DF.haptic(DF.VIRTUAL_KEY);

                    } else if( feedback.acoustic ) {

                      DF.acoustic(DF.VIRTUAL_KEY);

                    }

                  });

                  // Set the correct animation direction to get to the devices tab.
                  $ionicTabsDelegate._instances[0].$scope.tabAnimation = 'left-right';

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
              type: 'button-small',
              onTap: function() {

                // Emit Device Feedback if enabled.
                window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

                  DF = window.plugins.deviceFeedback;

                  if( feedback.haptic && feedback.acoustic ) {

                    DF.haptic(DF.VIRTUAL_KEY);
                    DF.acoustic(DF.VIRTUAL_KEY);

                  } else if( feedback.haptic ) {

                    DF.haptic(DF.VIRTUAL_KEY);

                  } else if( feedback.acoustic ) {

                    DF.acoustic(DF.VIRTUAL_KEY);

                  }

                });

              }
            },
            {
              text: '<b>'+ $scope.translations['REMOTE.noDeviceModal.noDeviceModalAdd'] +'</b>',
              type: 'button-assertive button-small',
              onTap: function(event) {

                // Emit Device Feedback if enabled.
                window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

                  DF = window.plugins.deviceFeedback;

                  if( feedback.haptic && feedback.acoustic ) {

                    DF.haptic(DF.VIRTUAL_KEY);
                    DF.acoustic(DF.VIRTUAL_KEY);

                  } else if( feedback.haptic ) {

                    DF.haptic(DF.VIRTUAL_KEY);

                  } else if( feedback.acoustic ) {

                    DF.acoustic(DF.VIRTUAL_KEY);

                  }

                });

                // Set the correct animation direction to get to the config tab.
                $ionicTabsDelegate._instances[0].$scope.tabAnimation = 'left-right';

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

  $scope.showTabs = function() {

    // Calls the translation service before initializing the Tabs Action Sheet.
    $translate(['REMOTE.tabSelector.tabSelectorTitle', 'REMOTE.tabSelector.movies', 'REMOTE.tabSelector.shows', 'REMOTE.tabSelector.anime', 'REMOTE.tabSelector.tabSelectorCancel']).then(function(translations) {

      $scope.translations = translations;

      // Shows action sheet with the Popcorn Tabs options.
      $ionicActionSheet.show({
        titleText: '<b>'+ $scope.translations['REMOTE.tabSelector.tabSelectorTitle'] +'</b>',
        buttons: [
          { text: '<b>'+ $scope.translations['REMOTE.tabSelector.movies'] +'</b>' },
          { text: '<b>'+ $scope.translations['REMOTE.tabSelector.shows'] +'</b>' },
          { text: '<b>'+ $scope.translations['REMOTE.tabSelector.anime'] +'</b>' },
        ],
        buttonClicked: function(index) {
          
          // Call the appropriate tab.
          switch(index) {

            case 0: 
              Popcorn.moviesList();
              break;

            case 1: 
              Popcorn.showsList();
              break;

            case 2: 
              Popcorn.animeList();
              break;

          }

          // Emit Device Feedback if enabled.
          window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

            DF = window.plugins.deviceFeedback;

            if( feedback.haptic && feedback.acoustic ) {

              DF.haptic(DF.VIRTUAL_KEY);
              DF.acoustic(DF.VIRTUAL_KEY);

            } else if( feedback.haptic ) {

              DF.haptic(DF.VIRTUAL_KEY);

            } else if( feedback.acoustic ) {

              DF.acoustic(DF.VIRTUAL_KEY);

            }

          });

          return true;

        },
        cancelText: '<span class="assertive">'+ $scope.translations['REMOTE.tabSelector.tabSelectorCancel'] +'</span>',
        cancel: function() {

          // Emit Device Feedback if enabled.
          window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

            DF = window.plugins.deviceFeedback;

            if( feedback.haptic && feedback.acoustic ) {

              DF.haptic(DF.VIRTUAL_KEY);
              DF.acoustic(DF.VIRTUAL_KEY);

            } else if( feedback.haptic ) {

              DF.haptic(DF.VIRTUAL_KEY);

            } else if( feedback.acoustic ) {

              DF.acoustic(DF.VIRTUAL_KEY);

            }

          });

        }
      });

    });

  }

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
          template: '<div class="list"><label class="item item-input item-select"><div class="input-label">'+ $scope.translations['REMOTE.filterModal.filterModalDropdown'] +'</div><select name="genre" ng-model="filterOption.genre" ng-options="o as o for o in genresList" device-feedback></select></label></div>',
          title: $scope.translations['REMOTE.filterModal.filterModalTitle'],
          scope: $scope,
          buttons: [
            { 
              text: $scope.translations['REMOTE.filterModal.filterModalCancel'],
              type: 'button-small',
              onTap: function() {

                // Emit Device Feedback if enabled.
                window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

                  DF = window.plugins.deviceFeedback;

                  if( feedback.haptic && feedback.acoustic ) {

                    DF.haptic(DF.VIRTUAL_KEY);
                    DF.acoustic(DF.VIRTUAL_KEY);

                  } else if( feedback.haptic ) {

                    DF.haptic(DF.VIRTUAL_KEY);

                  } else if( feedback.acoustic ) {

                    DF.acoustic(DF.VIRTUAL_KEY);

                  }

                });

              }
            },
            {
              text: '<b>'+ $scope.translations['REMOTE.filterModal.filterModalFilter'] +'</b>',
              type: 'button-assertive button-small',
              onTap: function(event) {

                var selectedGenre = $scope.filterOption.genre || 'All';
                
                Popcorn.filterGenre(selectedGenre);

                // Emit Device Feedback if enabled.
                window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

                  DF = window.plugins.deviceFeedback;

                  if( feedback.haptic && feedback.acoustic ) {

                    DF.haptic(DF.VIRTUAL_KEY);
                    DF.acoustic(DF.VIRTUAL_KEY);

                  } else if( feedback.haptic ) {

                    DF.haptic(DF.VIRTUAL_KEY);

                  } else if( feedback.acoustic ) {

                    DF.acoustic(DF.VIRTUAL_KEY);

                  }

                });

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
          template: '<div class="list"><label class="item item-input item-select"><div class="input-label">'+ $scope.translations['REMOTE.sortModal.sortModalDropdown'] +'</div><select name="sort" ng-model="sortOption.sort" ng-options="o as o for o in sortersList" device-feedback></select></label></div>',
          title: $scope.translations['REMOTE.sortModal.sortModalTitle'],
          scope: $scope,
          buttons: [
            { 
              text: $scope.translations['REMOTE.sortModal.sortModalCancel'],
              type: 'button-small',
              onTap: function() {

                // Emit Device Feedback if enabled.
                window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

                  DF = window.plugins.deviceFeedback;

                  if( feedback.haptic && feedback.acoustic ) {

                    DF.haptic(DF.VIRTUAL_KEY);
                    DF.acoustic(DF.VIRTUAL_KEY);

                  } else if( feedback.haptic ) {

                    DF.haptic(DF.VIRTUAL_KEY);

                  } else if( feedback.acoustic ) {

                    DF.acoustic(DF.VIRTUAL_KEY);

                  }

                });

              }
            },
            {
              text: '<b>'+ $scope.translations['REMOTE.sortModal.sortModalSort'] +'</b>',
              type: 'button-assertive button-small',
              onTap: function(event) {

                var selectedSorter = $scope.sortOption.sort || 'popularity';
                
                Popcorn.filterSorter(selectedSorter);

                // Emit Device Feedback if enabled.
                window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

                  DF = window.plugins.deviceFeedback;

                  if( feedback.haptic && feedback.acoustic ) {

                    DF.haptic(DF.VIRTUAL_KEY);
                    DF.acoustic(DF.VIRTUAL_KEY);

                  } else if( feedback.haptic ) {

                    DF.haptic(DF.VIRTUAL_KEY);

                  } else if( feedback.acoustic ) {

                    DF.acoustic(DF.VIRTUAL_KEY);

                  }

                });

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
          template: '<div class="list"><label class="item item-input item-select"><div class="input-label">'+ $scope.translations['REMOTE.subtitlesModal.subtitlesModalDropdown'] +'</div><select name="language" ng-model="subtitleOption.subtitle" ng-options="o as o for o in subtitleList" device-feedback></select></label></div>',
          title: $scope.translations['REMOTE.subtitlesModal.subtitlesModalTitle'],
          scope: $scope,
          buttons: [
            { 
              text: $scope.translations['REMOTE.subtitlesModal.subtitlesModalCancel'],
              type: 'button-small',
              onTap: function() {

                // Emit Device Feedback if enabled.
                window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

                  DF = window.plugins.deviceFeedback;

                  if( feedback.haptic && feedback.acoustic ) {

                    DF.haptic(DF.VIRTUAL_KEY);
                    DF.acoustic(DF.VIRTUAL_KEY);

                  } else if( feedback.haptic ) {

                    DF.haptic(DF.VIRTUAL_KEY);

                  } else if( feedback.acoustic ) {

                    DF.acoustic(DF.VIRTUAL_KEY);

                  }

                });

              }
            },
            {
              text: '<b>'+ $scope.translations['REMOTE.subtitlesModal.subtitlesModalSet'] +'</b>',
              type: 'button-assertive button-small',
              onTap: function(event) {

                var selectedSubtitle = $scope.subtitleOption.subtitle || '';
                
                Popcorn.setSubtitle(selectedSubtitle);

                // Emit Device Feedback if enabled.
                window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

                  DF = window.plugins.deviceFeedback;

                  if( feedback.haptic && feedback.acoustic ) {

                    DF.haptic(DF.VIRTUAL_KEY);
                    DF.acoustic(DF.VIRTUAL_KEY);

                  } else if( feedback.haptic ) {

                    DF.haptic(DF.VIRTUAL_KEY);

                  } else if( feedback.acoustic ) {

                    DF.acoustic(DF.VIRTUAL_KEY);

                  }

                });

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
          template: '<div class="list"><label class="item item-input item-select"><div class="input-label">'+ $scope.translations['REMOTE.playerModal.playerModalDropdown'] +'</div><select name="player" ng-model="playerOption.player" ng-options="o as o for o in playersList" device-feedback></select></label></div>',
          title: $scope.translations['REMOTE.playerModal.playerModalTitle'],
          scope: $scope,
          buttons: [
            { 
              text: $scope.translations['REMOTE.playerModal.playerModalCancel'],
              type: 'button-small',
              onTap: function() {

                // Emit Device Feedback if enabled.
                window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

                  DF = window.plugins.deviceFeedback;

                  if( feedback.haptic && feedback.acoustic ) {

                    DF.haptic(DF.VIRTUAL_KEY);
                    DF.acoustic(DF.VIRTUAL_KEY);

                  } else if( feedback.haptic ) {

                    DF.haptic(DF.VIRTUAL_KEY);

                  } else if( feedback.acoustic ) {

                    DF.acoustic(DF.VIRTUAL_KEY);

                  }

                });

              }
            },
            {
              text: '<b>'+ $scope.translations['REMOTE.playerModal.playerModalSelect'] +'</b>',
              type: 'button-assertive button-small',
              onTap: function(event) {

                var selectedPlayer = $scope.playerOption.player || '';
                
                Popcorn.setPlayer(selectedPlayer);

                // Emit Device Feedback if enabled.
                window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

                  DF = window.plugins.deviceFeedback;

                  if( feedback.haptic && feedback.acoustic ) {

                    DF.haptic(DF.VIRTUAL_KEY);
                    DF.acoustic(DF.VIRTUAL_KEY);

                  } else if( feedback.haptic ) {

                    DF.haptic(DF.VIRTUAL_KEY);

                  } else if( feedback.acoustic ) {

                    DF.acoustic(DF.VIRTUAL_KEY);

                  }

                });

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
        template: '<label class="item item-input"><input type="text" ng-model="searchString.term" device-feedback></label>',
        title: $scope.translations['REMOTE.searchModal.searchModalTitle'],
        scope: $scope,
        buttons: [
          { 
            text: $scope.translations['REMOTE.searchModal.searchModalCancel'],
            type: 'button-small',
            onTap: function() {

              // Emit Device Feedback if enabled.
                window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

                  DF = window.plugins.deviceFeedback;

                  if( feedback.haptic && feedback.acoustic ) {

                    DF.haptic(DF.VIRTUAL_KEY);
                    DF.acoustic(DF.VIRTUAL_KEY);

                  } else if( feedback.haptic ) {

                    DF.haptic(DF.VIRTUAL_KEY);

                  } else if( feedback.acoustic ) {

                    DF.acoustic(DF.VIRTUAL_KEY);

                  }

                });

            }
          },
          { 
            text: $scope.translations['REMOTE.searchModal.searchModalClear'], 
            type: 'button-energized button-small',
            onTap: function(event) {

              $scope.searchString.term = '';
              Popcorn.clearSearch();

              // Emit Device Feedback if enabled.
              window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

                DF = window.plugins.deviceFeedback;

                if( feedback.haptic && feedback.acoustic ) {

                  DF.haptic(DF.VIRTUAL_KEY);
                  DF.acoustic(DF.VIRTUAL_KEY);

                } else if( feedback.haptic ) {

                  DF.haptic(DF.VIRTUAL_KEY);

                } else if( feedback.acoustic ) {

                  DF.acoustic(DF.VIRTUAL_KEY);

                }

              });

            }
          },
          {
            text: '<b>'+ $scope.translations['REMOTE.searchModal.searchModalGo'] +'</b>',
            type: 'button-assertive button-small',
            onTap: function(event) {

              Popcorn.filterSearch($scope.searchString.term);

              // Emit Device Feedback if enabled.
              window.plugins.deviceFeedback.isFeedbackEnabled(function(feedback) {

                DF = window.plugins.deviceFeedback;

                if( feedback.haptic && feedback.acoustic ) {

                  DF.haptic(DF.VIRTUAL_KEY);
                  DF.acoustic(DF.VIRTUAL_KEY);

                } else if( feedback.haptic ) {

                  DF.haptic(DF.VIRTUAL_KEY);

                } else if( feedback.acoustic ) {

                  DF.acoustic(DF.VIRTUAL_KEY);

                }

              });

            }
          },
        ]
      });

    });

  };

}])


/**
 * Side Drawer Controller.
 */
.controller('SideDrawerCtrl', ['$scope', '$ionicSideMenuDelegate', '$ionicLoading', '$translate', 'Popcorn', 'OMDB', 'TRAKT', function($scope, $ionicSideMenuDelegate, $ionicLoading, $translate, Popcorn, OMDB, TRAKT) {

  // Check if the Side Drawer is open
  $scope.$watch($ionicSideMenuDelegate.isOpenRight, function(isOpen) { 
    
    if (isOpen) {

      // Get information about whats currently playing.
      Popcorn.getPlaying().then(function(playing) {

        // Checks if the user is currently watching something (even if its paused).
        if ( playing && playing.result.title ) {

          $scope.watching = true;
          $scope.isMovie = playing.result.movie; // Check if whats being played is a movie.

        } else {

          $scope.watching = false;

        }

        // If a movie is being played.
        if ( $scope.watching && $scope.isMovie ) {

          // Shows a Fetching Information message while getting the information.
          $translate(['SIDE.loading']).then(function(translations) {

            $scope.translations = translations;

            $ionicLoading.show({
              template: $scope.translations['SIDE.loading'],
              duration: 15000
            });

          });

          // Hides all the information cards.
          $scope.movie = false;
          $scope.show = false;
          $scope.anime = false;

          // Gets the OMDB information for the movie.
          OMDB.getById(playing.result.imdb_id).then(function(omdb) {

            $scope.id = omdb.imdbID;
            $scope.poster = omdb.Poster;
            $scope.title = omdb.Title;
            $scope.year = omdb.Year;
            $scope.runTime = omdb.Runtime;
            $scope.plot = omdb.Plot;
            $scope.genre = omdb.Genre;
            $scope.director = omdb.Director;
            $scope.rating = omdb.imdbRating;

            // Show the movie information card.
            $scope.movie = true;

            $ionicLoading.hide();

          });

        }

        // If a tv show or anime is being played.
        if ( $scope.watching && !$scope.isMovie ) {

          // If the id is not numeric then get Anime data.
          if ( isNaN(playing.result.tvdb_id) ) {

            // Hides all the information cards and show the anime information card.
            $scope.movie = false;
            $scope.show = false;
            $scope.anime = true;

            // TO-DO: Get data for anime series.

          } 

          // If the id is numeric then get TV Show data.
          else {

            // Shows a Fetching Information message while getting the information.
            $translate(['SIDE.loading']).then(function(translations) {

              $scope.translations = translations;

              $ionicLoading.show({
                template: $scope.translations['SIDE.loading'],
                duration: 15000
              });

            });

            // Hides all the information cards.
            $scope.movie = false;
            $scope.show = false;
            $scope.anime = false;

            // Gets the TRAKT.TV information for the show.
            TRAKT.getById(playing.result.tvdb_id).then(function(trakt) {

              // Selects the last index from the array since trakt.tv returns info for really old shows.
              var maxIndex = trakt.length -1;
                  theShow = trakt[maxIndex].show,
                  theEpisode = trakt[maxIndex].episode;

              $scope.slug = theShow.ids.slug;
              $scope.poster = theShow.images.poster.thumb;
              $scope.title = theShow.title;
              $scope.year = theShow.year;
              $scope.plot = theShow.overview;
              
              // If information from the episode was returned by trakt.tv
              if ( theEpisode ) {

                $scope.episode = theEpisode.title;
                $scope.episodeNum = theEpisode.number;
                $scope.seasonNum = theEpisode.season;

              // Otherwise get the info directly from the Popcorn Time Player.
              } else {

                $scope.episodeNum = playing.result.episode;
                $scope.seasonNum = playing.result.season;

              }

              // Show the shows information card.
              $scope.show = true;

              $ionicLoading.hide();

            });

          }

        }

      });

    }

    // Opens IMDB link in system browser.
    $scope.openIMDB = function(id) {

      window.open('http://imdb.com/title/' + id, '_system', 'location=yes');

    }


    // Opens TRAKT link in system browser.
    $scope.openTRAKT = function(slug) {

      window.open('http://trakt.tv/shows/' + slug, '_system', 'location=yes');

    }

  });

}]);