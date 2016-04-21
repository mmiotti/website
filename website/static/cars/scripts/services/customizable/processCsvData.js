(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .factory('processCsvData', [processCsvData]);

  function processCsvData() {

    // set up api ("public functions")
    var api = {
      process: process
    };

    return api;

    // post-process data from .csv files once they're fully loaded
    function process(type, rows) {

      if (type == 'veh') {

        for (var i = 0; i < rows.length; i++) {

          rows[i].Links = [];
          rows[i].Id = i;

          // get all "links" (indices of cars with same make and model) for this car
          for (var j = 0; j < rows.length; j++) {
            if (i !== j && (rows[i].Make + rows[i].Model) === (rows[j].Make + rows[j].Model)) {
                rows[i].Links.push(j);
            }
          }

          rows[i].Trim1_MSRP = parseInt(rows[i].Trim1_MSRP);   
          rows[i].Trim1_MPG_City = parseFloat(rows[i].Trim1_MPG_City);   
          //rows[i].Sales = parseInt(rows[i].Sales);         

        }

      } 

      if (type == 'fuelCoeff') {

        var processed = {};

        rows.forEach(function(row) {
          processed[row.Fuel] = row;
        });

        rows = processed;

      } 

      if (type == 'vehCoeff') {

        var processed = {};

        rows.forEach(function(row) {
          processed[row.Type] = row;
        }) ;

        rows = processed;

      }

      return rows;

    }

  }

})();