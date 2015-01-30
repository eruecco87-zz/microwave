angular.module('microwave.directives', ['ionic'])

/**
 * Changes selected tab on swipe gesture.
 */
.directive('ionTabsSwipe', ['$ionicGesture', '$ionicTabsDelegate', '$timeout', function($ionicGesture, $ionicTabsDelegate, $timeout) {
  
  return {
    require: '^ionTabs',
    compile: function(element, attr, transclude) {

      var selectedTabIndex; // Holds the currently displayed tab index.

      return function link($scope, element, attrs, tabsCtrl) {

        $scope.tabAnimation = 'right-left';

        var maxTabIndex = tabsCtrl.tabs.length - 1; // Holds the maximum tab index depending on the amount of tabs.

        /**
         * Changes selected tab on LEFT SWIPE gesture.
         */
        $ionicGesture.on('swipeleft', function(event) {

          $scope.tabAnimation = 'left-right';

          selectedTabIndex = $ionicTabsDelegate.$getByHandle(attrs.delegateHandle).selectedIndex(); // Gets the currently displayed tab index.

          if ( selectedTabIndex >= 0 && selectedTabIndex <= maxTabIndex - 1 ) {

            // For some reason this needs to be wrapped in a timeout.
            $timeout(function() {
              $ionicTabsDelegate.$getByHandle(attrs.delegateHandle).select(selectedTabIndex + 1);
            }, 100);

          }

        }, element);

        
        /**
         * Changes selected tab on RIGHT SWIPE gesture.
         */
        $ionicGesture.on('swiperight', function(event) {

          $scope.tabAnimation = 'right-left';

          selectedTabIndex = $ionicTabsDelegate.$getByHandle(attrs.delegateHandle).selectedIndex(); // Gets the currently displayed tab index.

          if ( selectedTabIndex <= 2 && selectedTabIndex >= maxTabIndex - 1 ) {

            // For some reason this needs to be wrapped in a timeout.
            $timeout(function() {
              $ionicTabsDelegate.$getByHandle(attrs.delegateHandle).select(selectedTabIndex - 1);
            }, 100);

          }        

        }, element);

        /**
         * Handles the direction on the animation on manual tab select.
         */
        $scope.tabSelect = function(selectedTab) {

          var currentTab = $ionicTabsDelegate.$getByHandle(attrs.delegateHandle).selectedIndex();

          if ( currentTab < selectedTab ) {

            $scope.tabAnimation = 'left-right';

          } else if ( currentTab > selectedTab ) {

            $scope.tabAnimation = 'right-left';

          }

          $ionicTabsDelegate.$getByHandle(attrs.delegateHandle).select(selectedTab);

        }


      };

    }

  };

}]);