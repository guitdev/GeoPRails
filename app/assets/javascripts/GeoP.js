var GeoP = {};

/*global GeoP, jQuery*/
(function(geoP, $) {
  'use strict';

  geoP.currentEvent = null;

  geoP.Colors = {};
  geoP.Colors.NotSelected = '#0b6aff';
  geoP.Colors.Drawing = '#00e567';

  geoP.extend = function(Parent, child) {
    var p, prop, value;

    function construct(constructor, args) {
      function F() {
        return constructor.apply(this, args);
      }
      F.prototype = constructor.prototype;
      return new F();
    }
    p = construct(Parent, Array.prototype.slice.call(arguments, 2));
    child.base = {};
    for (prop in p) {
      // if (p.hasOwnProperty(prop)) {
      if (child[prop] === undefined) {
        value = p[prop];
        child[prop] = value;
      } else {
        child.base[prop] = Parent.prototype[prop];
      }
      // }
    }
  };

  geoP.handleTabHeaderClick = function($rootScope, $scope) {
    $scope.tabHeaderClick = function(e, bId) {
      if (e === 'charts' && $rootScope.currentCharts !== undefined) {
        var e, c;
        e = document.getElementById('chart_div_' + bId);

        // $rootScope.mapFilter[bId].updateEditorsRoomPositions();
        c = $rootScope.currentCharts[bId];

        // geoP.chartsData[bId]['room_type'](e);
        // console.log('on refresh chart', c);
        // c.$element.show();

        setTimeout(function() {

          geoP.createColumnChart(bId, e, c.data);
          console.log('chartPaneClick', $(e).width(), bId, c);
          // c.chart.draw(c.a, c.options);
        }, 0);


        // $rootScope.currentCharts[bId]
        // geoP.chartsData[bId]()
        // debugger;
        // $rootScope.currentCharts[bId].$element.hide();
        // setTimeout(function() {
        //   $rootScope.$emit('Refresh.CurrentChart', bId);
        // }, 250);
      }
      $rootScope.mapFilter[bId].updateEditorsRoomPositions();
      return false;
    };
  };

  geoP.$apply = function($scope) {
    setTimeout(function() {
      $scope.$apply();
    }, 0);
  };

  geoP.getRoomIdFromHash = function() {
    var hash, res;
    hash = window.location.hash;
    if (hash.length > 0) {
      res = hash.replace('#', '');
      return parseInt(res, 10);
    }

  };

  geoP.hashCode = function(s) {
    /*jslint bitwise: true*/
    return s.split('').reduce(function(a, b) {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
  };

  geoP.filtersNames = [{
    name: 'room_type',
    label: 'Typologie des pièces'
  }, {
    name: 'organization',
    label: 'Organisations'
  }, {
    name: 'room_ground_type',
    label: 'Nature des sols'
  }, {
    name: 'evacuation_zone',
    label: "Zones d'évacuations"
  }];


  // setTimeout(function() {
  // $('a[data-toggle="tab"]').on('shown', function(e) {
  //   debugger;
  //   location.hash = $(e.target).attr('href').substr(1);
  //   $(this).focus();
  //   return false; // or true - whichever you prefer
  // });
  // }, 1000);

}(GeoP, jQuery));
