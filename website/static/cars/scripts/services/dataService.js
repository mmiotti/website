(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .factory('dataService', ['$rootScope', 'd3', 'getCsvList', 'processCsvData', 'calculateResults', dataService]);

  function dataService($rootScope, d3, getCsvList, processCsvData, calculateResults) {

    var data = {};
    var loadComplete = 0;
    var files = getCsvList.getList()

    // set up api ("public functions")
    var api = {
      loadData: loadData,
      getResults: getResults,
      getVehicleList: getVehicleList,
    };

    return api;

    // load data from csv files
    function loadData() {

      var t0 = performance.now();

      files.forEach(function(file) {

  		  d3.csv('scripts/data/'+file+'.csv', function(d) {

  		    return d;

  		  }, function(error, rows) {

  		  	data[file] = processCsvData.process(file, rows);

  		  	loadComplete++;

          if (loadComplete === files.length) {
  		      $rootScope.$broadcast('data:loaded');
            console.log("Time to process all csv files: " + Math.round(performance.now() - t0) + " milliseconds.");
          }

  		  });

      });

    }

    // calculate results based on input data and current state of config
    function getResults() {

      if (loadComplete < files.length) {
        return [];
      }

      // calculate results
      return calculateResults.calculate(data)

    }


    function getVehicleList() {

      var list = []

      data.veh.forEach(function(item) {
        list.push({
          name:  item.Make + ' ' + item.Model + (item.Suffix ? ' ' + item.Suffix : ''),
          id: item.Id,
        });
      });

      return list;

    }

  }

})();