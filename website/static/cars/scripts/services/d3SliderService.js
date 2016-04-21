(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .factory('d3SliderService', ['$rootScope', 'd3', d3SliderService]);

  function d3SliderService($rootScope, d3) {

    // set up api ("public functions")
    var api = {
      getSliderInstance: getSliderInstance
    };

    // provide new instance of slider to directive
    function getSliderInstance() {
      return new sliderInstance();
    }

    // set up object that will be instantiated
    function sliderInstance() {
      this.x = {};
      this.brush = {};
      this.svg = {};
      this.handle = {};
      this.value = 0;
    };

    // set up slider, and define what happens when slider is clicked ("brushed")
    sliderInstance.prototype.initiate = function(element, condition) {

      var margin = {top: 0, right: 20, bottom: 0, left: 20},
          width = 150 - margin.left - margin.right,
          height = 40 - margin.bottom - margin.top;

      this.x = d3.scale.linear()
          .domain([condition.min, condition.max])
          .range([0, width])
          .clamp(true);

      this.brush = d3.svg.brush()
          .x(this.x)
          .extent([0, 0])
          .on("brush", brushed);

      this.svg = d3.select(element)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .on("mouseover", function(d) {
          return that.svg.selectAll("text").style("visibility", "visible");
        })
        .on("mouseout", function(d) {
          return that.svg.selectAll("text").style("visibility", "hidden");
        })
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .style("cursor","default");

      var that = this;

      this.svg.append("g")
          .attr("class", "x sliderAxis")
          .attr("transform", "translate(0," + 14 + ")")
          .call(d3.svg.axis()
            .scale(this.x)
            .orient("bottom")
            .ticks(3)
            .tickSize(0)
            .tickPadding(12))
        .select(".domain")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
          .attr("class", "halo");

      this.svg.selectAll("text")
        .style("visibility", "hidden");

      this.slider = this.svg.append("g")
          .attr("class", "slider")
          .call(this.brush);

      // overwrite the default brush cursor (crosshair), and set height
      this.slider.selectAll(".background")
          .style("cursor", "default")
          .attr("height", height);

      // we don't need these
      this.slider.selectAll(".extent,.resize")
          .remove();

      this.handle = this.slider.append("circle")
          .attr("class", "handle")
          .attr("transform", "translate(0," + 14 + ")")
          .attr("r", 9);

      // make this available inside brushed()
      var self = this;

      function brushed() {

        self.value = self.brush.extent()[0];


        // if not a programmatic event, update value to mouse position
        if (d3.event.sourceEvent) {

          self.value = self.x.invert(d3.mouse(this)[0]);

          // round value to nearest step. first, substract minimum value, then add that value again (after rounding). elegant, eh?
          if (condition.roundTo > 0) {
            self.value = Math.round((self.value-condition.min)/condition.roundTo)*condition.roundTo+condition.min;
          }

          self.brush.extent([self.value, self.value]);

        }

        self.handle.attr("cx", self.x(self.value));

        // broadcast the change to slider directives
        $rootScope.$broadcast('slider:brushed', {key: condition.key, value: self.value});
        
      };

    }

    // set initial position of slider
    sliderInstance.prototype.setInitialPosition = function(value) {

      this.slider
          .call(this.brush.extent([this.value, this.value]))
      //  .call(this.brush.event);
      //  note: we don't want to .call(brush.event) here, because on initialization of our slider, we cannot call scope.$apply

      this.updateHandle(value);

    }

    // update the position of the slider handle
    sliderInstance.prototype.updateHandle = function(value) {

      this.handle.attr("cx", this.x(value));

    };

    return api;

  }

})();