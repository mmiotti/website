(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .directive('costCarbonSpace', ['$window', 'd3PlotService', 'configService', 'dataService', costCarbonSpace]);

  function costCarbonSpace($window, d3PlotService, configService, dataService) {
    return {

      // for element <cost-carbon-space>
      restrict: 'E',

      // set up link function for this directive. 
      link: function(scope, element, attrs) {

        // load data into dataService. could also be put into controller, but in theory, data could be loaded before link function is run (not really in practice, though)
        dataService.loadData();

        // set up cost carbon plot
        d3PlotService.initiate(element[0]);

        //scope.highlighted = d3PlotService.highlighted;

        // the data (see controller) is not immediately available. once data is loaded, calculate results and render plot
        scope.$on('data:loaded', function(event) {
          d3PlotService.renderPlot(
            dataService.getResults()
          );
          // store current data of model filter, to be used for comparison when variable 'settings' changes
          // this is a bit of a hack, but works well for now
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

            return d3PlotService.renderPlot(
              dataService.getResults()
            );

          }
        );

        // when uiinfo is changed, update scope (and thus view)
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

            if (scope.previousModelFilter.key !== configService.getCurrentOptionObject('modelFilter').key) {
              // reload data (which then triggers plot-update as well)
              dataService.loadData();
            } else {
              // trigger plot-update function with new results, but without reloading data
              d3PlotService.updatePlot(
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
