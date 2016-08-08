(function () {
  'use strict';

  // load the d3 service (which is in its own module)
  angular.module('d3', []);

  // create the angular app, with dependency on the d3 module
  angular.module('interactiveCostCarbonApp', ['d3']);

  // add modernizr as a constant
  //angular.module('interactiveCostCarbonApp').constant("Modernizr", Modernizr);

}());