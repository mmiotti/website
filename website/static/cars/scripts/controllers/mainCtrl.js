(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .controller('mainCtrl', ['$scope', '$window', 'configService', 'dataService', 'd3PlotService', mainCtrl]);

  // the main controller handles storing and loading settings, as well as downloading the svg as an image
  // other controller functions are part of the directives (costCarbonSpace and configSlider)
  function mainCtrl($scope, $window, configService, dataService, d3PlotService) {

    var storeOnClick = false;

    var defaultStorageSettings = {
      'disabled': true,
      'state': 'empty',
      'content': [],
    }

    $scope.storageBoxes = {
      'box0': angular.copy(defaultStorageSettings),
      'box1': angular.copy(defaultStorageSettings),
      'box2': angular.copy(defaultStorageSettings),
      'box3': angular.copy(defaultStorageSettings),
      'box4': angular.copy(defaultStorageSettings),
    }

    $scope.settings = configService.getSettings();

    $scope.$on('data:loaded', function(event) {
      $scope.vehicleList = dataService.getVehicleList();
    });

    $scope.showList = function() {
      return ($scope.search && $scope.search.length >= 2);
    }

    $scope.highlight = function(id) {
      //$scope.search = '';
      d3PlotService.triggerToggleHighlight(id);
    }

    // svg is only downloable if <a> tag supports download attribute (depends on browser)
    $scope.canDownload = ("download" in document.createElement("a"));

    $scope.hideUpload = true;

    $scope.storeSettings = function() {

      if (storeOnClick === false) {

        storeOnClick = true;

        for (var i = 0; i < 5; ++i) {
          $scope.storageBoxes['box' + i]['disabled'] = false;
          $scope.storageBoxes['box' + i]['state'] += "_store";
        }

      } else {

        storeOnClick = false;
        cleanUpStorageBoxStatus();

      }

    }

    $scope.triggerStorageBox = function(index) {

      if (storeOnClick === true) {
        $scope.storageBoxes['box' + index]['state'] = 'full';
        $scope.storageBoxes['box' + index]['content'] = angular.copy($scope.settings);
        storeOnClick = false;
        cleanUpStorageBoxStatus();
      } else {
        $scope.settings = angular.copy($scope.storageBoxes['box' + index]['content']);
      }

    }

    $scope.clearStorage = function() {

      for (var i = 0; i < 5; ++i) {
        $scope.storageBoxes['box' + i]['disabled'] = true;
        $scope.storageBoxes['box' + i]['state'] = 'empty';
        $scope.storageBoxes['box' + i]['content'] = [];
      }

      storeOnClick = false;

    }

    function cleanUpStorageBoxStatus() {

      for (var i = 0; i < 5; ++i) {
        if ($scope.storageBoxes['box' + i]['content'].length !== 0) {
          $scope.storageBoxes['box' + i]['disabled'] = false;
          $scope.storageBoxes['box' + i]['state'] = 'full'
        } else {
          $scope.storageBoxes['box' + i]['disabled'] = true;
          $scope.storageBoxes['box' + i]['state'] = 'empty'
        }
      }

    }

    $scope.toggleUpload = function() {
      $scope.hideUpload = $scope.hideUpload === false ? true: false;
    }

    $scope.downloadSettings = function() {

    }

    $scope.uploadSettings = function() {

    }

    $scope.saveSvg = function(mode) {

      // get svg element.
      var svg = document.getElementById("svg");

      // get svg source.
      var serializer = new XMLSerializer();
      var source = serializer.serializeToString(svg);

      // add name spaces.
      if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
          source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
          source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      }

      // add xml declaration
      source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

      // convert svg source to URI data scheme.
      var url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);

      // redirect to downloadable file
      if (mode == 'download') {

        var anchor = angular.element('<a/>');
        anchor.attr({
            href: url,
            target: '_blank',
            download: 'costcarbon.svg'
        })[0].click();

      // open file in new tab
      } else if (mode == 'open') {

        $window.open(url, '_blank');

      }

		}

  }

}());
