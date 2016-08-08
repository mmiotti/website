(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .controller('mainCtrl', ['$scope', '$window', 'configService', 'dataService', 'mainPlot', 'tourInfo', mainCtrl]);

  // the main controller handles storing and loading settings, as well as downloading the svg as an image
  // other controller functions are part of the directives (costCarbonSpace and configSlider)
  function mainCtrl($scope, $window, configService, dataService, mainPlot, tourInfo) {

    // initiate settings
    $scope.settings = configService.getSettings();

    // set initial tab
    $scope.tab = 'legend';

    // when data is loaded, get vehicle list (used for search feature)
    $scope.$on('data:loaded', function(event) {
      $scope.vehicleList = dataService.getVehicleList();
    });

    // check if list should be shown (search field is non-empty and has at least 2 characters)
    $scope.showList = function() {
      return ($scope.search && $scope.search.length >= 2);
    }

    // clear search field
    $scope.clearSearch = function() {
      $scope.search = '';
    }

    // add or remove entry from list of higlighted cars
    $scope.toggleHighlight = function(id) {
      mainPlot.triggerToggleCarOnList(id);
    }

    // highlight a car (that is in list of higlighted cars) in plot area
    $scope.highlightDot = function(id) {
      mainPlot.highlightDot(id);
    }

    // dehighlight a car (that is in list of higlighted cars) in plot area
    $scope.dehighlightDot = function(id) {
      mainPlot.dehighlightDot(id);
    }

    // highlight hull in plot area
    $scope.highlightHull = function(id) {
      mainPlot.highlightHull(id);
    }

    // dehighlight hull in plot area
    $scope.dehighlightHull = function(id) {
      mainPlot.dehighlightHull(id);
    }

    // set a specific control mode (mouse or touch)
    $scope.setControlMode = function(value) {
      configService.applySettingByKey('controlMode', value);
    }

    // get current control mode (used for setting highlight class in template)
    $scope.getControlMode = function() {
      return configService.getSettingObject('controlMode').value;
    }

    // reset all values
    $scope.resetAll = function() {
      configService.applySettingsByKey({}, true);
      if ($scope.tour.active == true) {
        $scope.toggleTour();
      }
      mainPlot.removeAllCarsFromList();
    }

    // change tab
    $scope.changeTab = function(tab_name) {
      $scope.tab = tab_name;
    }

    // set up tour object
    $scope.tour = {
      'title': '',
      'active': false,
      'index': 0,
    }

    // fetch tour data
    $scope.tour_data = tourInfo.getTourData();

    // update tour box (only update title text, for now)
    $scope.updateTourBox = function() {
      $scope.tour.title = $scope.tour_data[$scope.tour.index]['title'];
    }

    $scope.updateTourBox();

    // toggle tour (switch on or off)
    $scope.toggleTour = function() {
      // if on/true, set to false. if off/false, set to true
      $scope.tour.active = ($scope.tour.active === false);
      // if we're switching on, set index to 1. otherwise, set to 0
      if ($scope.tour.active == true) {
        $scope.tour.index = 1;
      } else {
        $scope.tour.index = 0;
      }
      $scope.updateTourBox()
      // trigger style changes in plot area
      mainPlot.applyTourHighlights($scope.tour.index);
    }

    // to go previous step of tour
    $scope.tourPrev = function() {
      $scope.tour.index = $scope.tour.index - 1;
      $scope.updateTourBox()
      $scope.applyTourStatus()
    }

    // go to next step of tour
    $scope.tourNext = function() {
      $scope.tour.index = $scope.tour.index + 1;
      $scope.updateTourBox()
      $scope.applyTourStatus()
    }

    // apply current tour status
    $scope.applyTourStatus = function(index) {
      // update app dimensions (used for some of the highlight boxes in template)
      // note: there are highlight features box in the template (through $scope) as well as in the plot area (through mainPlot)
      $scope.appDim = mainPlot.getAppDimensions();
      // set parameters
      if ($scope.tour_data[$scope.tour.index].hasOwnProperty('settings')) {
        configService.applySettingsByKey($scope.tour_data[$scope.tour.index]['settings'], true);
      }
      // trigger style changes in plot area
      // note: there are highlight features box in the template (through $scope) as well as in the plot area (through mainPlot)
      mainPlot.applyTourHighlights($scope.tour.index);
    }

  }

}());
