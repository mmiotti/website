(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .factory('mainPlot', ['$rootScope', '$timeout', 'd3', 'configService', 'convexHullService', 'legendAndColors', mainPlot]);

  function mainPlot($rootScope, $timeout, d3, configService, convexHullService, legendAndColors) {


    // set up api ("public functions")
    var api = {
      initiate: initiate,
      getAppDimensions: getAppDimensions,
      renderPlot: renderPlot,
      updatePlot: updatePlot,
      triggerToggleCarOnList: triggerToggleCarOnList,
      removeAllCarsFromList: removeAllCarsFromList,
      highlightDot: highlightDot,
      dehighlightDot: dehighlightDot,
      highlightHull: highlightHull,
      dehighlightHull: dehighlightHull,
      applyTourHighlights: applyTourHighlights
    };

    return api;


    // set up variables
    var svg, uiInfo, targets, prevLegend, prevTooltipId, transitionSpeed, tooltip, tooltipTitle, tooltipSubtitle, tooltipInfoFirst, tooltipInfoSecond, tooltipInfoThird, width, height, padding, xScale, yScale, yMin, yMax, xMin, xMax, rScale, xAxis, yAxis, d3cardinalLine;

    // initiate plot (only done at the very beginning of script
    // this function is NOT executed when window is resized
    function initiate(element) {

      // set up svg
      svg = d3.select(element)
        .append("svg")
        .attr("id","svg");

      // set up tooltip
      tooltip = d3.select(element)
        .append("div")
        .attr("id", "tooltip");

      // set up tooltip "components"
      tooltipTitle = tooltip.append("span");

      tooltipSubtitle = tooltip.append("span")
        .attr("id", "tooltip-subtitle");

      tooltipInfoFirst = tooltip.append("span")
        .attr("id", "tooltip-firstline");

      tooltipInfoSecond = tooltip.append("span")
        .attr("id", "tooltip-secondline");

      tooltipInfoThird = tooltip.append("span")
        .attr("id", "tooltip-thirdline");

      d3cardinalLine = d3.svg.line()
        .x(function(d){return xScale(d.x);})
        .y(function(d){return yScale(d.y);});

      // set up uiinfo, which is used to share data between this service and the main controller
      uiInfo = {
        'legend': [],
        'highlightedCars': []
      }

      // define target values
      targets = [200*1.61, 120*1.61, 50*1.61]

      // define transition speed of all animations in ms
      transitionSpeed = 800;

    }


    // get current app dimensions
    function getAppDimensions() {

      var maxAspectRatio = 1/1.5
      var bottomPadding = 30
      var appDim = {}

      appDim.main = d3.select("#main").node().getBoundingClientRect();
      appDim.interface = d3.select("#interface-bar").node().getBoundingClientRect();
      appDim.width = appDim.main.width-appDim.interface.width-2; // 2 is a safety margin to prevent some issues with Safari
      appDim.height = Math.min(Math.round(appDim.width*maxAspectRatio), appDim.main.height - bottomPadding);

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
      padding = {top: 40, right: 27, bottom: 60, left: 80};

      // set scales
      updateScales(results, configValues);

      // remove all previous items before rendering
      svg.selectAll("*").remove();

      // set the height based on the calculations above
      svg.attr('width', width);
      svg.attr('height', height);

      // set up background rectangle
      svg.append("rect")
        .attr("id", "frame")
        .attr("x", padding.left)
        .attr("y", padding.top)
        .attr("width", width - padding.left - padding.right)
        .attr("height", height - padding.top - padding.bottom)
        // hide tooltip on click of frame. This is only for touch control mode
        .on('click', function(d) {
          return tooltipHide();
        })

      // add groups to display targets
      // group consist of lines and labels
      var targetGroups = svg.selectAll("g.target")
        .data([[0],[1],[2]])
        .enter()
        .append("g")
        .attr("id", function(d) { return "target" + d })
        .classed("target", true)
        .style("visibility","visible")
        .on('mouseover', function(d) {
          return d3.select("#target"+d).select("text").style("visibility","visible");
        })
        .on('mouseout', function(d) {
          return d3.select("#target"+d).select("text").style("visibility","hidden");
        });

      targetGroups
        .append("rect")
        .attr("x", 0)
        .attr("y", -20)
        .attr("height", 40)
        .attr("width", xScale(xMax)-xScale(xMin))
        .style("fill", "white")
        .style("fill-opacity", 0.0);

      targetGroups
        .append("line")
        .attr("x1", 0)
        .attr("x2", xScale(xMax)-xScale(xMin));

      targetGroups
        .append("text")
        .attr("dx", xScale(xMax)-xScale(xMin)-85)
        .attr("dy", -7)
        .text(function(d) { return "20" + (parseInt(d)+3) + "0 target" })
        .style("visibility", "hidden");

      updateTargets(configValues, false);

      // add circle used for animation that is triggered when car is added to highlighted selection
      svg.append("circle")
        .attr("id", "click-animation-circle")
        .style("visibility", "hidden")
        .style('opacity','0.15')

      // add proxies for the paths that can be used to draw the shaded areas
      // we need to add those here because they have to appear below (i.e., be drawn before) the circles and lines
      svg.selectAll("path.shaded-area")
        .data([[0],[1],[2],[3],[4],[5],[6]])
        .enter()
        .append("path")
        .attr("id", function(d) { return "path" + d; })
        .classed("shaded-area", true)
        .style("visibility", "hidden")
        .style('opacity','0.15')
        .on('mouseover', function(d) {
          // highlightHull(d)
          setLegendHighlight(d, true)
        })
        .on('mouseout', function(d) {
          // dehighlightHull(d)
          setLegendHighlight(d, false)
        });

      // draw shaded areas
      drawShadedAreas(results, configValues, false)

      // add proxies for the lines between "linked" points that appear on mouse-over
      // we need to add those here because they have to appear below (i.e., be drawn before) the circles
      svg.selectAll("line.link-line")
        .data([[0],[1],[2],[3],[4]])
        .enter()
        .append("line")
        .classed("link-line", true)
        .attr("id", function(d) { return "line" + d });

      // create groups that contains circles (data points) and text
      // text is necessary for the 'highlight car' feature
      var groups = svg.selectAll("g.dataPoint")
        .data(results)
        .enter()
        .append("g")
        .classed("dataPoint", true)
        .attr("transform", function(d){return "translate("+Math.round(xScale(d.X))+","+Math.round(yScale(d.Y))+")"})
        .attr("id", function(d) {
          return "circle" + d.Id;
        })
        .on('mouseover', function(d) {
          if (controlMode == 'mouse') {
            setLegendHighlight(getLegendIndexByKey(d[configValues.legendColorField]), true)
            tooltipShow(xScale(d.X), yScale(d.Y), d);
          } else {
            return;
          }
        })
        .on('mouseout', function(d) {
          if (controlMode == 'mouse') {
            setLegendHighlight(getLegendIndexByKey(d[configValues.legendColorField]), false)
            tooltipHide();
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

      // set up circles (data points)
      groups
        .append("circle")
        .attr("r", function(d) {
          return getCircleRadius(d, d3.select(this.parentNode).classed("highlight"), configValues);
        })
        .attr("fill", function(d) {
          return getCircleColor(d, d3.select(this.parentNode).classed("highlight"), configValues);
        })
        .style("opacity", "0.8");

      // set up text (used for highlighting specific points on click)
      groups
        .append("text")
        .attr("text-anchor", "middle")
        .attr("dx", 0)
        .attr("dy", 5)
        .text("")
        .attr("fill", "#fff")
        .style("pointer-events", "none");

      for (var i = 0; i < uiInfo.highlightedCars.length; i++) {
        addHighlightStyle(uiInfo.highlightedCars[i]['id'], i+1, configValues)
      }

      // finally, plot axes above everything else
      appendAxes(configValues);

      // update legend
      updateLegend(configValues);

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
      var group = svg.selectAll("g.dataPoint")
        .data(results)
        .on('mouseover', function(d) {
          if (controlMode == 'mouse') {
            setLegendHighlight(getLegendIndexByKey(d[configValues.legendColorField]), true)
            tooltipShow(xScale(d.X), yScale(d.Y), d);
          } else {
            return;
          }
        })
        .on('mouseout', function(d) {
          if (controlMode == 'mouse') {
            setLegendHighlight(getLegendIndexByKey(d[configValues.legendColorField]), false)
            tooltipHide();
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

      updateTargets(configValues, true);

      // finally, plot axes above everything else
      appendAxes(configValues);
      // update legend
      updateLegend(configValues);

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
        xMax = configService.getCurrentOptionObject('xAxis').maxLim / getUnitConversionFactor(configValues);
        yMax = configService.getCurrentOptionObject('yAxis').maxLim / getUnitConversionFactor(configValues);
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
        .range([1, 20]);

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

      svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", Math.round((width-padding.left-padding.right)/2) + padding.left)
        .attr("y", height - 15)
        .text(getAxisText(configValues, xSettings))
        .style("font-size", "15px");

      svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -Math.round((height-padding.top-padding.bottom)/2) - padding.top)
        .attr("y", 30)
        .attr("transform", "rotate(-90)")
        .text(getAxisText(configValues, ySettings))
        .style("font-size", "15px");

    }


    function getAxisText(configValues, settingsObject) {

      if (settingsObject.hasOwnProperty('unit_si') && settingsObject.hasOwnProperty('unit_us')) {
        var unit = settingsObject['unit_' + configValues['units']]
      } else {
        var unit = settingsObject.unit
      }

      var label = settingsObject.axis_label;

      if (label.includes('{{unit}}')) {
        return label.replace('{{unit}}', unit);
      } else {
        return label + ' (' + unit + ')';
      }

    }


    function updateTargets(configValues, doAnimate) {
      // go through each target line
      for (var i = 0; i <= 2; i++) {
        // if y axis is set to total GHG emissions (to which targets apply) and target falls within box
        if (configValues['yAxis'] == 'ghg_total' && targets[i] / getUnitConversionFactor(configValues) > yMin) {
          var yValue = yScale(targets[i] / getUnitConversionFactor(configValues))
          if (doAnimate == true) {
            // if already visible, directly animate to position
            if (d3.select("#target"+i).style("visibility") == "visible") {
              updateTargetAnimatingFromCurrentPosition(i, yValue)
            // if not visible already, first set y values to ymin, and then animate to position
            } else {  
              updateTargetAnimatingByStartingAtBottom(i, yValue)
            }
          } else {
            updateTargetWithoutAnimation(i, yValue)
          }
        } else {
          // if currently visible
          if (d3.select("#target"+i).style("visibility") == "visible") {
            if (doAnimate == true) {
              hideTargetWithAnimation(i)
            } else {
              hideTargetWithoutAnimation(i)
            }
          }
        }
      }
    }


    function updateTargetAnimatingFromCurrentPosition(i, yValue) {
      d3.select("#target"+i)
        .transition()
        .duration(transitionSpeed)
        .attr("transform", "translate("+xScale(xMin)+","+yValue+")")
    }


    function updateTargetAnimatingByStartingAtBottom(i, yValue) {
      d3.select("#target"+i)
        .attr("transform", "translate("+xScale(xMin)+","+yScale(yMin)+")")
        .style("visibility", "visible")
        .transition()
        .duration(transitionSpeed)
        .attr("transform", "translate("+xScale(xMin)+","+yValue+")")
    }


    function updateTargetWithoutAnimation(i, yValue) {
      d3.select("#target"+i)
        .attr("transform", "translate("+xScale(xMin)+","+yValue+")")
    }


    function hideTargetWithAnimation(i) {
      d3.select("#target"+i)
        .transition()
        .duration(transitionSpeed)
        .attr("transform", "translate("+xScale(xMin)+","+yScale(yMin)+")")
        .each("end", function(d) { d3.select("#target"+d).style("visibility", "hidden"); });
    }


    function hideTargetWithoutAnimation(i) {
      d3.select("#target"+i)
        .style("visibility", "hidden")
    }


    // draw the shaded areas beneath the group of points belonging to a given category
    function drawShadedAreas(results, configValues, isUpdate) {

      // update shaded areas
      if (configValues.shadedAreas != 'none') {

        d3cardinalLine.interpolate(configValues.shadedAreas);
        var legend = legendAndColors.getLegend(configValues)
        var hull = []
        var colorKey = ''
        var pathId = 0

        // loop through all proxies that can be used to draw shaded areas
        for (var i = 0; i < 7; ++i) {

          // if hull is part of legend
          if (i < legend.length) {
            colorKey = legend[i]['key']
            // pathId = legend[i]['id']
            pathId = i
            hull = convexHullService.calculateHull(results, configValues, colorKey);          
          // otherwise, make hull empty (and make path invisible below)
          } else {
            hull = []
            pathId = i
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
        svg.selectAll("path.shaded-area")
          .style("visibility","hidden");

      }

    }


    function updateShadedAreaWithoutAnimation(pathId, hull, colorKey, configValues) {
      svg.select('#path' + pathId)
        .attr("colorkey", colorKey)
        .attr('d', function(d) {
          return d3cardinalLine(hull) + 'Z'
        })
        .style('fill', legendAndColors.getDataColorByKey(colorKey, configValues))
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
        .style('fill',legendAndColors.getDataColorByKey(colorKey, configValues))
    }


    function updateShadedAreaAnimatingVisibility(pathId, hull, colorKey, configValues) {
      svg.select('#path' + pathId)
        .attr("colorkey", colorKey)
        .attr('d', function(d) {
          return d3cardinalLine(hull) + 'Z'
        })
        .style('fill',legendAndColors.getDataColorByKey(colorKey, configValues))
        .transition()
        .duration(transitionSpeed)
        .style("visibility","visible");
    }


    // get circle radius
    function getCircleRadius(d, is_highlight, configValues) {
      if (d.Id == 'avg') {
        return 6;
      }
      // if we're scaling the circle radius according to an independent variable
      if (configValues.area != 'none') {
        return rScale(Math.sqrt(d.Area)) + (is_highlight ? 2 : 0)
      // if the circle radius is the same for all points, scale it with the graph size
      } else {
        var min_radius = 5;
        var max_radius = 12;
        return Math.max(min_radius, Math.min(Math.round((width+height)/150), max_radius)) + (is_highlight ? 2 : 0);
      }
    }


    // get circle color
    function getCircleColor(d, is_highlight, configValues) {
      if (is_highlight) {
        return '#f00';
      } else {
        return legendAndColors.getDataColor(d, configValues);
      }
    }


    // enable (value = true) or disable (value = false) highlight class of legend item
    // (is broadcast to main controller)
    function setLegendHighlight(index, value) {
      if (index >= 0) {
        $timeout(function() {
          uiInfo.legend[index].highlight = value;
          $rootScope.$broadcast('uiInfo:changed', uiInfo);
        })
      }
    }


    // returns the index (0, 1, 2...) of a legend item by the legend key
    function getLegendIndexByKey(key) {
      var index = -1;
      uiInfo.legend.some(function(item) {
        if (item.key == key) {
          index = item.id;
          return false;
        }
      })
      return index;
    }


    // update legend (without timeout, the $apply called by $broadcast will run into active $digest's while dragging a slider)
    function updateLegend(configValues) {
      $timeout(function() {
        uiInfo.legend = legendAndColors.getLegend(configValues);
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
            return getCircleRadius(d, d3.select(this.parentNode).classed("highlight"), configValues);
          })
          .attr("fill", function(d) {
            return getCircleColor(d, d3.select(this.parentNode).classed("highlight"), configValues);
          });
    }



    function getUnitConversionFactor(configValues) {
      if (configValues['units'] == 'us') {
        return 1;
      } else {
        return 1.61;
      }
    }


    // hide or show tooltip
    function tooltipToggle(X, Y, d) {

      if (tooltip.style("visibility") == "visible" && prevTooltipId == d.Id) {
        tooltipHide();
      } else {
        tooltipShow(X, Y, d);
        prevTooltipId = d.Id;
      }

    }


    // show tooltip, highlight selected dot, and show link lines
    function tooltipShow(X, Y, d) {

      var cx, cy;

      // highlight the circle that is selected
      if (d.Id != 'avg') {
        svg.select("#circle" + d.Id).select("circle")
          .style("stroke", "#aaa")
          .style("stroke-width", "2");
      }

      // move around tooltip, and fill with information
      tooltip
        .style("top", Math.round(Y+10)+"px")
        .style("left", Math.round(X+20)+"px")
        .style("visibility", "visible")
        .on('click', function() {
          return toggleCarOnList(d); 
        });

      tooltipTitle
        .text(d.Make + " " + d.Model + " ");

      tooltipSubtitle
        .text(d.Suffix + " " + d.Trim);

      tooltipInfoFirst
        .text(d.Id != 'avg' ? d.Subclass + " " + d.Class : '');

      tooltipInfoSecond
        .text(d.Id != 'avg' ? d.Horsepower + " HP | " + Math.round(d.Weight) + " kg" : '');

      tooltipInfoThird
        .text(d.Id != 'avg' ? d.Sales.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'") + " sales in 2014 (all trims)" : '');
        
      // for each circle that is "linked" to the one currently selected...
      for (var i = 0; i < d.Links.length; i++) {

        // if element exists (it may not exist because it is filtered out in the data generation process)
        if (!svg.select("#circle" + d.Links[i]).empty()) {

          // highlight linked circles
          if (svg.select("#circle" + d.Links[i]).classed("highlight") == false) {
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


    // hide tooltip
    // makes tooltip invisible, removes stroke from higlighted dot, and hides link lines
    function tooltipHide() {

      tooltip
        .style("visibility", "hidden");

      svg.selectAll("g.dataPoint").select("circle")
        .filter(function(d) { return (d.Id !== 'avg')})
        .style("stroke-width", "0");

      svg.selectAll("line.link-line")
        .style("visibility","hidden");
      
    }


    function triggerToggleCarOnList(id) {
      toggleCarOnList(svg.select("#circle" + id).datum());
    }


    function highlightDot(id) {

      var coords = d3.transform(svg.select("#circle" + id).attr("transform"));

      svg.select("#click-animation-circle")
        .attr("cx", coords.translate[0])
        .attr("cy", coords.translate[1])
        .attr("r", 50)
        .style("visibility", "visible");

    }


    function dehighlightDot(id) {

      svg.select("#click-animation-circle")
        .style("visibility", "hidden")   

    }


    function highlightHull(id) {
      svg.select('#path' + id)
        .style('opacity', '0.3');
    }


    function dehighlightHull(id) {
      svg.select('#path' + id)
        .style('opacity', '0.15');
    }


    function toggleCarOnList(d) {

      var configValues = configService.getKeyValuePairs();

      if (svg.select("#circle" + d.Id).classed("highlight")) {
        removeCarFromList(d, configValues)
        dehighlightDot(d.Id)
      } else {
        addCarToList(d, configValues)
      }

    }


    function removeAllCarsFromList() {
      for (var i = uiInfo.highlightedCars.length; i > 0; i--) {
        triggerToggleCarOnList(uiInfo.highlightedCars[0]['id'])
      }
    }


    function removeCarFromList(d, configValues) {

      svg.select("#circle" + d.Id).classed("highlight", false);

      svg.select("#circle" + d.Id).select("circle")
        .attr("r", function(d) {
          return getCircleRadius(d, d3.select(this.parentNode).classed("highlight"), configValues);
        })
        .attr("fill", function(d) {
          return legendAndColors.getDataColor(d, configValues);
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

      svg.select("#circle" + id).classed("highlight", true);

      svg.select("#circle" + id).select("circle")
        .attr("r", function(d) {
          return getCircleRadius(d, d3.select(this.parentNode).classed("highlight"), configValues);
        })
        .attr("fill", function(d) {
          return getCircleColor(d, d3.select(this.parentNode).classed("highlight"), configValues)
        });

      svg.select("#circle" + id).select("text")
        .text(ui_index)

    }


    // shows an animation (growing circle) after click on a dot to add dot to the list of higlighted cars
    function animateClick(id) {

      var coords = d3.transform(svg.select("#circle" + id).attr("transform"));

      svg.select("#click-animation-circle")
        .attr("cx", coords.translate[0])
        .attr("cy", coords.translate[1])
        .attr("r", 5)
        .style("visibility", "visible")
        .transition()
        .duration(350)
        .attr("r", 80)
        .each("end", function(d) { svg.select("#click-animation-circle").style("visibility", "hidden") });    

    }


    // higlights specific areas of the chart, depending on current index of introductory tour
    function applyTourHighlights(index) {

      // highlight main chart
      if (index == 2) {
        d3.select("#frame").style("fill", "#ffcdcc")
      } else {
        d3.select("#frame").style("fill", "white")
      }

      // highlight targets
      if (index == 4) {
        d3.selectAll(".target").select("rect").style("fill", "#ffcdcc")
        d3.selectAll(".target").select("rect").style("fill-opacity", 1.0)
      } else {
        d3.selectAll(".target").select("rect").style("fill", "white")
        d3.selectAll(".target").select("rect").style("fill-opacity", 0.0)
      }

    }


  }

})();
