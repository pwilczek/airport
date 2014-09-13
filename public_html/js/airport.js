var Module = function(root) {

    var SEPARATOR = ".";
    var o = {};

    function create(root, name) {
        if (!root[name])
            root[name] = {};
        return root[name];
    }

    o.prepare = function(namespace) {
        var names = namespace.split(SEPARATOR);
        var result = root;
        for (var n = 0; n < names.length; n++) {
            result = create(result, names[n]);
        }
        return result;
    }
    return o;
}(this);

var airport = Module.prepare("_name.wilu.js.airport");

airport.Port = function() {
    return function() {
        var runways = new Array();
        //
        this.withRunway = function(runway) {
            runways.push(runway);
            airport.log("NEW runway " + runway.runwayName());
            return this;
        }
        this.land = function(plane) {
            airport.log("REQUEST for landing by " + plane.planeName());
            for (var r = 0; r < runways.length; r++) {
                if (runways[r].handle(plane)) {
                    return;
                }
            }
            plane.retry(this);
        }
    }
}();


airport.Runway = function() {
    return function(name) {
        var name = name;
        var isFree = true;
        //
        this.runwayName = function() {
            return name;
        }
        this.handle = function(plane) {
            if (isFree) {
                isFree = false;
                airport.log(plane.planeName() + " has STARTED landing on " + this.runwayName());
                var runway = this;
                setTimeout(function() {
                    airport.log(plane.planeName() + " succesfull LANDED on " + runway.runwayName());
                    isFree = true;
                }, plane.landingTime());
                return true;
            } else {
                airport.log("Runway " + this.runwayName() + "is BUSY");
                return false;
            }
        }
    }
}();

airport.Plane = function() {
    return function(name) {
        var name = name;
        //
        this.planeName = function() {
            return name;
        }
        this.landingTime = function() {
            return Math.random() * 10000;
        }
        this.retry = function(port) {
            var plane = this;
            setTimeout(function() {
                airport.log(plane.planeName() + " RETRIES to land");
                port.land(plane);
            }, 1000);
        }
    }
}();

airport.run = function(element) {

    airport.log = function(message) {
        element.innerHTML += "<br/>" + message
    }

    var port = new airport.Port()
            .withRunway(new airport.Runway("Krakow"))
            .withRunway(new airport.Runway("Poznan"))
            .withRunway(new airport.Runway("Warszawa"));

    var planes = new Array();
    planes.push(new airport.Plane("Eagle 1"));
    planes.push(new airport.Plane("Star"));
    planes.push(new airport.Plane("Comet"));
    planes.push(new airport.Plane("Moon"));
    planes.push(new airport.Plane("SuperHeroeJS"));

    for (var p = 0; p < planes.length; p++) {
        (function(plane) {
            setTimeout(function() {
                port.land(plane);
            }, 1000 * Math.random());
        })(planes[p]);
    }
};