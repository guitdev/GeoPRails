/*global gon:true, jQuery:true, GeoP:true, angular:true*/

(function(geoP, gon, $, angular) {
  'use strict';

  function registerScroll(floorId, scrollTop) {
    if (localStorage) {
      localStorage['floor-' + floorId + '-scroll-top'] = scrollTop;
    }
  }

  function loadScroll(floorId) {
    if (localStorage) {
      var c = localStorage['floor-' + floorId + '-scroll-top'];
      if (c !== undefined) {
        return parseInt(c, 10);
      }
    }
    return 0;
  }

  $(function() {
    // rescroll if loaded scroll !== of current scroll (because of browser jump ?)
    var $w = $(window);
    $w.on('scroll', function() {
      var scrollLoaded, scrollTop;
      try {
        scrollLoaded = loadScroll(gon.floor.id);
        scrollTop = $(window).scrollTop();
        if (scrollTop !== scrollLoaded) {
          $w.scrollTop(scrollLoaded);
        }
      } catch (e) {
        return e;
      }
    });

  });

  var app = angular.module('GeoP', ['ui.sortable']).run(function($rootScope) { // instance-injector
    $rootScope.filters = [];

    try {
      var scrollTop = loadScroll(gon.floor.id);
      $(window).scrollTop(scrollTop);
    } catch (e) {
      return e;
    }

  });

  geoP.app = app;



  app.directive('keepscrolltop', function($window) {
    var count = 0;
    return function() {
      angular.element($window).bind('scroll', function() {
        if (count > 0) {
          registerScroll(gon.floor.id, this.pageYOffset);
        }
        count += 1;
      });
    };
  });

  app.config(['$httpProvider',
    function(provider) {
      provider.defaults.headers.common['X-CSRF-Token'] = $('meta[name=csrf-token]').attr('content');
    }
  ]);

  // function unCheckAllFilters($rootScope) {
  // for (var i = 0; i < $rootScope.filters.length; i++) {
  //   var $scope = $rootScope.filters[i];
  //   $scope.checkAll = false;
  // for (var j = 0; j < $scope.filters.length; j++) {
  //   var filters = $scope.filters[j];
  //   for (var key in filters) {
  //     if (filters.hasOwnProperty(key)) {
  //       filters[key].state = false;
  //     }
  //   }
  // }
  // }
  // }


  app.controller('CompanyCtrl', function($scope) {
    $scope.company = gon.company;
    $scope.organizations = gon.organizations;
  });

  // app.controller('FloorHeaderCtrl', function($scope) {
  //   $scope.floorJson = gon.floor;
  // });


  geoP.selectPolylineIfIsInHash = function($scope) {
    var roomId, floorId, floorEditor;

    function apply() {
      $scope.$apply();
    }
    roomId = geoP.getRoomIdFromHash();
    for (floorId in $scope.svgEditors) {
      if ($scope.svgEditors.hasOwnProperty(floorId)) {
        floorEditor = $scope.svgEditors[floorId];
        if (floorEditor.itemsById[roomId]) {
          $scope.roomId = roomId;
          floorEditor.itemsById[$scope.roomId].selectPolyline();
          setTimeout(apply, 0);
          return floorEditor.itemsById[$scope.roomId];
        }
      }
    }
    return null;
  };

  geoP.setFloorMaps = function(buildingId, floors, $scope, $http, $rootScope, callback) {
    $scope.svgEditors = {};
    var mapFilter = new geoP.MapFilter($rootScope, buildingId);
    setTimeout(function() {
      var i, floor, editor;
      for (i = 0; i < floors.length; i += 1) {
        floor = floors[i];
        editor = new geoP.SvgEditor(floor, $scope, $http, $rootScope, mapFilter);
        $scope.svgEditors[floor.id] = editor;
        editor.loadRooms();
        editor.setOptions();
        mapFilter.addEditor(editor);
      }
      mapFilter.loadFilters();
      mapFilter.registerFiltersStateChange();
      $rootScope.mapFilter = mapFilter;
      mapFilter.ready();
      if ($rootScope.mapFilterByBuildingId === undefined) {
        $rootScope.mapFilterByBuildingId = {};
      }
      $rootScope.mapFilterByBuildingId[buildingId] = mapFilter;

      geoP.selectPolylineIfIsInHash($scope);

      $scope.$apply();
      return callback && callback(mapFilter);
    }, 0);
  };

  geoP.handleKeyEventsForScope = function($scope) {
    $scope.isShift = false;
    $scope.isCtrlKeyDown = false;
    $scope.isZKeyDown = false;

    function handleCtrlAndShif(ev) {
      var isShift, isCtrlKeyDown;
      if (window.event) {
        isShift = window.event.shiftKey ? true : false;
        isCtrlKeyDown = window.event.ctrlKey ? true : false;
      } else {
        isShift = ev.shiftKey ? true : false;
        isCtrlKeyDown = ev.ctrlKey ? true : false;
      }
      $scope.isShift = isShift;
      $scope.isCtrlKeyDown = isCtrlKeyDown;
    }

    function getKey(ev) {
      var key;
      if (window.event) {
        key = window.event.keyCode;
      } else {
        key = ev.which;
      }
      return key;
    }

    function keyDown(ev) {
      var key;
      handleCtrlAndShif(ev);
      key = getKey(ev);
      if (key !== undefined) {
        if (key === 90) {
          $scope.isZKeyDown = true;
        }
        $scope.$apply();
      }

    }

    function keyUp(ev) {
      var key;
      handleCtrlAndShif(ev);
      key = getKey(ev);
      if (key !== undefined) {
        if (key === 90) {
          $scope.isZKeyDown = false;
        }
        $scope.$apply();
      }
    }


    document.onkeydown = keyDown;
    document.onkeyup = keyUp;
  };

  app.controller('FloorMapCtrl', function($scope, $http, $rootScope) {
    geoP.handleTabHeaderClick($rootScope, $scope);
    $scope.floorsByBuildingId = {};
    $scope.loading = true;
    $scope.mapMode = gon.mode;
    $scope.i18n = gon.i18n;

    $http.get('/floors/' + gon.floor.id + '.json').success(function(floor) {

      $rootScope.$emit('SetBodyColor', floor.building);
      $scope.room = null;
      $scope.roomId = geoP.getRoomIdFromHash();
      $scope.buildings = [floor.building_id];
      $rootScope.buildings = $scope.buildings;
      $scope.buildingId = floor.building_id;
      $scope.floorsByBuildingId[floor.building_id] = [floor];

      geoP.handleKeyEventsForScope($scope);

      $scope.floorJson = floor;
      geoP.setFloorMaps(floor.building_id, $scope.floorsByBuildingId[floor.building_id], $scope, $http, $rootScope);
      $scope.loading = false;
    });

    $scope.countPeopleFromRooms = function(rooms) {
      return rooms.reduce(function(a, b) {
        return a + b.affectations.length;
      }, 0);
    }

    $scope.countFreeSpacesFromRooms = function(rooms) {
      return rooms.reduce(function(a, b) {
        var res = a;
        if (b.free_desk_number !== null){
          res += b.free_desk_number;
        }
        return res;
      }, 0);
    }


  });
}(GeoP, gon, jQuery, angular));
