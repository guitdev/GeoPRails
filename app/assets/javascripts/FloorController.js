/*global GeoP, gon*/

(function (geoP) {
  'use strict';

  geoP.app.controller('FloorController', function ($scope, $http, $rootScope, $routeParams) {
    $scope.buildings = [];

    $rootScope.$emit('start-loading');
    $scope.$routeParams = $routeParams;
    $scope.floorsByBuildingId = {};
    $scope.mapMode = 'show';
    $scope.i18n = gon.i18n;
    geoP.registerEditorStopLoading($rootScope);

    $scope.menu = [
      geoP.getMenuItem('information', 'floors'),
      geoP.getMenuItem('filters', 'floors'),
      geoP.chartMenuItem,
      geoP.getMenuItem('display_text', 'floors')
    ];

    $scope.itemHandler = new geoP.ItemHandler($http);

    $http.get('/floors/' + $routeParams.floorId + '.json').success(function (floor) {
      $scope.room = null;
      if ($routeParams.rid) {
        $scope.roomId = $routeParams.rid;
      } else if ($routeParams.itemId) {
        $scope.itemId = parseInt($routeParams.itemId, 10);
      }

      $scope.buildings = [floor.building_id];
      $scope.buildingId = floor.building_id;
      $scope.floorsByBuildingId[floor.building_id] = [floor];
      geoP.editorDisplayNames($scope, $rootScope, floor.building_id);
      geoP.handleKeyEventsForScope($scope);
      $scope.floorJson = floor;

      $scope.information = {};
      $scope.information[floor.building_id] = floor.information;

      geoP.setFloorsMaps(floor.building_id, $scope.floorsByBuildingId[floor.building_id], $rootScope, $http);

      // set the filters
      $scope.filters = {};
      $scope.filters[floor.building_id] = floor.filters;
      $rootScope.mapFilter[floor.building_id].filters = floor.filters;
      $rootScope.mapFilter[floor.building_id].mergedFiltersForBuildings[floor.building_id] = floor.filters;
      $rootScope.mapFilter[floor.building_id].ready();

    });



  });
}(GeoP));