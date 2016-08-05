(function () {
  'use strict';

  angular.module('interactiveCostCarbonApp')
    .factory('tourInfo', [tourInfo]);

  function tourInfo() {

    var tour_data = [
      {
        'title': 'New here? Take the Tour!',
      },
      {
        'title': 'New here? Take the Tour!',
        'settings': {}
      },
      {
        'title': 'The plot area',
        'settings': {}
      },
      {
        'title': 'The axes',
        'settings': {}
      },
      {
        'title': 'The targets',
        'settings': {}
      },
      {
        'title': 'Average conditions',
        'settings': {}
      },
      {
        'title': 'What does this tell us?',
        'settings': {}
      },
      {
        'title': 'Current fuel prices',
        'settings': {
          'price_Gasoline': 2.1,
          'price_Diesel': 2.1
        }
      },
      {
        'title': 'Cleaner electricity',
        'settings': {
          'price_Gasoline': 2.1,
          'price_Diesel': 2.1,
          'electricity_ghg_fuel': 300,
        }
      },
      {
        'title': 'Back to default',
        'settings': {}
      },
      {
        'title': 'Best price-case for electric vehicles',
        'settings': {
          'refunds': 'both'
        }
      },
      {
        'title': 'Worst price-case for electric vehicles',
        'settings': {
          'refunds': 'none'
        }
      },
      {
        'title': 'Filter by vehicle class',
        'settings': {
          'refunds': 'none',
          'sizeFilter': 'compact',
          'typeFilter': 'sedan',
        }
      },
      {
        'title': 'Done - but there\'s much more!',
        'settings': {}
      },
    ]

    // set up api ("public functions")
    var api = {
      getTourData: getTourData,
    };

    return api;

    function getTourData() {
      return tour_data;
    }

  }

})();