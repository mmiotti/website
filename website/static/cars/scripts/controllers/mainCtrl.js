(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .controller('mainCtrl', ['$scope', '$window', 'configService', 'dataService', 'd3PlotService', mainCtrl]);

  // the main controller handles storing and loading settings, as well as downloading the svg as an image
  // other controller functions are part of the directives (costCarbonSpace and configSlider)
  function mainCtrl($scope, $window, configService, dataService, d3PlotService) {

    // initiate settings
    $scope.settings = configService.getSettings();

    // set initial tab
    $scope.tab = 'legend';

    $scope.$on('data:loaded', function(event) {
      $scope.vehicleList = dataService.getVehicleList();
    });

    $scope.showList = function() {
      return ($scope.search && $scope.search.length >= 2);
    }

    $scope.highlight = function(id) {
      d3PlotService.triggerToggleCarOnList(id);
    }

    $scope.highlightDot = function(id) {
      d3PlotService.highlightDot(id);
    }

    $scope.dehighlightDot = function(id) {
      d3PlotService.dehighlightDot(id);
    }

    $scope.highlightHull = function(id) {
      d3PlotService.highlightHull(id);
    }

    $scope.dehighlightHull = function(id) {
      d3PlotService.dehighlightHull(id);
    }

    $scope.clearSearch = function() {
      $scope.search = '';
    }

    $scope.tour = {
      'title': '',
      'active': false,
      'index': 0,
      'text': ''
    }

    $scope.tour_data = [
      {
        'title': 'New here? Take the Tour!',
      },
      {
        'title': 'New here? Take the Tour!',
        'settings': {}
      },
      {
        'title': 'The plot area',
        'settings': {}
      },
      {
        'title': 'The axes',
        'settings': {}
      },
      {
        'title': 'The targets',
        'settings': {}
      },
      {
        'title': 'Average conditions',
        'settings': {}
      },
      {
        'title': 'Current fuel prices',
        'settings': {
          'price_Gasoline': 2.1,
          'price_Diesel': 2.1
        }
      },
      {
        'title': 'Cleaner electricity',
        'settings': {
          'price_Gasoline': 2.1,
          'price_Diesel': 2.1,
          'electricity_ghg_fuel': 300,
        }
      },
      {
        'title': 'Back to default',
        'settings': {}
      },
      {
        'title': 'No tax refunds',
        'settings': {
          'refunds': 'none'
        }
      },
      {
        'title': 'Filter by vehicle class',
        'settings': {
          'refunds': 'none',
          'sizeFilter': 'compact',
          'typeFilter': 'sedan',
        }
      },
      {
        'title': 'Done - but there\'s much more!',
        'settings': {}
      },
    ]

    $scope.updateTourBox = function() {
      $scope.tour.title = $scope.tour_data[$scope.tour.index]['title'];
      $scope.tour.text = $scope.tour_data[$scope.tour.index]['text'];
    }

    $scope.toggleTour = function() {
      $scope.tour.active = ($scope.tour.active === false);
      if ($scope.tour.active == true) {
        $scope.tour.index = 1;
      }
      if ($scope.tour.active == false) {
        $scope.tour.index = 0;
      }
      $scope.updateTourBox()
    }

    $scope.tourPrev = function() {
      $scope.tour.index = $scope.tour.index - 1;
      $scope.updateTourBox()
      $scope.applyTourStatus()
    }

    $scope.tourNext = function() {
      $scope.tour.index = $scope.tour.index + 1;
      $scope.updateTourBox()
      $scope.applyTourStatus()
    }

    $scope.applyTourStatus = function(index) {
      $scope.appDim = d3PlotService.getAppDimensions();
      if ($scope.tour_data[$scope.tour.index].hasOwnProperty('settings')) {
        configService.applySettingsByKey($scope.tour_data[$scope.tour.index]['settings'], true);
      }
    }

    $scope.updateTourBox();

    // $scope.applyQuickSettings = function(quicksettings_key) {
    //   for (var i = 0; i < $scope.quickSettings.length; i++) {
    //     if ($scope.quickSettings[i]['key'] == quicksettings_key) {
    //       for (var j = 0; j < $scope.quickSettings[i]['settings'].length; j++) {
    //         configService.applySettingByKey($scope.quickSettings[i]['settings'][j]['key'],
    //           $scope.quickSettings[i]['settings'][j]['value'])
    //       }
    //       break;
    //     }
    //   }
    // }

    $scope.changeTab = function(tab_name) {
      $scope.tab = tab_name;
    }

  }

}());
