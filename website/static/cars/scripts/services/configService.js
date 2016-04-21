(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .factory('configService', ['getConfigOptions', configService]);

  function configService(getConfigOptions) {

    var settings = getConfigOptions.getOptions();

    // set up api ("public functions")
    var api = {
      getSettingObject: getSettingObject,
      getCurrentOptionObject: getCurrentOptionObject,
      getSettings: getSettings,
      setSettings: setSettings,
      getKeyValuePairs: getKeyValuePairs
    };

    initializeSliderValues();

    return api;


    // for each config that is a slider, determine step size and set initial value to default
    function initializeSliderValues() {

      settings.forEach(function(settingGroup) {
        settingGroup.settings.forEach(function(item) {

          if (item.isSlider === true) {

            // set step size (defined by maxmimum value, minimum value, and number of steps) for sliders
            if (item.stepSize > 0) {
                var steps = (item.max-item.min)/item.stepSize;
                item.roundTo = (item.max-item.min)/steps;
            } else {
                item.roundTo = 0;
            }

            // set current value to default value
            item.value = item.default;

          }

        });
      });
       
    }

    // used in d3PlotService. not very elegant currently, may need to update
    function getSettingObject(key) {

      var returnItem = {};

      settings.forEach(function(settingGroup) {
        settingGroup.settings.forEach(function(item) {
          if (item.key === key) {
            returnItem = item;
          }
        });
      });

      return returnItem;

    }

    // used in d3PlotService. not very elegant currently, may need to update
    function getCurrentOptionObject(key) {

      var returnItem = {};

      settings.forEach(function(settingGroup) {
        settingGroup.settings.forEach(function(item) {
          if (item.key === key) {
            item.options.forEach(function(option) {
              if (option.key === item.value) {
                returnItem = option;
              }
            });
          }
        });
      });

      return returnItem;

    }

    // getter for settings
    function getSettings() {
      return settings;
    }

    // setter for settings (used when values change through user interface)
    function setSettings(newVals) {
      settings = newVals;
    }

    // prepare an object that contains key-value pairs of all config variables, allowing easy access to all settings by their name (key)
    function getKeyValuePairs() {

      var configValues = {};

      settings.forEach(function(settingGroup) {
        settingGroup.settings.forEach(function(item) {
          configValues[item.key] = item.value;
        });
      });

      configValues['inventory_source'] = 'GREET';
      configValues['shadedAreas'] = 'linear';
      configValues['trim'] = 'Trim1';
      configValues['price_Electricity'] = configValues['price_Electricity']*32.2*3.78/3.6/100;
      configValues['price_Gasoline_Premium'] = 1.1 * configValues['price_Gasoline'];

      return configValues;

    }

  }

})();