(function(geoP) {
  geoP.app.controller('OrganizationCtrl', function($scope, $http, $rootScope) {
    geoP.handleKeyEventsForScope($scope);
    $('.filter-container').hide();
    $scope.o = gon.organization;
    $scope.floors = [];
    var floors = {};

    for (var i = 0; i < $scope.o.rooms.length; i++) {
      var r = $scope.o.rooms[i];
      floors[r.floor.id] = r.floor;
    }

    function loadFloors(floorsArray) {
      $scope.floors = floorsArray;
      $scope.mapMode = 'show';
      geoP.setFloorMaps($scope.floors, $scope, $http, $rootScope, function(mapFilter) {
        $scope.filter = mapFilter.filters.organization[$scope.o.id];
        $scope.filter.state = true;
        $rootScope.$emit('organization_filters.StateChange', $scope.filter);
        $scope.$apply();
      });
      $('#loading').remove();
    }

    floorsArray = [];
    var floorsMax = Object.keys(floors).length;
    var i = 0;
    for (var fId in floors) {
      if (floors.hasOwnProperty(fId)) {
        var floor = floors[fId];
        $http.get('/floors/' + fId + '/json').success(function(res) {
          floorsArray.push(res);
          i += 1;
          if (i === floorsMax) {
            loadFloors(floorsArray);
          }
        });
      }
    }



  });
}(GeoP))



//