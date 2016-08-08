(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .factory('processCsvData', ['configService', processCsvData]);

  function processCsvData(configService) {

    // set up api ("public functions")
    var api = {
      process: process
    };

    return api;


    function getSimilarCarFilterValues(configValues) {

      var min_diff = {
        'mpg': 0,
        'msrp': 2000
      }

      if (configValues['modelFilter'] == 'similar-extreme-plus') {
        min_diff.mpg = 4;
        min_diff.msrp = 2000;
      } else if (configValues['modelFilter'] !== 'all') {
        min_diff.mpg = 2;
        min_diff.msrp = 1000;
      }

      return min_diff;

    }


    function checkIfCarIsTooExtreme(configValues, car) {

      if (configValues['modelFilter'] == 'similar-extreme' || configValues['modelFilter'] == 'similar-extreme-plus') {
        if (car.Powertrain == 'ICEV' && (car.Trim1_MPG_City < 15 || car.Trim1_MSRP > 60000)) {
          return false;
        }
      }

      return true;

    }


    function checkIfCarIsTooSimilar(car_a, car_b, min_diff) {

      if (Math.abs(parseInt(car_a.Trim1_MPG_City)-parseInt(car_b.Trim1_MPG_City)) < min_diff.mpg
        && Math.abs(parseInt(car_a.Trim1_MPG_Highway)-parseInt(car_b.Trim1_MPG_Highway)) < min_diff.mpg
        && Math.abs(parseInt(car_a.Trim1_MSRP)-parseInt(car_b.Trim1_MSRP)) < min_diff.msrp) {
        return true;
      } else {
        return false;
      }

    }


    // post-process data from .csv files once they're fully loaded
    function process(type, rows) {

      // if we're processing vehicle data
      if (type == 'veh') {

        var configValues = configService.getKeyValuePairs();
        var include = true;
        var new_rows = [];
        var min_diff = getSimilarCarFilterValues(configValues)

        for (var i = 0; i < rows.length; i++) {

          rows[i].Links = [];
          rows[i].Id = i;
          rows[i].Included = false;
          include = true;

          // don't show car if it's values are extreme
          include = checkIfCarIsTooExtreme(configValues, rows[i])
          
          // if car hasn't been excluded already because of above check
          if (include == true) {
            // go through each other car *that's already included* and check if it's too similar
            // also, build up list of 'linked' cars (cars with same make and model names)
            for (var j = 0; j < rows.length; j++) {
              if (configValues['modelFilter'] !== 'all' // if model filter is not set to 'include all models', and
                && i !== j // car i is not the same as car j (in which case the difference would of course be 0), and
                && rows[j].Included == true // car j has already been set to 'Included', and
                && checkIfCarIsTooSimilar(rows[i], rows[j], min_diff)) { // car j is indeed similar
                // then don't include car i
                include = false;
                // if we don't include car i, we also don't need to check for 'linked' cars any longer, and can exit for loop
                break;
              }
              // if this car (with index j) has the same make and model name as the car with index i, add it to the 'links' for car i
              if (i !== j && (rows[i].Make + rows[i].Model) === (rows[j].Make + rows[j].Model)) {
                  rows[i].Links.push(j);
              }
            }
          }

          rows[i].Trim1_MSRP = parseInt(rows[i].Trim1_MSRP);   
          rows[i].Trim1_MPG_City = parseFloat(rows[i].Trim1_MPG_City);   
          //rows[i].Sales = parseInt(rows[i].Sales); 

          // if 'include' has not been set to false by either of above checks (extreme value check, similar car check, etc)
          if (include == true) {
            rows[i].Included = true;
            new_rows.push(rows[i])
          }

        }

        rows = new_rows;

      } 

      // if we're processing fuel coefficient data
      if (type == 'fuelCoeff') {

        var processed = {};

        rows.forEach(function(row) {
          processed[row.Fuel] = row;
        });

        rows = processed;

      } 

      // if we're processing vehicle coefficient data
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