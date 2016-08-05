(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .factory('getCsvList', [getCsvList]);

  function getCsvList() {

    // set up api ("public functions")
    var api = {
      getList: getList
    };

    return api;

    // post-process data from .csv files once they're fully loaded
    function getList() {

      return [
        'veh',
        'fuelCoeff',
        'vehCoeff'
      ]

    }

  }

})();