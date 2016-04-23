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


    function check_if_car_should_be_included(a, b) {
      return
    }


    // post-process data from .csv files once they're fully loaded
    function process(type, rows) {

      if (type == 'veh') {

        var configValues = configService.getKeyValuePairs();
        var include = true;
        var new_rows = [];

        if (configValues['modelFilter'] == 'similar-extreme-plus') {
          var mpg_diff_filter = 4;
          var mspr_diff_filter = 2000;
        } else if (configValues['modelFilter'] !== 'all') {
          var mpg_diff_filter = 2;
          var mspr_diff_filter = 1000;
        }

        for (var i = 0; i < rows.length; i++) {

          rows[i].Links = [];
          rows[i].Id = i;
          rows[i].Included = false;
          include = true;

          // don't show car if it's values are extreme
          if (configValues['modelFilter'] == 'similar-extreme' || configValues['modelFilter'] == 'similar-extreme-plus') {
            if (rows[i].Powertrain == 'ICEV' && (rows[i].Trim1_MPG_City < 15 || rows[i].Trim1_MSRP > 60000)) {
              include = false;
            }
          }
          
          if (include == true) {
            for (var j = 0; j < rows.length; j++) {
              // if car is very simsilar to a car that's already been added
              if (configValues['modelFilter'] !== 'all'
                && i !== j
                && rows[j].Included == true
                && Math.abs(parseInt(rows[i].Trim1_MPG_City)-parseInt(rows[j].Trim1_MPG_City)) < mpg_diff_filter
                && Math.abs(parseInt(rows[i].Trim1_MPG_Highway)-parseInt(rows[j].Trim1_MPG_Highway)) < mpg_diff_filter
                && Math.abs(parseInt(rows[i].Trim1_MSRP)-parseInt(rows[j].Trim1_MSRP)) < mspr_diff_filter) {
                // then don't include it
                include = false;
                break;
              }
              // get all "links" (indices of cars with same make and model) for this car
              if (i !== j && (rows[i].Make + rows[i].Model) === (rows[j].Make + rows[j].Model)) {
                  rows[i].Links.push(j);
              }
            }
          }

          rows[i].Trim1_MSRP = parseInt(rows[i].Trim1_MSRP);   
          rows[i].Trim1_MPG_City = parseFloat(rows[i].Trim1_MPG_City);   
          //rows[i].Sales = parseInt(rows[i].Sales); 

          //if (parseInt(rows[i].Sales) > 100000 || rows[i].Powertrain != 'ICEV') {
          if (include == true) {
            rows[i].Included = true;
            new_rows.push(rows[i])
          }

        }

        rows = new_rows;

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