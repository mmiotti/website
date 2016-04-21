(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .directive('configSlider', ['d3SliderService', configSlider]);

  function configSlider(d3SliderService) {
    return {

      restrict: 'C',

      // set up new, inner scope, but let outer scope know of changes in config (setting)
      scope: {
        setting: '='
      },

      link: function(scope, element, attrs) {

        // when value of slider is changed using the text field (in the view), update the slider position
        // note: this is not very elegant - using ng-change="fn()" in view instead of $watch here might be better, but that would likely require a subscribe/publish pattern ($emit), since we're in a private scope
        scope.$watch('setting', function(newVals, oldVals) {

          if (newVals.value != oldVals.value) {

            if (!isFinite(newVals.value)) {
              newVals.value = parseFloat(newVals.value);
              scope.setting.value = newVals.value;
            }
            if (newVals.value > newVals.max) {
              newVals.value = newVals.max;
            }
            if (newVals.value < newVals.min) {
              newVals.value = newVals.min;
            }           

          }

          // note: if this is placed within the new-vs-old IF clause above, it won't trigger when settings are loaded from the storage system, because in that case, the old values are equal to the new ones. Currently not sure why.
          sliderInstance.updateHandle(newVals.value);

        }, true);

        // when position of slider is changed, let angular know of that change (slider:brushed event broadcast by rootScope, coming from the brushed() function in d3SliderService)
        // note: angular only broadcasts events to scopes of which it knows they subscribed to that event, so it's relatively efficient
        scope.$on('slider:brushed', function(event, data) {
          
          // check whether event was emited from the slider instance to which we belong
          if (data.key == scope.setting.key) {
            scope.$apply(function() {
              scope.setting.value = Math.round(data.value*(1/scope.setting.roundTo))/(1/scope.setting.roundTo);
            });
          }

        });

        // make new slider object
        var sliderInstance = d3SliderService.getSliderInstance();

        // initiate slider
        sliderInstance.initiate(element[0], scope.setting);

        // set initial slider position
        sliderInstance.setInitialPosition(scope.setting.default);
      
      } 
    }
  }

}());
