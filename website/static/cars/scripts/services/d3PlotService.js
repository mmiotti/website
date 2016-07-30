(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .factory('d3PlotService', ['$rootScope', '$timeout', 'd3', 'configService', 'convexHullService', 'colorsAndStyles', d3PlotService]);

  function d3PlotService($rootScope, $timeout, d3, configService, convexHullService, colorsAndStyles) {


    // set up api ("public functions")
    var api = {
      initiate: initiate,
      getAppDimensions: getAppDimensions,
      renderPlot: renderPlot,
      updatePlot: updatePlot,
      triggerToggleCarOnList: triggerToggleCarOnList,
      highlightDot: highlightDot,
      dehighlightDot: dehighlightDot,
      highlightHull: highlightHull,
      dehighlightHull: dehighlightHull
    };

    return api;


    // set up variables
    var svg, uiInfo, targets, prevLegend, prevTooltipId, smallTooltip, transitionSpeed, tooltip, tooltipTitle, tooltipSubtitle, tooltipInfoFirst, tooltipInfoSecond, width, height, padding, xScale, yScale, yMin, yMax, xMin, xMax, rScale, xAxis, yAxis, d3cardinalLine;

    // initiate plot (only done at the very beginning of script
    // this function is NOT executed when window is resized
    function initiate(element) {
  	
      // d3.select(element)
      //   .style("position", "fixed");

      // set up svg
      svg = d3.select(element)
        .append("svg")
        .attr("id","svg");

      // set up small tooltip
      smallTooltip = d3.select(element)
        .append("div")
        .style(colorsAndStyles.getCss('smallTooltip'))
        .on('click', function(d) {
          return smallTooltipToggle();
        })

      // set up tooltip
      tooltip = d3.select(element)
        .append("div")
        .style(colorsAndStyles.getCss('tooltip'))

      // set up tooltip "components"
      tooltipTitle = tooltip.append("span");

      tooltipSubtitle = tooltip.append("span")
        .style("color", "#bbb");

      tooltipInfoFirst = tooltip.append("span")
        .style("color", "#888")
        .style("padding-top", "3px")
        .style("display", "block");

      tooltipInfoSecond = tooltip.append("span")
        .style("color", "#888")
        .style("display", "block");

      d3cardinalLine = d3.svg.line()
        .x(function(d){return xScale(d.x);})
        .y(function(d){return yScale(d.y);});

      uiInfo = {
        'legend': [],
        'highlightedCars': []
      }

      targets = [200*1.61, 120*1.61, 50*1.61]

      transitionSpeed = 800;

    }


    function getAppDimensions() {
      var appDim = {}
      appDim.main = d3.select("#main").node().getBoundingClientRect();
      appDim.interface = d3.select("#interface-bar").node().getBoundingClientRect();
      appDim.width = appDim.main.width-appDim.interface.width;
      appDim.height = Math.min(Math.round(appDim.width/3*2.2), appDim.main.height - 60);
      return appDim;
    }


    // render plot (clears all previous information and re-draws data from scratch)
    // this function IS executed when window is resized or when configService.checkIfDataMustBeReloaded() results in true
    function renderPlot(results) {

      if (results.length == 0) {
        return;
      }
      
      var configValues = configService.getKeyValuePairs();
      var controlMode = configValues['controlMode']
      var appDim = getAppDimensions();

      // calculate width, height, and padding of figure
      width = appDim.width;
      height = appDim.height;
      padding = {top: 40, right: 27, bottom: 60, left: 60};

      // set scales
      updateScales(results, configValues);

      // remove all previous items before rendering
      svg.selectAll("*").remove();

      // set the height based on the calculations above
      svg.attr('width', width);
      svg.attr('height', height);

      // set up background rectangle
      svg.append("rect")
        .attr("x", padding.left)
        .attr("y", padding.top)
        .attr("width", width - padding.left - padding.right)
        .attr("height", height - padding.top - padding.bottom)
        .style("fill","#fff")
        .on('click', function(d) {
          return tooltipHide();
        })

      // add circle used for animation that is triggered when car is added to highlighted selection
      svg.append("circle")
        .attr("id", "clickAnimationCircle")
        .style("visibility", "hidden")
        .attr("fill", "#f00")
        .style('opacity','0.15')

      // add lines that are used to display targets
      svg.selectAll("line.targets")
        .data([[0],[1],[2]])
        .enter()
        .append("line")
        .attr("id", function(d) { return "target" + d })
        .style("stroke", "#dfdfdf")
        .style("stroke-width", "6")
        // .style("stroke-dasharray", "5,5")
        .style("visibility","visible")
        .on('mouseover', function(d) {
          var coordinates = [0, 0];
          coordinates = d3.mouse(this);
          var x = coordinates[0];
          return smallTooltipToggle(xScale(xMax)-75, yScale(targets[d]) - 13, "20" + (parseInt(d)+3) + "0 target");
        })
        .on('mouseout', function(d) {
          return smallTooltipToggle();
        });

      updateTargets(configValues);

      // add proxies for the paths that can be used to draw the shaded areas
      // we need to add those here because they have to appear below (i.e., be drawn before) the circles and lines
      svg.selectAll("path")
        .data([[0],[1],[2],[3],[4],[5],[6]])
        .enter()
        .append("path")
        .attr("id", function(d) { return "path" + d; })
        .style("visibility", "hidden")
        .style('opacity','0.15')

      // draw shaded areas
      drawShadedAreas(results, configValues, false)

      // add proxies for the lines between "linked" points that appear on mouse-over
      // we need to add those here because they have to appear below (i.e., be drawn before) the circles
      svg.selectAll("line.links")
        .data([[0],[1],[2],[3],[4]])
        .enter()
        .append("line")
        .attr("class","linkLine")
        .attr("id", function(d) { return "line" + d })
        .style("stroke", "#aaa")
        .style("stroke-width", "1.5")
        .style("visibility","hidden");

      // create groups that contains circles (data points) and text
      var groups = svg.selectAll("g")
        .data(results)
        .enter()
        .append("g")
        .attr("class", "no-highlight")
        .attr("transform", function(d){return "translate("+Math.round(xScale(d.X))+","+Math.round(yScale(d.Y))+")"})
        .attr("id", function(d) {
          return "circle" + d.Id;
        })
        .on('mouseover', function(d) {
          if (controlMode == 'mouse') {
            return tooltipShow(xScale(d.X), yScale(d.Y), d);
          } else {
            return;
          }
        })
        .on('mouseout', function(d) {
          if (controlMode == 'mouse') {
            return tooltipHide();
          } else {
            return;
          }
        })
        .on('click', function(d) {
          if (controlMode == 'mouse') {
            return toggleCarOnList(d); 
          } else {
            return tooltipToggle(xScale(d.X), yScale(d.Y), d);
          }
        });

        // .on('touchstart', function(d) {
        //   lastTouchStart = d3.event.timeStamp;
        // })
        // .on('touchend', function(d) {
        //   d3.event.preventDefault();
        //   if ((d3.event.timeStamp - lastTouchStart) > 1000) {
        //     return toggleCarOnList(d)
        //   } else {
        //     return tooltipToggle(xScale(d.X), yScale(d.Y), d);
        //   }
        // })

      // set up circles (data points)
      groups
        .append("circle")
        .attr("r", function(d) {
          return getCircleRadius(d, d3.select(this.parentNode).attr("class"), configValues);
        })
        .attr("fill", function(d) {
          return getCircleColor(d, d3.select(this.parentNode).attr("class"), configValues);
        })
        .style("opacity", "0.8");

      // set up text (used for highlighting specific points on click)
      groups
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dx", function(d){return 0})
        .attr("dy", function(d){return 5})
        .text("")
        .attr("fill", "#fff")
        .style("pointer-events", "none");

      for (var i = 0; i < uiInfo.highlightedCars.length; i++) {
        addHighlightStyle(uiInfo.highlightedCars[i]['id'], i+1, configValues)
      }

      // finally, plot axes above everything else
      appendAxes(configValues);

      $timeout(function() {
        uiInfo.legend = colorsAndStyles.getLegend(configValues);
        $rootScope.$broadcast('uiInfo:changed', uiInfo);
      })

    }


    // rerender plot (updates plot, showing an animation for the transition; this function is executed when inputs change)
    function updatePlot(results) {

      if (results.length <= 0) {
        return;
      }

      var configValues = configService.getKeyValuePairs();
      var controlMode = configValues['controlMode']

      updateScales(results, configValues);

      // redraw shaded areas
      drawShadedAreas(results, configValues, true)

      // update circle groups
      var group = svg.selectAll("g")
        .data(results)
        .on('mouseover', function(d) {
          if (controlMode == 'mouse') {
            return tooltipShow(xScale(d.X), yScale(d.Y), d);
          } else {
            return;
          }
        })
        .on('mouseout', function(d) {
          if (controlMode == 'mouse') {
            return tooltipHide();
          } else {
            return;
          }
        })
        .on('click', function(d) {
          if (controlMode == 'mouse') {
            return toggleCarOnList(d); 
          } else {
            return tooltipToggle(xScale(d.X), yScale(d.Y), d);
          }
        })
        .call(animateCircleGroups)

      // update circles
      group.select("circle")
        .call(animateCircles, configValues)

      updateTargets(configValues);

      // finally, plot axes above everything else
      appendAxes(configValues);

      // update legend (without timeout, the $apply called by $broadcast will run into active $digest's while dragging a slider)
      $timeout(function() {
        uiInfo.legend = colorsAndStyles.getLegend(configValues);
        $rootScope.$broadcast('uiInfo:changed', uiInfo);
      })

    }


    // animate movement of data point groups
    function animateCircleGroups(selection) {
      selection
        .transition()
        .duration(transitionSpeed)
          .attr("transform", function(d){return "translate("+Math.round(xScale(d.X))+","+Math.round(yScale(d.Y))+")"})
    }


    // animate change in color
    function animateCircles(selection, configValues) {
      selection
        .transition()
        .duration(transitionSpeed)
          .attr("r", function(d) {
            return getCircleRadius(d, d3.select(this.parentNode).attr("class"), configValues);
          })
          .attr("fill", function(d) {
            return getCircleColor(d, d3.select(this.parentNode).attr("class"), configValues);
          });
    }


    function updateScales(results, configValues) {

      // get extent of x and y values
      var xExtent = d3.extent(results, function(d) { return d.X; });
      var yExtent = d3.extent(results, function(d) { return d.Y; });

      // add padding
      var xPadding = (xExtent[1] - xExtent[0])/20;
      var yPadding = (yExtent[1] - yExtent[0])/20;

      // get lower axis limits, depending on configuration
      if (configValues.axisLimits == 'dynamic') {
        xMin = Math.max(0, xExtent[0] - xPadding);
        yMin = Math.max(0, yExtent[0] - yPadding);
      } else {
        xMin = 0;
        yMin = 0;
      }

      // get upper axis limits, depending on configuration
      if (configValues.axisLimits == 'dynamic' || configValues.axisLimits == 'hybrid') {
        xMax = xExtent[1] + xPadding;
        yMax = yExtent[1] + yPadding;
      } else {
        xMax = configService.getCurrentOptionObject('xAxis').maxLim;
        yMax = configService.getCurrentOptionObject('yAxis').maxLim;
      }

      // set up scale of x axis
      xScale = d3.scale.linear()
        .domain([xMin, xMax])
        .range([padding.left, width - padding.right]);

      // set up scale of y axis
      yScale = d3.scale.linear()
        .domain([yMin, yMax])
        .range([height - padding.bottom, padding.top]);

      // if values should be proportional to circle *area*, should be proportional to square root of *radius*
      rScale = d3.scale.linear()
        .domain([0, d3.max(results, function(d) { return Math.sqrt(d.Area); })])
        .range([1, 12]);

      // set up x Axis
      xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(5)
        .outerTickSize(0);

      // set up y Axis
      yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(5)
        .outerTickSize(0);

    }


    function getUnitConversionFactor(configValues) {
      if (configValues['units'] == 'us') {
        return 1;
      } else {
        return 1.61;
      }
    }


    function updateTargets(configValues) {
      for (var i = 0; i <= 2; i++) {
        // if y axis is set to total GHG emissions (to which targets apply) and target falls within box
        if (configValues['yAxis'] == 'ghg_total' && targets[i] > yMin) {
          var yValue = yScale(targets[i] / getUnitConversionFactor(configValues))
          // if already visible, directly animate to position
          if (d3.select("#target"+i).style("visibility") == "visible") {
            d3.select("#target"+i)
              .attr("x1", xScale(xMin))
              .attr("x2", xScale(xMax))
              .transition()
              .duration(transitionSpeed)
              .attr("y1", yValue)
              .attr("y2", yValue)
          } else {
            // if not visible already, first set y values to ymin, and then animate to position
            d3.select("#target"+i)
              .attr("x1", xScale(xMin))
              .attr("x2", xScale(xMax))
              .attr("y1", yScale(yMin))
              .attr("y2", yScale(yMin))
              .style("visibility", "visible")
              .transition()
              .duration(transitionSpeed)
              .attr("y1", yValue)
              .attr("y2", yValue)
          }
        } else {
          // if currently visible, directly animate to position
          if (d3.select("#target"+i).style("visibility") == "visible") {
            d3.select("#target"+i)
              .transition()
              .duration(transitionSpeed)
              .attr("y1", yScale(yMin))
              .attr("y2", yScale(yMin))
              .each("end", function(d) { d3.select("#target"+d).style("visibility", "hidden"); });
          }
        }
      }
    }


    function appendAxes(configValues) {

      svg.selectAll(".axis")
        .remove();

      svg.selectAll(".label")
        .remove();

      // Create X axis
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height - padding.bottom) + ")")
        //.transition().duration(transitionSpeed)
        .call(xAxis);
      
      // Create Y axis
      svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + padding.left + ",0)")
        //.transition().duration(transitionSpeed)
        .call(yAxis);

      svg.selectAll(".x.axis").selectAll("line")
        .attr("y2","-6")

      svg.selectAll(".y.axis").selectAll("line")
        .attr("x2","6")

      svg.append("line")
        .attr("x1", padding.left)
        .attr("x2", width-padding.right)
        .attr("y1", padding.top)
        .attr("y2", padding.top)
        .style("stroke", "black")
        .style("shape-rendering", "crispEdges");

      svg.append("line")
        .attr("x1", width-padding.right)
        .attr("x2", width-padding.right)
        .attr("y1", padding.top)
        .attr("y2", height-padding.bottom+1)
        .style("stroke", "black")
        .style("shape-rendering", "crispEdges");

      var xSettings = configService.getCurrentOptionObject('xAxis');
      var ySettings = configService.getCurrentOptionObject('yAxis');

      if (xSettings.hasOwnProperty('unit_si') && xSettings.hasOwnProperty('unit_us')) {
        var x_unit = xSettings['unit_' + configValues['units']]
      } else {
        var x_unit = xSettings.unit
      }

      if (ySettings.hasOwnProperty('unit_si') && ySettings.hasOwnProperty('unit_us')) {
        var y_unit = ySettings['unit_' + configValues['units']]
      } else {
        var y_unit = ySettings.unit
      }

      svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", Math.round((width-padding.left-padding.right)/2) + padding.left)
        .attr("y", height - 15)
        .text(xSettings.title + " in " + x_unit)
        .style("font-size", "14px");

      svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -Math.round((height-padding.top-padding.bottom)/2) - padding.top)
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .text(ySettings.title + " in " + y_unit)
        .style("font-size", "14px");

    }

    // draw the shaded areas beneath the group of points belonging to a given category
    function drawShadedAreas(results, configValues, isUpdate) {

      // update shaded areas
      if (configValues.shadedAreas != 'none') {

        d3cardinalLine.interpolate(configValues.shadedAreas);
        var legend = colorsAndStyles.getLegend(configValues)
        var hull = []
        var colorKey = ''
        var pathId = 0

        // loop through all proxies that can be used to draw shaded areas
        for (var i = 0; i < 7; ++i) {

          // if hull is part of legend
          if (i < legend.length) {
            colorKey = legend[i]['key']
            pathId = legend[i]['id']
            hull = convexHullService.calculateHull(results, configValues, colorKey);
          // otherwise, make hull empty (and make path invisible below)
          } else {
            hull = []
          }

          // draw area if at least three points are in hull
          if (hull.length >= 3) {     

            // initial draw (no transitions)
            if (isUpdate == false) {
              updateShadedAreaWithoutAnimation(pathId, hull, colorKey, configValues);
            // if path is visible already, transition position
            } else if (svg.select('#path' + pathId).style("visibility") == "visible") {
              updateShadedAreaAnimatingColor(pathId, hull, colorKey, configValues);
            // if path is not visible, transition only visibility (but not position)
            } else {
              updateShadedAreaAnimatingVisibility(pathId, hull, colorKey, configValues);
            }

          // if hull consists of fewer than three points, hide area
          } else {

            svg.select('#path' + pathId)
              .style("visibility","hidden");

          }

        }

      } else {

        // disable all paths (i.e., all shaded areas)
        svg.selectAll("path")
          .style("visibility","hidden");

      }

    }


    function updateShadedAreaWithoutAnimation(pathId, hull, colorKey, configValues) {

      svg.select('#path' + pathId)
        .attr("colorkey", colorKey)
        .attr('d', function(d) {
          return d3cardinalLine(hull) + 'Z'
        })
        .style('fill',colorsAndStyles.getDataColorByKey(colorKey, configValues))
        .style("visibility","visible");

    }


    function updateShadedAreaAnimatingColor(pathId, hull, colorKey, configValues) {

      svg.select('#path' + pathId)
        .transition()
        .duration(transitionSpeed)
        .attr("colorkey", colorKey)
        .attr('d', function(d) {
          return d3cardinalLine(hull) + 'Z'
        })
        .style('fill',colorsAndStyles.getDataColorByKey(colorKey, configValues))

    }


    function updateShadedAreaAnimatingVisibility(pathId, hull, colorKey, configValues) {
     
      svg.select('#path' + pathId)
        .attr("colorkey", colorKey)
        .attr('d', function(d) {
          return d3cardinalLine(hull) + 'Z'
        })
        .style('fill',colorsAndStyles.getDataColorByKey(colorKey, configValues))
        .transition()
        .duration(transitionSpeed)
        .style("visibility","visible");

    }


    // get circle radius
    function getCircleRadius(d, parentClass, configValues) {
      if (configValues.area != 'none') {
        return rScale(Math.sqrt(d.Area)) + (parentClass == 'highlight' ? 2 : 0)
      } else {
        return Math.max(5, Math.round((width+height)/150)) + (parentClass == 'highlight' ? 2 : 0);
      }
    }


    // get circle color
    function getCircleColor(d, parentClass, configValues) {
      if (parentClass == 'highlight') {
        return '#f00';
      } else {
        var configValues
        return colorsAndStyles.getDataColor(d, configValues);
      }
    }


    function smallTooltipToggle(X, Y, text) {

      if (smallTooltip.style("visibility") == "hidden") {
        smallTooltip
          .style("top", Math.round(Y)+"px")
          .style("left", Math.round(X)+"px")
          .style("visibility", "visible")
          .text(text);
      } else {
        smallTooltip
          .style("visibility", "hidden");
      }

    }


    function tooltipToggle(X, Y, d) {

      if (tooltip.style("visibility") == "visible" && prevTooltipId == d.Id) {
        tooltipHide();
      } else {
        tooltipShow(X, Y, d);
        prevTooltipId = d.Id;
      }

    }


    function tooltipShow(X, Y, d) {

      var cx, cy;

      // highlight the circle that is selected
      svg.select("#circle" + d.Id).select("circle")
        .style("stroke", "#aaa")
        .style("stroke-width", "2");

      // move around tooltip, and fill with information
      tooltip
        .style("top", Math.round(Y+10)+"px")
        .style("left", Math.round(X+33)+"px")
        .style("visibility", "visible")
        .on('click', function() {
          return toggleCarOnList(d); 
        });

      tooltipTitle
        .text(d.Make + " " + d.Model + " ");

      tooltipSubtitle
        .text(d.Suffix + " " + d.Trim);

      tooltipInfoFirst
        .text(d.Subclass + " " + d.Class);

      tooltipInfoSecond
        .text(d.Horsepower + " HP | " + d.Sales.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + " Units Sold");
        
      // for each circle that is "linked" to the one currently selected...
      for (var i = 0; i < d.Links.length; i++) {

        // if element exists (it may not exist because it is filtered out in the data generation process)
        if (!svg.select("#circle" + d.Links[i]).empty()) {

          // highlight linked circles
          if (svg.select("#circle" + d.Links[i]).attr("class") !== "highlight") {
            svg.select("#circle" + d.Links[i]).select("circle")
              .style("stroke", "#aaa")
              .style("stroke-width", "2");
          }

          var coords = d3.transform(svg.select("#circle" + d.Links[i]).attr("transform"));

          // draw line between selected circle and linked circles
          svg.select("#line" + i)
            .attr("x1", X)
            .attr("x2", coords.translate[0])
            .attr("y1", Y)
            .attr("y2", coords.translate[1])
            .style("visibility", "visible");

        }

      }

    }


    function tooltipHide() {

      tooltip
          .style("visibility", "hidden");

      //svg.selectAll("g[class=no-highlight]").select("circle")
      svg.selectAll("g").select("circle")
        .style("stroke-width", "0");

      svg.selectAll("line.linkLine")
        .style("visibility","hidden");
      
    }


    function triggerToggleCarOnList(id) {
      toggleCarOnList(svg.select("#circle" + id).datum());
    }


    function highlightDot(id) {

      var coords = d3.transform(svg.select("#circle" + id).attr("transform"));

      svg.select("#clickAnimationCircle")
        .attr("cx", coords.translate[0])
        .attr("cy", coords.translate[1])
        .attr("r", 50)
        .style("visibility", "visible");

    }


    function dehighlightDot(id) {

      svg.select("#clickAnimationCircle")
        .style("visibility", "hidden")   

    }


    function highlightHull(id) {
      svg.select('#path' + id)
        .style('opacity', '0.35');
    }


    function dehighlightHull(id) {
      svg.select('#path' + id)
        .style('opacity', '0.15');
    }


    function toggleCarOnList(d) {

      var configValues = configService.getKeyValuePairs();

      if (svg.select("#circle" + d.Id).attr("class") == "highlight") {
        removeCarFromList(d, configValues)
        dehighlightDot(d.Id)
      } else {
        addCarToList(d, configValues)
      }

    }


    function removeCarFromList(d, configValues) {

      svg.select("#circle" + d.Id).attr("class", "no-highlight");

      svg.select("#circle" + d.Id).select("circle")
        .attr("r", function(d) {
          return getCircleRadius(d, d3.select(this.parentNode).attr("class"), configValues);
        })
        .attr("fill", function(d) {
          return colorsAndStyles.getDataColor(d, configValues);
        });

      svg.select("#circle" + d.Id).select("text")
        .text("")

      // remove element from highlighted cars array
      for (var i = 0; i < uiInfo.highlightedCars.length; i++) {
        if (uiInfo.highlightedCars[i]['id'] == d.Id) {
          uiInfo.highlightedCars.splice(i, 1);
          break;
        }
      }

      // update index numbers
      for (var i = 0; i < uiInfo.highlightedCars.length; i++) {
        uiInfo.highlightedCars[i]['index'] = i+1
        svg.select("#circle" + uiInfo.highlightedCars[i]['id']).select("text")
          .text(i+1)
      }

      // broadcast the change to slider directives
      $timeout(function() {
        $rootScope.$broadcast('uiInfo:changed', uiInfo);
      })

    }


    function addCarToList(d, configValues) {

      animateClick(d.Id)

      addHighlightStyle(d.Id, uiInfo.highlightedCars.length+1, configValues)

      uiInfo.highlightedCars.push({
        'id': d.Id,
        'make': d.Make,
        'model': d.Model,
        'suffix': d.Suffix,
        'trim': d.Trim,
        'powertrain': d.Powertrain,
        'index': uiInfo.highlightedCars.length+1,
      });

      // broadcast the change to slider directives
      $timeout(function() {
        $rootScope.$broadcast('uiInfo:changed', uiInfo);
      })

    }


    // add styling to (currently non-highlighted) dot
    // this is triggered both by regular highlight function as well as directly by window-resizing (through renderPlot)
    function addHighlightStyle(id, ui_index, configValues) {

      svg.select("#circle" + id).attr("class", "highlight");

      svg.select("#circle" + id).select("circle")
        .attr("r", function(d) {
          return getCircleRadius(d, d3.select(this.parentNode).attr("class"), configValues);
        })
        .attr("fill", function(d) {
          return getCircleColor(d, d3.select(this.parentNode).attr("class"), configValues)
        });

      svg.select("#circle" + id).select("text")
        .text(ui_index)

    }


    function animateClick(id) {

      var coords = d3.transform(svg.select("#circle" + id).attr("transform"));

      svg.select("#clickAnimationCircle")
        .attr("cx", coords.translate[0])
        .attr("cy", coords.translate[1])
        .attr("r", 5)
        .style("visibility", "visible")
        .transition()
        .duration(350)
        .attr("r", 80)
        .each("end", function(d) { svg.select("#clickAnimationCircle").style("visibility", "hidden") });    

    }


  }

})();
