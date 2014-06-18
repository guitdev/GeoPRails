/*global GeoP:true */

(function(geoP) {
  "use strict";

  var a = Snap;

  function getMousePos(e) {
    var x = e.hasOwnProperty('offsetX') ? e.offsetX : e.layerX;
    var y = e.hasOwnProperty('offsetY') ? e.offsetY : e.layerY;
    return {
      x: x,
      y: y
    };
  }

  function mouseWheel(e) {
    e.preventDefault();
    var factor = 1;
    if (e.wheelDelta < 0) {
      factor = -1;
    }
    this.$scope.camera.scale += (factor * 0.01);
    if (this.$scope.camera.scale < 0.05) {
      this.$scope.camera.scale = 0.05;
    }
    var mp = getMousePos(e);
    this.applyTransform();
  }

  function mouseMove(ev) {
    if (this.$scope.isShift === true && this.lastMovePosition !== null) {
      var diff = {
        x: this.lastMovePosition.x - ev.x,
        y: this.lastMovePosition.y - ev.y
      };
      this.$scope.camera.x += diff.x;
      this.$scope.camera.y += diff.y;
      this.applyTransform();
    }

    this.lastMovePosition = {
      x: ev.x,
      y: ev.y
    };
  }

  function mouseClick(e) {
    if (geoP.currentEvent === null && this.$scope.mode !== 'create') {
      this.unSelectItems();
      this.$scope.cleanCurrentOptions();
      this.$scope.$apply();
    }
    geoP.currentEvent = null;
  }

  var SvgEditor = function(svgId, $scope, $http) {
    var that = this;
    this.paper = a(svgId);
    if (this.paper === null) {
      return;
    }
    this.$scope = $scope;
    this.$http = $http;
    this.createPolylineLine = null;
    this.createPolylinePolyline = null;
    this.newPoint = null;
    this.items = [];
    this.canvas = this.paper.g();
    this.lastMovePosition = null;

    var bgBox = {
      x : 0,
      y : 0, 
      w : 881,
      h : 779
    };

    // bgBox.w /= 2;
    // bgBox.h /= 2;

    this.bg = this.canvas.image('/assets/uploads/plan1.jpg', bgBox.x, bgBox.y, bgBox.w, bgBox.h);
    var border = this.canvas.rect(bgBox.x, bgBox.y, bgBox.w, bgBox.h);
    border.attr({
      fill : 'transparent',
      stroke : '#ffcf00'
    });

    this.bg.node.className.baseVal = 'bg';

    this.applyTransform();

    this.paper.node.addEventListener("mousewheel", mouseWheel.bind(this), false);
    this.paper.node.addEventListener("DOMMouseScroll", mouseWheel.bind(this), false);

    this.paper.mousemove(mouseMove.bind(this));
    this.paper.click(mouseClick.bind(this));
  };



  SvgEditor.prototype.applyTransform = function() {
    this.canvas.transform(["scale(", this.$scope.camera.scale, ") translate(", this.$scope.camera.x, ' ', this.$scope.camera.y, ')'].join(''));
  };

  SvgEditor.prototype.createRoomFromJson = function(json) {
    var b = new geoP.Polyline(this);
    b.loadFromJson(json);
    this.items.push(b);
  };


  SvgEditor.prototype.loadRooms = function(roomJson) {
    var that = this;
    for (var i = 0; i < roomJson.rooms.length; i++) {
      var r = roomJson.rooms[i];
      that.createRoomFromJson(r);
    }
  };

  SvgEditor.prototype.unSelectItems = function() {
    var that = this;
    for (var i = 0; i < that.items.length; i++) {
      var item = that.items[i];
      item.unSelect();
    }
  };

  SvgEditor.prototype.createPolylineMode = function(e) {
    var scale = this.$scope.camera.scale;
    var tX = -this.$scope.camera.x;
    var tY = -this.$scope.camera.y;

    if (this.createPolylinePolyline === null) {
      this.createPolylinePolyline = new geoP.Polyline(this);

      var mouse = getMousePos(e);

      this.createPolylinePolyline.create(mouse.x / scale + tX, mouse.y / scale + tY);
    } else {
      this.createPolylinePolyline.appendPoint(this.newPoint.x, this.newPoint.y);
    }
  };

  function toDeg(rad) {
    return rad * 180 / Math.PI;
  }

  function getAngle(cx, cy, ex, ey) {
    var dx = ex - cx;
    var dy = ey - cy;
    var theta = Math.atan2(dy, dx);
    theta *= 180 / Math.PI // rads to degs
    return theta;
  }

  function v2(angle, power) {
    var x = Math.sin(angle);
    var y = Math.cos(angle);
    x *= power;
    y *= power;
    return {
      x: x,
      y: y
    };
  }

  function power(v) {
    return v * v;
  }

  function hyp(newPoint, lastPoint) {
    var pow = power(newPoint.x - lastPoint.x) + power(newPoint.y - lastPoint.y);
    var sqrt = Math.sqrt(pow);
    return sqrt;
  }

  function updateNewPointFromAngle(a, newPoint, lastPoint) {
    var v = v2(a, hyp(newPoint, lastPoint));
    newPoint.x = lastPoint.x + v.x;
    newPoint.y = lastPoint.y + v.y;
  }

  function updateNewPositionIfShift($scope, newPoint, lastPoint) {
    if ($scope.isShift === true) {
      var a = getAngle(lastPoint.x, lastPoint.y, newPoint.x, newPoint.y);
      if ((a > -22.5 && a < 22.5) || (a < -157.5 || a > 157.5)) {
        newPoint.y = lastPoint.y;
      } else if (a >= 22.5 && a < 67.5) {
        updateNewPointFromAngle(Math.PI / 4, newPoint, lastPoint);
      } else if ((a >= 67.5 && a < 112.5) || (a > -112.5 && a < -67.5)) {
        newPoint.x = lastPoint.x;
      } else if (a > 112.5 && a < 157.5) {
        updateNewPointFromAngle(Math.PI * 7 / 4, newPoint, lastPoint);
      } else if (a < -22.5 && a > -67.5) {
        updateNewPointFromAngle(Math.PI * 3 / 4, newPoint, lastPoint);
      } else if (a < -112.5 && a > -157.5) {
        updateNewPointFromAngle(Math.PI * 5 / 4, newPoint, lastPoint);
      }
    }
  }

  SvgEditor.prototype.drawToMousePosition = function(e) {
    var scale = this.$scope.camera.scale;
    var tX = -this.$scope.camera.x;
    var tY = -this.$scope.camera.y;
    if (this.createPolylinePolyline !== null) {
      var lastPoint = this.createPolylinePolyline.getLastPoint();
      if (lastPoint !== null) {
        if (this.createPolylineLine === null) {
          var mouse = getMousePos(e);
          this.createPolylineLine = this.canvas.line(lastPoint.x, lastPoint.y, mouse.x / scale, mouse.y / scale);
          this.createPolylineLine.attr({
            stroke: 'orange',
            'stroke-dasharray': [5, 5]
          });
        } else {
          this.newPoint = {
            x: e.offsetX / scale + tX,
            y: e.offsetY / scale + tY
          };
          updateNewPositionIfShift(this.$scope, this.newPoint, lastPoint);
          this.createPolylineLine.animate({
            x1: lastPoint.x,
            y1: lastPoint.y,
            x2: this.newPoint.x,
            y2: this.newPoint.y
          }, 5);
        }
      }
    }
  };


  SvgEditor.prototype.createPolyline = function($scope) {
    var that = this;

    var createMode = this.createPolylineMode.bind(this);
    var move = this.drawToMousePosition.bind(this);
    this.paper.click(createMode);
    this.paper.mousemove(move);


    function finishCreateMode() {
      that.paper.unclick(createMode);
      that.paper.unmousemove(move);
      if (that.createPolylineLine !== null) {
        that.createPolylineLine.remove();
      }
      that.createPolylinePolyline = null;
      that.createPolylineLine = null;
      $scope.cleanCurrentOptions();
    }

    function cancelCurrentPolyline() {
      if (that.createPolylinePolyline !== null) {
        that.createPolylinePolyline.remove();
      }
      finishCreateMode();
    }

    return [{
      label: 'Fermer',
      classes: 'btn-success',
      action: function() {
        if (that.createPolylinePolyline !== null) {
          that.createPolylinePolyline.close($scope);
          that.createPolylinePolyline.save();
          that.items.push(that.createPolylinePolyline);
        }
        finishCreateMode();
      }
    }, {
      label: 'Annuler',
      classes: 'btn-warning',
      action: cancelCurrentPolyline
    }];
  };


  geoP.SvgEditor = SvgEditor;

}(GeoP));