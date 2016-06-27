(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .factory('getConfigOptions', getConfigOptions);

  function getConfigOptions() {

    // set up api ("public functions")
    var api = {
      getOptions: getOptions,
    };

    return api;

    function getOptions() {

      // Note: For sliders, min, max, default value and stepSize must be consistent with each other. If a default value does not fall on a "step," the slider will get weird.

      var settings = []
      var axisOptions = [];

      axisOptions.push({
          'key': 'costs_msrp',
          'title': 'Vehicle costs (MSRP minus tax refunds)',
          'group': 'Costs',
          'unit': 'US$',
          'maxLim': 70000
      });

      axisOptions.push({
          'key': 'costs_fuel',
          'title': 'Fuel costs',
          'group': 'Costs',
          'unit': 'US$',
          'maxLim': 0.15
      });

      axisOptions.push({
          'key': 'costs_total',
          'title': 'Vehicle, fuel, and maintenance costs',
          'group': 'Costs',
          'unit': 'US$',
          'maxLim': 0.5
      });

      axisOptions.push({
          'key': 'ghg_veh',
          'title': 'Vehicle cycle emissions',
          'group': 'Greenhouse gas emissions',
          'unit': 'tCO₂eq',
          'maxLim': 20
      });

      axisOptions.push({
          'key': 'ghg_fuel',
          'title': 'Fuel Cycle emissions',
          'group': 'Greenhouse gas emissions',
          'unit': 'gCO₂eq / km',
          'maxLim': 500
      });

      axisOptions.push({
          'key': 'ghg_total',
          'title': 'Total lifecycle emissions',
          'group': 'Greenhouse gas emissions',
          'unit': 'gCO₂eq / km',
          'maxLim': 500
      });

      axisOptions.push({
          'key': 'sales',
          'title': 'Sales',
          'group': 'Other',
          'unit': 'units sold in 2014',
          'maxLim': 800000
      });

      axisOptions.push({
          'key': 'horsepower',
          'title': 'Horsepower',
          'group': 'Other',
          'unit': 'HP',
          'maxLim': 400
      });

      axisOptions.push({
          'key': 'power_to_weight',
          'title': 'Power-to-weight Ratio',
          'group': 'Other',
          'unit': 'HP/kg',
          'maxLim': 0.25
      });

      axisOptions.push({
          'key': 'none',
          'title': 'None',
          'unit': '-',
          'maxLim': 0
      });

      var dataAndDisplay = [];

      dataAndDisplay.push({
          'isSelect': true,
          'key': 'xAxis',
          'value': 'costs_total',
          'title': 'X-Axis',
          'options': axisOptions
      });

      dataAndDisplay.push({
          'isSelect': true,
          'key': 'yAxis',
          'value': 'ghg_total',
          'title': 'Y-Axis',
          'options': axisOptions
      });

      dataAndDisplay.push({
          'isSelect': true,
          'key': 'area',
          'value': 'none',
          'title': 'Circle area',
          'options': axisOptions
      });

      /*dataAndDisplay.push({
          'isSelect': true,
          'key': 'shadedAreas',
          'value': 'cardinal-closed',
          'title': 'Shaded area',
          'options': [
              {
                  'key': 'linear',
                  'title': 'Sharp (Linear)'
              },
              {
                  'key': 'cardinal-closed',
                  'title': 'Smooth (Cardinal)'
              },
              {
                  'key': 'basis-closed',
                  'title': 'Stylized (B-Spline)'
              },
              {
                  'key': 'none',
                  'title': 'None'
              }
          ]
      });*/

      dataAndDisplay.push({
          'isSelect': true,
          'key': 'axisLimits',
          'value': 'dynamic',
          'title': 'Axis Limits',
          'options': [
              {
                  'key': 'dynamic',
                  'title': 'Dynamic'
              },
              {
                  'key': 'hybrid',
                  'title': 'Fixed lower limits (at 0)'
              },
              {
                  'key': 'fixed',
                  'title': 'Fixed'
              }
          ]
      });

      dataAndDisplay.push({
          'isSelect': true,
          'key': 'legendColorField',
          'value': 'Combined_Type',
          'title': 'Circle Colors',
          'options': [
              {
                  'key': 'Combined_Type',
                  'title': 'Powertrain (ICEV, BEV, ...)'
              },
              {
                  'key': 'Subclass',
                  'title': 'Size (Compact, Mid-size, ...)'
              },
              {
                  'key': 'Class',
                  'title': 'Class (Sedan, SUV, ...)'
              }
          ]
      });

      /*dataAndDisplay.push({
          'isSelect': true,
          'key': 'trim',
          'value': 'Trim1',
          'title': 'Trim',
          'options': [
              {
                  'key': 'Trim1',
                  'title': 'Best fuel economy (MPG)'
              },
              {
                  'key': 'Trim2',
                  'title': 'Worst fuel economy (MPG)'
              }
          ]
      });*/

      /*dataAndDisplay.push({
          'isSelect': true,
          'key': 'inventory_source',
          'value': 'GREET',
          'title': 'Inventories',
          'options': [
              {
                  'key': 'GREET',
                  'title': 'GREET 2014'
              },
              {
                  'key': 'ecoinvent',
                  'title': 'ecoinvent 3 (experimental!)'
              }
          ]
      });*/

      settings.push({
          title: 'Data and Display',
          settings: dataAndDisplay,
          showIf: 'display',
      });

      var conditions = [];

      conditions.push({
          'isSelect': true,
          'key': 'refunds',
          'value': 'federal',
          'title': 'Tax refunds',
          'options': [
              {
                  'key': 'none',
                  'title': 'None'
              },
              {
                  'key': 'state',
                  'title': 'Best State (e.g. CA)'
              },
              {
                  'key': 'federal',
                  'title': 'Federal'
              },
              {
                  'key': 'both',
                  'title': 'Federal and State'
              }
          ]
      });

      conditions.push({
        isSlider: true,
        key: "price_Gasoline",
        title: "Gasoline Price",
        help: "The price of non-premium gasoline in $/gallon. The highest monthly inflation-corrected average during the past 10 years was $4.47/gallon, the lowest monthly average $1.86/gallon.",
        min: 1,
        max: 9,
        default: 3.1,
        stepSize: 0.1,
        unit: "$/gal"
      });

      conditions.push({
        isSlider: true,
        key: "price_Diesel",
        title: "Diesel Price",
        help: "The price of diesel in $/gallon. The highest monthly inflation-corrected average during the past 10 years was $5.17/gallon, the lowest monthly average $1.94/gallon.",
        min: 1,
        max: 9,
        default: 3.3,
        stepSize: 0.1,
        unit: "$/gal"
      });

      conditions.push({
        isSlider: true,
        key: "price_Electricity",
        title: "El. Price",
        help: "The price of electricity at the outlet in cents / kWh. The highest monthly inflation-corrected average during the past 10 years was 13.3 cents / kWh, the lowest monthly average was 10.3 cents / kWh.",
        min: 0,
        max: 30,
        default: 12,
        stepSize: 1,
        unit: "$/kWh"
      });

      conditions.push({
        isSlider: true,
        key: "electricity_ghg_veh",
        title: "El. Prod.",
        help: "GHG emission intensity of electricity production and distribution for the electricity used to produce the vehicles.",
        min: 0,
        max: 1000,
        default: 620,
        stepSize: 20,
        unit: "gCO₂/kWh"
      });

      conditions.push({
        isSlider: true,
        key: "electricity_ghg_fuel",
        title: "El. Charge",
        help: "GHG emission intensity of electricity production and distribution for the electricity used to charge vehicles and to produce fuels.",
        min: 0,
        max: 1000,
        default: 620,
        stepSize: 20,
        unit: "gCO₂/kWh"
      });

      conditions.push({
        isSlider: true,
        key: "price_H2",
        title: "Hydrogen Price",
        help: "The price of hydrogen in $ / kg.",
        min: 0,
        max: 12,
        default: 4,
        stepSize: 1,
        unit: "$/kg"
      });

      conditions.push({
          'isSelect': true,
          'key': 'hydrogen_pathway',
          'value': 'H2_Gas_SMR',
          'title': 'Hydrogen production',
          'options': [
              {
                  'key': 'H2_Gas_SMR',
                  'title': 'Steam Methane Reforming'
              },
              {
                  'key': 'H2_Gas_Electrolysis',
                  'title': 'Electrolysis'
              },
          ]
      });

      settings.push({
          title: 'Background conditions',
          settings: conditions,
          showIf: 'settings',
      });

      var patterns = [];

      patterns.push({
          'isSelect': true,
          'key': 'drivecycle',
          'value': 'Combined',
          'title': 'Drivecycle',
          'options': [
              {
                  'key': 'Combined',
                  'title': 'Combined (55/45)'
              },
              {
                  'key': 'City',
                  'title': 'City (FTP75)'
              },
              {
                  'key': 'Highway',
                  'title': 'Highway (HWFET)'
              }
          ]
      });

      patterns.push({
        isSlider: true,
        key: "discount_rate",
        title: "Discount rate",
        help: "Annual rate at which future monetary flows are discouted, in % p.a.",
        min: 0,
        max: 16,
        default: 8,
        stepSize: 1,
        unit: "%"
      });

      patterns.push({
          isSlider: true,
          key: "lifetime",
          title: "Lifetime",
          help: "Total vehicle lifetime in years.",
          min: 4,
          max: 24,
          default: 14,
          stepSize: 2,
          unit: "years"
      });

      patterns.push({
          isSlider: true,
          key: "distance_per_year",
          title: "Annual dist.",
          help: "Annual driving distance in 1000 km.",
          min: 6,
          max: 30,
          default: 18,
          stepSize: 2,
          unit: "1000km"
      });

      /*patterns.push({
          isSlider: true,
          key: "charge_efficiency",
          title: "Charge Efficiency",
          help: "Efficiency for charging electric vehicles (PHEV/BEV) with electricity. Equals 1 - the losses during charging.",
          min: 0.7,
          max: 1,
          default: 0.9,
          stepSize: 0.05,
      });*/

      patterns.push({
          isSlider: true,
          key: "cd_share",
          title: "PHEV utility",
          help: "Fraction of distance that PHEV drive in charge-depleting (CD) mode (using electricity).",
          min: 0,
          max: 100,
          default: 60,
          stepSize: 10,
          unit: "%"
      });

      settings.push({
          title: 'Usage conditions',
          settings: patterns,
          showIf: 'settings',
      });

      var filters = [];

      filters.push({
        'isSelect': true,
        'key': 'modelFilter',
        'value': 'similar-extreme',
        'title': 'Models shown',
        'options': [
          {
              'key': 'all',
              'title': 'Show all'
          },
          {
              'key': 'similar',
              'title': 'Hide similar'
          },
          {
              'key': 'similar-extreme',
              'title': 'Hide similar and extreme'
          },
          {
              'key': 'similar-extreme-plus',
              'title': 'Hide similar and extreme (more)'
          },
        ]
      });

      filters.push({
        'isSelect': true,
        'key': 'highlightFilter',
        'value': 'none',
        'title': 'Filter not Highlighted',
        'options': [
          {
              'key': 'none',
              'title': 'No'
          },
          {
              'key': 'highlight',
              'title': 'Yes'
          }
        ]
      });

      filters.push({
        'isSelect': true,
        'key': 'powertrainFilter',
        'value': 'none',
        'title': 'Filter by Powertrain',
        'options': [
          {
              'key': 'none',
              'title': 'None'
          },
          {
              'key': 'ICEV',
              'title': 'ICEV'
          },
          {
              'key': 'HEV',
              'title': 'HEV'
          },
          {
              'key': 'PHEV',
              'title': 'PHEV'
          },
          {
              'key': 'BEV',
              'title': 'BEV'
          },
          {
              'key': 'FCV',
              'title': 'FCV'
          }
        ]
      });

      filters.push({
        'isSelect': true,
        'key': 'sizeFilter',
        'value': 'none',
        'title': 'Filter by Size',
        'options': [
          {
              'key': 'none',
              'title': 'None'
          },
          {
              'key': 'subcompact',
              'title': 'Subcompact'
          },
          {
              'key': 'compact',
              'title': 'Compact'
          },
          {
              'key': 'mid-size',
              'title': 'Mid-size'
          },
          {
              'key': 'full-size',
              'title': 'Full-size'
          }
        ]
      });

      filters.push({
        'isSelect': true,
        'key': 'typeFilter',
        'value': 'none',
        'title': 'Filter by Type',
        'options': [
          {
              'key': 'none',
              'title': 'None'
          },
          {
              'key': 'hatchback',
              'title': 'Hatchback'
          },
          {
              'key': 'sedan',
              'title': 'Sedan'
          },
          {
              'key': 'suv',
              'title': 'SUV'
          },
          {
              'key': 'pickup',
              'title': 'Pickup'
          },
          {
              'key': 'sports',
              'title': 'Sports Car'
          },
          {
              'key': 'minivan',
              'title': 'Minivan'
          }
        ]
      });

      settings.push({
          title: 'Filters',
          settings: filters,
          showIf: 'display',
      });

      var controlMode = []

      controlMode.push({
        'isSelect': true,
        'key': 'controlMode',
        'value': 'mouse',
        'title': '',
        'options': [
          {
              'key': 'mouse',
              'title': 'Mouse control'
          },
          {
              'key': 'touch',
              'title': 'Touch control'
          },
        ]
      });

      settings.push({
          title: 'Control Mode',
          settings: controlMode,
          showIf: 'control',
      });

      return settings

    }

  }

})();