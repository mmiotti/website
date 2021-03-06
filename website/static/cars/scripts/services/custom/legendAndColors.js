(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .factory('legendAndColors', legendAndColors);

  function legendAndColors() {

    var dataColors = {

      'filtered': '#ddd',
      'highlight': '#f00',

      'Combined_Type': {
        'ICEV': '#000',
        'ICEV_Diesel': '#888',
        'HEV': '#e64d71',
        'PHEV': '#a7052b',
        'BEV': '#f7cb00',
        'FCV': '#489fe1',
        'Average': '#fff',
      },

      'Subclass': {
        'Subcompact': '#bbd8ff',
        'Compact': '#4c86d5',
        'Mid-size': '#0d2e5a',
        'Full-size': '#00050b',
        'Average': '#fff',
      },

      'Class': {
        'Sedan/Hatchback': '#acc927',
        'Sports Car': '#f18012',
        'SUV': '#1f5093',
        'Pickup': '#8b8b8b',
        'Minivan': '#000000',
        'Average': '#fff',
      },
      
    };

    var dataColorTexts = {
      'ICEV': 'Internal Combustion Engine (Gasoline)',
      'ICEV_Diesel': 'Internal Combustion Engine (Diesel)',
      'HEV': 'Hybrid',
      'BEV': 'Battery Electric Vehicle',
      'PHEV': 'Plug-In Hybrid',
      'FCV': 'Fuel Cell Vehicle',
    }

    // set up api ("public functions")
    var api = {
      getDataColor: getDataColor,
      getDataColorByKey: getDataColorByKey,
      getLegend: getLegend,
      // getCss: getCss,
      isFiltered: isFiltered
    };

    return api;


    // get color of data point or shade
    function getDataColor(d, configValues) {

      if (isFiltered(d, configValues) === true) {
        return dataColors['filtered'];
      } else {
        if (d[configValues.legendColorField]) {
          if (dataColors[configValues.legendColorField].hasOwnProperty(d[configValues.legendColorField].trim())) {
            return dataColors[configValues.legendColorField][d[configValues.legendColorField].trim()];
          } else {
            return dataColors['filtered'];
          }
        } else {
          return dataColors['filtered'];
        }
      }

    }


    function getLegend(configValues) {

      var legend = []
      var id = 0

      for (var key in dataColors[configValues.legendColorField]) {
        if (dataColors[configValues.legendColorField].hasOwnProperty(key)) {
          legend.push({
            'text': dataColorTexts.hasOwnProperty(key) ? dataColorTexts[key] : key,
            'color': dataColors[configValues.legendColorField][key],
            'id': id,
            'key': key,
            'highlight': false
          })
          id++
        }
      }

      return legend

    }


    // get color by key in dataColors array
    function getDataColorByKey(key, configValues) {
      return dataColors[configValues.legendColorField][key]
    }


    // check whether data point is currently filtered
    function isFiltered(d, configValues) {

      if (configValues.highlightFilter !== 'none') {
        return true;
      }
      if (configValues.powertrainFilter !== 'none' && configValues.powertrainFilter !== d.Powertrain) {
        return true;
      }
      if (configValues.sizeFilter !== 'none' && d.Subclass.toLowerCase().indexOf(configValues.sizeFilter.toLowerCase()) !== 0) {
        return true;
      }
      if (configValues.typeFilter !== 'none' && d.Class.toLowerCase().indexOf(configValues.typeFilter.toLowerCase()) === -1) {
        return true;
      }
      return false;

    }


  }

})();
