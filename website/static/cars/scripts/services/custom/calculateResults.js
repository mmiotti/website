(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .factory('calculateResults', ['configService', calculateResults]);

  function calculateResults(configService) {

    var data = {};
    var configValues = {};

    // set up api ("public functions")
    var api = {
      calculate: calculate,
    };

    return api;


    // calculate results based on input data and current state of config
    function calculate(myData) {

      data = myData;
      configValues = configService.getKeyValuePairs();
    
    	var results = [];
      var x, y;
      var x_weighted = 0;
      var y_weighted = 0;
      var weight_sum = 0;

      // loop through raw data and get results (data to plot)
    	data.veh.forEach(function(item) {
        x = calculateValueWrapper('xAxis', item);
        y = calculateValueWrapper('yAxis', item);
    		results.push({
    			Make:  item.Make,
          Model:  item.Model,
          Suffix: item.Suffix,
          Trim: item[configValues.trim + "_Name"],
          Class: item.Class,
          Subclass: item.Subclass,
          Combined_Type: item.Combined_Type,
    			Powertrain: item.Powertrain,
          Horsepower: getHorsepower(item),
          Weight: getVehCurbWeight(item),
          Sales: +item.Sales,
          Links: item.Links,
          Id: item.Id,
    			X: x,
    			Y: y,
    			Area: configValues.area !== 'none' ? calculateValue('area', item) : 0,
    		});
        x_weighted += x * item.Sales;
        y_weighted += y * item.Sales;
        weight_sum += (+item.Sales);
    	});

      // add average as last point
      results.push({
        Make: 'Sales-weighted average',
        Model: '',
        Suffix: '',
        Trim: '',
        Class: 'Average',
        Subclass: '',
        Combined_Type: 'Average',
        Powertrain: 'Average',
        Horsepower: '',
        Weight: '',
        Sales: 0,
        Links: [],
        Id: 'avg',
        X: x_weighted/weight_sum,
        Y: y_weighted/weight_sum,
        Area: 0,
      });

    	return results;

    }


    function calculateValueWrapper(which, item) {

      if (item.Powertrain === 'PHEV') {

        item.Combined_Type = 'PHEV_CD';
        var results_CD = calculateValue(which, item);

        item.Combined_Type = 'PHEV_CS';
        var results_CS = calculateValue(which, item);

        item.Combined_Type = 'PHEV';
        return configValues.cd_share/100 * results_CD + (1-configValues.cd_share/100) * results_CS;

      } else {
        return calculateValue(which, item);
      }

    }


    function calculateValue(which, item) {

      var dataType = configValues[which];

      switch (dataType) {
        case 'costs_msrp':
          return getMsrp(item);
        case 'costs_fuel':
          // return getFuelCosts(item) * configValues['distance_per_year'] * getUnitConversionFactor() * configValues['lifetime'] * 1000;
          return getFuelCosts(item);
        case 'costs_total':
          return getTotalCosts(item);
        case 'ghg_veh':
          return getVehGhgEmissions(item) / 1000;
        case 'ghg_fuel':
          // return getFuelGhgEmissions(item) * configValues['distance_per_year'] * getUnitConversionFactor() * configValues['lifetime'] / 1000;
          return getFuelGhgEmissions(item);
        case 'ghg_total':
          return getTotalGhgEmissions(item);
        case 'sales':
          return +item.Sales;
        case 'horsepower':
          return getHorsepower(item);
        case 'power_to_weight':
          return getPowerToWeightRatio(item);
        case 'none':
          return item.Id;
        default:
          console.log('Unkown data type: Cannot calculate values for \'' + dataType + '\'');
      }

    }


    function getMsrp(item) {

      return item[configValues.trim + "_MSRP"]
        - ( (configValues.refunds == 'federal' || configValues.refunds == 'both') ? (item.Refund_Federal * 1.0 || 0) : 0)
        - ( (configValues.refunds == 'state' || configValues.refunds == 'both') ? (item.Refund_State * 1.0 || 0) : 0);

    }


    function getUnitConversionFactor() {
      if (configValues['units'] == 'us') {
        return 1;
      } else {
        return 1.61;
      }
    }


    function getFuelCosts(item) {
      //return data.fuelCoeff[getFuelIndex(item)]['Price_' + configValues.fuel_prices]
      //  * getGallonsPerMile(item) * getUnitConversionFactor();
      return configValues['price_' + getFuelIndex(item)]
        * getGallonsPerMile(item) / getUnitConversionFactor();
    }


    function getMaintenanceCosts(item) {
      return data.vehCoeff[getVehIndex(item, false)].Maintenance / (configValues.distance_per_year * getUnitConversionFactor() * 1000);
    }


    function getTotalCosts(item) {

      var averageDiscountFactor =  getAverageDiscountFactor(configValues.discount_rate/100, configValues.lifetime);

      return getMsrp(item) / (configValues.lifetime * configValues.distance_per_year * getUnitConversionFactor() * 1000)
        + getFuelCosts(item) * averageDiscountFactor
        + getMaintenanceCosts(item) * averageDiscountFactor;

    }


    function getVehGhgEmissions(item) {

      var vehIndex = getVehIndex(item, true);
      var scalingMass = getVehCurbWeight(item)
        - data.vehCoeff[vehIndex].X1
        - data.vehCoeff[vehIndex].X6 * (item.Battery_Power || 0)
        - data.vehCoeff[vehIndex].X9 * (item.Battery_Capacity || 0)
        - data.vehCoeff[vehIndex].X12 * (item.Fuelcell_Power || 0);

      return (data.vehCoeff[vehIndex].X2 * 1000
        + data.vehCoeff[vehIndex].X3 * configValues.electricity_ghg_veh
        + data.vehCoeff[vehIndex].X4 * 1000 * scalingMass
        + data.vehCoeff[vehIndex].X5 * scalingMass * configValues.electricity_ghg_veh
        + data.vehCoeff[vehIndex].X7 * 1000 * (item.Battery_Power || 0)
        + data.vehCoeff[vehIndex].X8 * (item.Battery_Power || 0) * configValues.electricity_ghg_veh
        + data.vehCoeff[vehIndex].X10 * 1000 * (item.Battery_Capacity || 0)
        + data.vehCoeff[vehIndex].X11 * (item.Battery_Capacity || 0) * configValues.electricity_ghg_veh
        + data.vehCoeff[vehIndex].X13 * 1000 * (item.Fuelcell_Power || 0)
        + data.vehCoeff[vehIndex].X14 * (item.Fuelcell_Power || 0) * configValues.electricity_ghg_veh)/1000;

    }


    function getFuelGhgEmissions(item) {

      var fuelIndex = getFuelIndex(item);
      var gallonsPerMile = getGallonsPerMile(item);

      return (data.fuelCoeff[fuelIndex].X1 * 1.000
        + data.fuelCoeff[fuelIndex].X2 * gallonsPerMile
        + data.fuelCoeff[fuelIndex].X3 * gallonsPerMile * configValues.electricity_ghg_fuel
        + data.fuelCoeff[fuelIndex].X4 * 1.000
        + data.fuelCoeff[fuelIndex].X5 * gallonsPerMile
        + data.fuelCoeff[fuelIndex].X6 * gallonsPerMile * configValues.electricity_ghg_fuel) / getUnitConversionFactor();

    }


    function getTotalGhgEmissions(item) {
      return getVehGhgEmissions(item) * 1000 / (configValues.lifetime * configValues.distance_per_year * getUnitConversionFactor() * 1000)
        + getFuelGhgEmissions(item);
    }


    function getHorsepower(item) {
      return item[configValues.trim + "_HP"]*1.000;
    }


    function getPowerToWeightRatio(item) {
      return getHorsepower(item)/getVehCurbWeight(item);
    }


    function getVehIndex(item, includeEcoinvent) {

      if (configValues.inventory_source == "ecoinvent" && includeEcoinvent == true) {
        return "ecoinvent";
      } else {
        return getGreetClass(item) + '_' + item.Powertrain;
      }

    }


    function getFuelIndex(item) {

      var prop = '';
      var ecoinventSuffix = "_ecoinvent";

      switch (item.Combined_Type) {
        case 'ICEV':
        case 'HEV':
        case 'PHEV':
        case 'PHEV_CS':
          if (item.Fueltype) {
            prop = item.Fueltype;
          } else {
            prop = 'Gasoline';
          }
          break;
        case 'PHEV_CD':
        case 'BEV':
          prop = 'Electricity';
          break;
        case 'FCV':
          prop = configValues['hydrogen_pathway'];
          break;
        default:
          prop = item.Fueltype;
          break;
      }

      if (configValues.inventory_source == "ecoinvent" && data.fuelCoeff.hasOwnProperty(prop + ecoinventSuffix)) {
        return prop + ecoinventSuffix;
      } else {
        return prop;
      }

    }


    function getGreetClass(item) {

      switch (item.Class) {
        case 'Pickup':
          return 'PickUp';
        case 'SUV':
          return 'SUV';
        default:
          return 'Car';
      }

    }


    function getGallonsPerMile(item) {

      var suffix = '';

      if (item.Combined_Type == 'PHEV_CD') {
        suffix = '_CD';
      }

      var mpg = {City: 0, Highway: 0};

      if (item.Combined_Type == 'PHEV_CD' && item.CD_Gasoline > 0) {
        mpg.City = (1-item.CD_Gasoline)/((1/item[configValues.trim + "_MPG_City_CD"])-(item.CD_Gasoline/item[configValues.trim + "_MPG_City"]));
        mpg.Highway = (1-item.CD_Gasoline)/((1/item[configValues.trim + "_MPG_Highway_CD"])-(item.CD_Gasoline/item[configValues.trim + "_MPG_Highway"]));
      } else {
        mpg.City = item[configValues.trim + "_MPG_City" + suffix];
        mpg.Highway = item[configValues.trim + "_MPG_Highway" + suffix];
      }

      // a default charge efficiency is included in EPA ratings (quite high, about 93% for Tesla Model S)
      // therefore, we don't include the charging efficiency for now
      var chargingEfficiency = 1;
      
      //if (item.Combined_Type == 'PHEV_CD' || item.Combined_Type == 'BEV') {
      //  chargingEfficiency = configValues.charge_efficiency;
      //}
      
      return ((configValues.cityshare/100)/mpg.City + (1-configValues.cityshare/100)/mpg.Highway);

    }


    function getAverageDiscountFactor(rate, lifetime) {
      
      if (rate <= 0) {
        return 1;
      } else {
        // finite geometric sum
        return ((1-Math.pow(1-rate, lifetime))/(1-(1-rate))/lifetime);
      }

    }


    function getVehCurbWeight(item) {

      if (item.MSRP_Highest > item.MSRP_Lowest) {
        return (item.Weight_Lowest * 1.000
          + ((item.Weight_Highest || item.Weight_Lowest) - item.Weight_Lowest)
          * (item[configValues.trim + "_MSRP"] - item.MSRP_Lowest) / (item.MSRP_Highest - item.MSRP_Lowest))/2.2046;
      } else {
        return item.Weight_Lowest/2.2046;
      }
      
    }

  }

})();