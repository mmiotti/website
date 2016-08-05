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
          'title': 'Vehicle costs',
          'axis_label': 'Vehicle costs (MSRP in 1000 {{unit}} minus tax refunds)',
          'group': 'Costs',
          'unit': 'US$',
          'maxLim': 70000
      });

      axisOptions.push({
          'key': 'costs_fuel',
          'title': 'Fuel costs',
          'axis_label': 'Fuel costs',
          'group': 'Costs',
          'unit_si': 'US$ / km',
          'unit_us': 'US$ / mile',
          'maxLim': 0.3
      });

      axisOptions.push({
          'key': 'costs_total',
          'title': 'All costs',
          'axis_label': 'Costs (vehicle, fuel, and maintenance {{unit}})',
          'group': 'Costs',
          'unit_si': 'US$ / km',
          'unit_us': 'US$ / mile',
          'maxLim': 0.6
      });

      axisOptions.push({
          'key': 'ghg_veh',
          'axis_label': 'Greenhouse gas emissions (vehicle {{unit}})',
          'title': 'Vehicle emissions',
          'group': 'Greenhouse gas emissions',
          'unit': 'tCO₂eq',
          'maxLim': 20
      });

      axisOptions.push({
          'key': 'ghg_fuel',
          'axis_label': 'Greenhouse gas emissions (fuel {{unit}})',
          'title': 'Fuel emissions',
          'group': 'Greenhouse gas emissions',
          'unit_si': 'gCO₂eq / km',
          'unit_us': 'gCO₂eq / mile',
          'maxLim': 800
      });

      axisOptions.push({
          'key': 'ghg_total',
          'axis_label': 'Greenhouse gas emissions (lifecycle {{unit}})',
          'title': 'Lifecycle emissions',
          'group': 'Greenhouse gas emissions',
          'unit_si': 'gCO₂eq / km',
          'unit_us': 'gCO₂eq / mile',
          'maxLim': 800
      });

      axisOptions.push({
          'key': 'sales',
          'title': 'Sales',
          'axis_label': 'Sales',
          'group': 'Other',
          'unit': 'units sold in 2014',
          'maxLim': 800000
      });

      axisOptions.push({
          'key': 'horsepower',
          'title': 'Power',
          'axis_label': 'Power',
          'group': 'Other',
          'unit': 'hp',
          'maxLim': 400
      });

      axisOptions.push({
          'key': 'power_to_weight',
          'title': 'Power-to-weight ratio',
          'axis_label': 'Power-to-weight ratio',
          'group': 'Other',
          'unit': 'hp/kg',
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
          'default': 'costs_total',
          'title': 'X-axis',
          'options': axisOptions
      });

      dataAndDisplay.push({
          'isSelect': true,
          'key': 'yAxis',
          'default': 'ghg_total',
          'title': 'Y-axis',
          'options': axisOptions
      });

      dataAndDisplay.push({
          'isSelect': true,
          'key': 'area',
          'default': 'none',
          'title': 'Circle area',
          'options': axisOptions
      });

      /*dataAndDisplay.push({
          'isSelect': true,
          'key': 'shadedAreas',
          'default': 'cardinal-closed',
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
          'key': 'units',
          'default': 'us',
          'title': 'Units',
          'options': [
              {
                  'key': 'us',
                  'title': 'U.S.'
              },
              {
                  'key': 'si',
                  'title': 'SI / International'
              },
          ]
      });

      dataAndDisplay.push({
          'isSelect': true,
          'key': 'axisLimits',
          'default': 'dynamic',
          'title': 'Axis limits',
          'options': [
              {
                  'key': 'dynamic',
                  'title': 'Dynamic'
              },
              {
                  'key': 'hybrid',
                  'title': 'Lower limits fixed at 0'
              },
              {
                  'key': 'fixed',
                  'title': 'Lower and upper limits fixed'
              }
          ]
      });

      dataAndDisplay.push({
          'isSelect': true,
          'key': 'legendColorField',
          'default': 'Combined_Type',
          'title': 'Circle colors',
          'help': 'To see the corresponding legend, go to the \'Main Panel\'',
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
          'default': 'Trim1',
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
          'default': 'GREET',
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
          showIf: 'settings',
      });

      var conditions = [];

      conditions.push({
          'isSelect': true,
          'key': 'refunds',
          'default': 'federal',
          'title': 'Tax refunds',
          'options': [
              {
                  'key': 'none',
                  'title': 'None'
              },
              {
                  'key': 'state',
                  'title': 'Best state (e.g. CA)'
              },
              {
                  'key': 'federal',
                  'title': 'Federal'
              },
              {
                  'key': 'both',
                  'title': 'Federal and best state'
              }
          ]
      });

      conditions.push({
        isSlider: true,
        key: "price_Gasoline",
        title: "Gasoline price",
        help: "The price of non-premium gasoline in $/gallon. The highest monthly inflation-corrected average during the past 10 years was $4.47/gallon, the lowest monthly average $1.86/gallon.",
        min: 1,
        max: 9,
        default: 3.1,
        stepSize: 0.1,
        unit: "$/gallon"
      });

      conditions.push({
        isSlider: true,
        key: "price_Diesel",
        title: "Diesel price",
        help: "The price of diesel in $/gallon. The highest monthly inflation-corrected average during the past 10 years was $5.17/gallon, the lowest monthly average $1.94/gallon.",
        min: 1,
        max: 9,
        default: 3.3,
        stepSize: 0.1,
        unit: "$/gallon"
      });

      conditions.push({
        isSlider: true,
        key: "price_Electricity",
        title: "Electricity price",
        help: "The price of electricity at the outlet in cents / kWh. The highest monthly inflation-corrected average during the past 10 years was 13.3 cents / kWh, the lowest monthly average was 10.3 cents / kWh.",
        min: 0,
        max: 30,
        default: 12,
        stepSize: 1,
        unit: "¢/kWh"
      });

      conditions.push({
        isSlider: true,
        key: "electricity_ghg_veh",
        title: "Electricity (industrial)",
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
        title: "Electricity (charging)",
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
        title: "Hydrogen price",
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
          'default': 'H2_Gas_SMR',
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
        isSlider: true,
        key: "cityshare",
        title: "City driving share",
        help: "The fraction of the distance that is driven in the EPA city cycle (as opposed to the EPA highway cycle) in %",
        min: 0,
        max: 100,
        default: 55,
        stepSize: 5,
        unit: "%"
      });

      // patterns.push({
      //     'isSelect': true,
      //     'key': 'drivecycle',
      //     'default': 'Combined',
      //     'title': 'Drivecycle',
      //     'options': [
      //         {
      //             'key': 'Combined',
      //             'title': 'Combined (55/45)'
      //         },
      //         {
      //             'key': 'City',
      //             'title': 'City (FTP75)'
      //         },
      //         {
      //             'key': 'Highway',
      //             'title': 'Highway (HWFET)'
      //         }
      //     ]
      // });

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
          title: "Annual driving dist.",
          help: "Annual driving distance in 1000 miles.",
          min: 4,
          max: 18,
          default: 11,
          stepSize: 1,
          unit: "1000 miles"
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
          title: "PHEV utility factor",
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

      // filters.push({
      //   'isSelect': true,
      //   'key': 'modelFilter',
      //   'default': 'similar-extreme',
      //   'title': 'Models shown',
      //   'options': [
      //     {
      //         'key': 'all',
      //         'title': 'Show all'
      //     },
      //     {
      //         'key': 'similar',
      //         'title': 'Hide similar'
      //     },
      //     {
      //         'key': 'similar-extreme',
      //         'title': 'Hide similar and extreme'
      //     },
      //     {
      //         'key': 'similar-extreme-plus',
      //         'title': 'Hide similar and extreme (more)'
      //     },
      //   ]
      // });

      // filters.push({
      //   'isSelect': true,
      //   'key': 'highlightFilter',
      //   'default': 'none',
      //   'title': 'Filter not highlighted',
      //   'options': [
      //     {
      //         'key': 'none',
      //         'title': 'No'
      //     },
      //     {
      //         'key': 'highlight',
      //         'title': 'Yes'
      //     }
      //   ]
      // });

      filters.push({
        'isSelect': true,
        'key': 'powertrainFilter',
        'default': 'none',
        'title': 'Filter by Powertrain',
        'options': [
          {
              'key': 'none',
              'title': 'Show all'
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
        'default': 'none',
        'title': 'Filter by Size',
        'options': [
          {
              'key': 'none',
              'title': 'Show all'
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
        'default': 'none',
        'title': 'Filter by Type',
        'options': [
          {
              'key': 'none',
              'title': 'Show all'
          },
          {
              'key': 'hatchback',
              'title': 'Sedan/Hatchback'
          },
          {
              'key': 'suv',
              'title': 'SUV/CUV'
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
          showIf: 'settings',
      });

      var controlMode = []

      controlMode.push({
        'isSelect': true,
        'key': 'controlMode',
        'default': 'mouse',
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

      settings.forEach(function(settingGroup) {
        settingGroup.settings.forEach(function(item) {
          item.value = item.default;
        });
      });

      return settings

    }

  }

})();