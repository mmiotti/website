(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .directive('costCarbonSpace', ['$window', 'mainPlot', 'configService', 'dataService', costCarbonSpace]);

  function costCarbonSpace($window, mainPlot, configService, dataService) {
    return {

      // for element <cost-carbon-space>
      restrict: 'E',

      // set up link function for this directive. 
      link: function(scope, element, attrs) {

        // load data into dataService.
        // could also be put into controller, but in theory, data could be loaded before link function is run (not really in practice, though)
        dataService.loadData();

        // set up cost carbon plot
        mainPlot.initiate(element[0]);

        // once data is loaded, calculate results and render plot
        scope.$on('data:loaded', function(event) {

          mainPlot.renderPlot(
            dataService.getResults()
          );
          // store current data of model filter, to be used for comparison when variable 'settings' changes
          // this is a bit of a hack, but works well for now
          // note: changing the model filters is turned off for now
          scope.previousModelFilter = configService.getCurrentOptionObject('modelFilter');

        })

        // when window is resized, "refresh" so that watch (below) is triggered
        window.onresize = function() {
          return scope.$apply();
        }

        // watch for window resizes, and re-render plot from stratch when that occurs
        scope.$watch(function(){

            return $window.innerWidth;

          }, function() {

            return mainPlot.renderPlot(
              dataService.getResults()
            );

          }
        );

        // when uiInfo is changed, update scope (and thus view)
        // uiInfo contains the legend (uiInfo.legend) and the list of highlighted cars (uiInfo.higlightedCars)
        // note: angular only broadcasts events to scopes of which it knows they subscribed to that event, so it's relatively efficient
        scope.$on('uiInfo:changed', function(event, data) {
          
          scope.$apply(function() {
            scope.uiInfo = data
          });

        });


        // watch for changes in settings, and update plot when changes occur
        scope.$watch('settings', function(newVals, oldVals) {

          //var t0 = performance.now();
          if (newVals != oldVals) {

            // pass new values to config service
            configService.setSettings(newVals);

            // if model filter changed, data needs to be reloaded entirely (which then triggers plot update below as well)
            if (scope.previousModelFilter.key !== configService.getCurrentOptionObject('modelFilter').key) {
              dataService.loadData();
            // otherwise, trigger plot-update function with new results, but without reloading data
            } else {
              mainPlot.updatePlot(
                dataService.getResults()
              );
            }

          }

          //console.log("Time to recalculate: " + Math.round(performance.now() - t0) + " milliseconds.")
          return true;

        }, true);

      }
    }
  }

}());
