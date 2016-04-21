(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .factory('convexHullService', ['colorsAndStyles', convexHullService]);

  function convexHullService(colorsAndStyles) {

    // set up api ("public functions")
    var api = {
      calculateHull: calculateHull
    };

    return api;


    // calculate convex hull
    function calculateHull(results, configValues, colorKey) {

      var points = [];
      var initial = {'value': 0, 'index': -1};
      var maxAngle = {'value': 0, 'index': -1};
      var maxHullPoints = 30;
      var index = 0;

      for (var i = 0; i < results.length; ++i) {

        // check if this data point belongs to the group of points that we want inside this area
        if (results[i][configValues.legendColorField].trim() === colorKey && !colorsAndStyles.isFiltered(results[i], configValues)) {

          points.push({'index': index, 'svgIndex': results[i]['Id'], 'x': results[i]['X'], 'y': results[i]['Y'], 'angle': 0});

          // find point with lowest Y coordinate
          if (initial.index == -1 || results[i]['Y'] < initial.value) {
            initial.index = index;
            initial.value = results[i]['Y'];
          }

          ++index;

        }

      }

      if (points.length == 0) {
        return [{'x': 0, 'y': 0}];
      }

      // calculate the angle (respectively, a function of the angle monotonic in [0, pi)) for each other point
      for (var index = 0; index < points.length; ++index) {

        // the following function is the cosign of the angle (the dot product of each vector divided by the product of the length of each vector).
        // the two vectors (u1,u2) and (v1,v2) are (1,0) [along the x-axis] and (X-X_initial,Y-Y_initial)
        points[index]['angle'] =
          (points[index]['x']-points[initial.index]['x'])/
          (1*(Math.sqrt(Math.pow(points[index]['x']-points[initial.index]['x'],2)+Math.pow(points[index]['y']-points[initial.index]['y'],2))));

        // if this is the point itself, set the angle to -1
        if (index == initial.index) {
          points[index]['angle'] = 1;
        }

        // look for point with highest angle
        if (maxAngle.index == -1 || points[index]['angle'] < maxAngle.value) {
          maxAngle.index = index;
          maxAngle.value = points[index]['angle'];
        }

      }

      // add the point with the highest angle a second time, but setting the angle to a value lower than the initial point (which is set to -1).
      // this way, this point will be the point with index 0 after sorting, and the initial point will be the point with index 1
      points.push({'index': points.length, 'x': points[maxAngle.index]['x'], 'y': points[maxAngle.index]['y'], 'angle': 1.1})

      // sort all other points according to this angle
      points.sort(function(a, b) {
        if (a.angle > b.angle)
          return -1;
        if (a.angle < b.angle)
          return 1;
        return 0;
      });

      // use algorithm (see pseudo-code on https://en.wikipedia.org/wiki/Graham_scan)
      var M = 1;
      var temp;

      for (var i = 2; i < points.length; ++i) {

        // Remove added points from the hull (by going back down with the M index) for as long as a right turn is formed by the next point on the list and the two most recent points on the hull
        // I *think* this while loop could be made simpler because we can assume that there is no perfect collinearity
        // NOTE: Threshold > 0 (such as 0.05) will exclude points that almost don't contribute to shape because they sit on (almost) a straight line
        // These points tend to make the cardinal smoothing look weird, especially when they are close to an actual, sharp "corner".
        // POSSIBLE TODO: This threshold could me made context-sensitive (e.g., the higher, the closer this point sits to the previous point, and the higher, the more points there are in general)
        while (counterClockWise(points[M-1], points[M], points[i]) <= 0.0) {
          if (M > 1) {
            M -= 1;
          } else if (i == points.length - 1) {
            break;
          } else {
            ++i;
          }
        }

        ++M;

        // array swap between Mth and ith element
        var temp = points[M];
        points[M] = points[i];
        points[i] = temp;

      }

      // duplicate the last point several times, until the array slice to return contains maxHullPoints points
      // this will remove the issues with the animation of the hull where new points (if the new hull contains more) appear in the middle of the graph
      for (var i = M+1; i <= maxHullPoints; i++) {
       points[i] = points[M];
      }
      M = maxHullPoints;

      // points = points.slice(1,M+1)

      // var newpoints = [points[0]];
      // var prevpoint = points[0];
      // var thispoint = []

      // for (i = 1; i < points.length; i++) {
      //   thispoint = points[i]
      //   if (Math.sqrt(Math.pow(thispoint.x - prevpoint.x,2) + Math.pow(thispoint.y - prevpoint.y,2)) > 100) {
      //     newpoints.push({
      //       'x': (thispoint.x + prevpoint.x)/2,
      //       'y': (thispoint.y + prevpoint.y)/2
      //     })
      //   }
      //   newpoints.push(thispoint);
      //   prevpoint = thispoint;
      // }

      return(points.slice(1,M+1))
      //return newpoints;

    }

    // returns angle (< 0 if direction is counter-clockwise)
    function counterClockWise(p1, p2, p3) {
      return (p2.x - p1.x)*(p3.y - p1.y) - (p2.y - p1.y)*(p3.x - p1.x);
    }

  }

})();
