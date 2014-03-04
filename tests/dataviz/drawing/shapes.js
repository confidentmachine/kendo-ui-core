(function() {
    var dataviz = kendo.dataviz,

        g = dataviz.geometry,
        Point = g.Point,

        d = dataviz.drawing,
        Group = d.Group,
        Segment = d.Segment,
        Shape = d.Shape,
        Text = d.Text,
        Circle = d.Circle,
        MultiPath = d.MultiPath,
        Path = d.Path;

    // ------------------------------------------------------------
    var group;

    module("Group", {
        setup: function() {
            group = new Group();
        }
    });

    test("append adds children", function() {
        var child = new Group();
        group.append(child);

        deepEqual(group.children[0], child);
    });

    test("append triggers childrenChange", function() {
        var child = new Group();

        group.observer = {
            childrenChange: function() {
                ok(true);
            }
        }

        group.append(child);
    });

    test("clear triggers childrenChange", function() {
        var child = new Group();
        group.append(child);

        group.observer = {
            childrenChange: function() {
                ok(true);
            }
        }

        group.clear();
    });

    test("visible triggers optionsChange", function() {
        group.observer = {
            optionsChange: function() {
                ok(true);
            }
        }

        group.visible(false);
    });

    test("visible sets visible", function() {
        group.visible(false);
        ok(!group.options.visible);
    });

    test("visible returns group", function() {
        deepEqual(group.visible(false), group);
    });

    test("traverse traverses children", function() {
        var child = new Group();
        group.append(child);

        group.traverse(function(item) {
            deepEqual(item, child);
        });
    });

    test("traverse traverses child groups", 2, function() {
        var childGroup = new Group();
        group.append(childGroup);
        var child = new Group();
        childGroup.append(child);

        group.traverse(function(item) {
            ok(true);
        });
    });

    test("boundingRect returns children bounding rectangle", function() {
        var path = new Path(),
            circle = new Circle(new g.Circle(new Point(), 10)),
            boundingRect;
        circle.boundingRect = function() {
            return new g.Rect(Point.create(50, 50), Point.create(150, 150));
        };
        path.boundingRect = function() {
            return new g.Rect(Point.create(30, 70), Point.create(120, 170));
        };
        group.append(circle);
        group.append(path);
        boundingRect = group.boundingRect();

        equal(boundingRect.p0.x, 30);
        equal(boundingRect.p0.y, 50);
        equal(boundingRect.p1.x, 150);
        equal(boundingRect.p1.y, 170);
    });

    // ------------------------------------------------------------
    var shape;

    module("Shape", {
        setup: function() {
            shape = new Shape();
        }
    });

    test("sets initial options", function() {
        shape = new Shape({ foo: true });
        ok(shape.options.foo);
    });

    test("fill sets fill", function() {
        shape.fill("red", 1);

        equal(shape.options.fill.color, "red");
        equal(shape.options.fill.opacity, 1);
    });

    test("fill triggers optionsChange", function() {
        shape.observer = {
            optionsChange: function() {
                ok(true);
            }
        }

        shape.fill("red");
    });

    test("fill returns shape", function() {
        deepEqual(shape.fill("red"), shape);
    });

    test("stroke sets stroke", function() {
        shape.stroke("red", 2, 1);

        equal(shape.options.stroke.color, "red");
        equal(shape.options.stroke.width, 2);
        equal(shape.options.stroke.opacity, 1);
    });

    test("stroke triggers optionsChange", function() {
        shape.observer = {
            optionsChange: function() {
                ok(true);
            }
        }

        shape.stroke("red");
    });

    test("stroke returns shape", function() {
        deepEqual(shape.stroke("red"), shape);
    });

    // ------------------------------------------------------------
    module("Text");

    test("sets initial content", function() {
        var text = new Text("Foo");

        equal(text.content, "Foo");
    });

    test("sets initial options", function() {
        var text = new Text("Foo", { foo: true });

        ok(text.options.foo);
    });

    test("setting content triggers change", function() {
        var text = new Text("Foo", { foo: true });

        ok(text.options.foo);
    });

    // ------------------------------------------------------------
    var circleGeometry,
        circle;

    module("Circle", {
        setup: function() {
            circleGeometry = new g.Circle(new g.Point(0, 0), 10);
            circle = new Circle(circleGeometry);
        }
    });

    test("sets initial geometry", function() {
        deepEqual(circle.geometry, circleGeometry);
    });

    test("sets initial options", function() {
        var circle = new Circle(circleGeometry, { foo: true });

        ok(circle.options.foo);
    });

    test("changing the center triggers geometryChange", function() {
        circle.observer = {
            geometryChange: function() {
                ok(true);
            }
        };

        circle.geometry.center.set("x", 5);
    });

    test("changing the radius triggers geometryChange", function() {
        circle.observer = {
            geometryChange: function() {
                ok(true);
            }
        };

        circle.geometry.set("radius", 5);
    });

    test("boundingRect returns geometry bounding rect with half stroke width added", function() {
        var boundingRect,
            geometry = new g.Circle(new Point());

        geometry.boundingRect = function() {
            return new g.Rect(new Point(50, 50), new Point(150, 150));
        };
        circle = new Circle(geometry, {stroke: {width: 5}});
        boundingRect = circle.boundingRect();

        equal(boundingRect.p0.x, 47.5);
        equal(boundingRect.p0.y, 47.5);
        equal(boundingRect.p1.x, 152.5);
        equal(boundingRect.p1.y, 152.5);
    });

    // ------------------------------------------------------------
    var segment;

    module("Segment", {
        setup: function() {
            segment = new Segment(
                new Point(0, 0),
                new Point(10, 10),
                new Point(-10, -10)
            );
        }
    });

    test("parameter-less constructor creates anchor", function() {
        ok(new Segment().anchor);
    });

    test("changing the anchor point triggers geometryChange", function() {
        segment.observer = {
            geometryChange: function() {
                ok(true);
            }
        };

        segment.anchor.set("x", 5);
    });

    test("changing the control point (in) triggers geometryChange", function() {
        segment.observer = {
            geometryChange: function() {
                ok(true);
            }
        };

        segment.controlIn.set("x", 5);
    });

    test("changing the control point (out) triggers geometryChange", function() {
        segment.observer = {
            geometryChange: function() {
                ok(true);
            }
        };

        segment.controlOut.set("x", 5);
    });

    // ------------------------------------------------------------
    var path;

    module("Path", {
        setup: function() {
            path = new Path();
        }
    });

    test("moveTo adds segment", function() {
        path.moveTo(0, 0);
        equal(path.segments.length, 1);
    });

    test("moveTo returns path", function() {
        deepEqual(path.moveTo(0, 0), path);
    });

    test("moveTo clears segments", function() {
        path.moveTo(0, 0);
        path.lineTo(10, 10);

        path.moveTo(0, 0);
        equal(path.segments.length, 1);
    });

    test("lineTo adds segment", function() {
        path.lineTo(0, 0);
        equal(path.segments.length, 1);
    });

    test("lineTo returns path", function() {
        deepEqual(path.lineTo(0, 0), path);
    });

    test("sets initial options", function() {
        var path = new Path({ foo: true });
        ok(path.options.foo);
    });

    test("adding a point triggers geometryChange", function() {
        path.observer = {
            geometryChange: function() {
                ok(true);
            }
        };

        path.moveTo(0, 0);
    });

    test("close sets closed", function() {
        path.close();
        ok(path.options.closed);
    });

    test("close triggers geometryChange", function() {
        path.observer = {
            geometryChange: function() {
                ok(true);
            }
        };

        path.close();
    });

    test("close does not trigger optionsChange", 0, function() {
        path.observer = {
            geometryChange: $.noop,
            optionsChange: function() {
                ok(false);
            }
        };

        path.close();
    });

    test("close returns path", function() {
        deepEqual(path.close(), path);
    });

    // ------------------------------------------------------------
    var multiPath;

    module("MultiPath", {
        setup: function() {
            multiPath = new MultiPath();
        }
    });

    test("moveTo adds path", function() {
        multiPath.moveTo(0, 0);
        equal(multiPath.paths.length, 1);
    });

    test("moveTo adds segment to path", function() {
        multiPath.moveTo(0, 0);
        equal(multiPath.paths[0].segments.length, 1);
    });

    test("moveTo sets path observer", function() {
        multiPath.moveTo(0, 0);
        deepEqual(multiPath.paths[0].observer, multiPath);
    });

    test("moveTo adds new path", function() {
        multiPath.moveTo(0, 0).lineTo(0, 0).moveTo(0, 0);
        equal(multiPath.paths.length, 2);
    });

    test("moveTo returns multiPath", function() {
        deepEqual(multiPath.moveTo(0, 0), multiPath);
    });

    test("lineTo does nothing if called first", function() {
        multiPath.lineTo(0, 0);
        equal(multiPath.paths.length, 0);
    });

    test("lineTo adds segment", function() {
        multiPath.moveTo(0, 0).lineTo(0, 0);
        equal(multiPath.paths[0].segments.length, 2);
    });

    test("lineTo adds segment to last path", function() {
        multiPath.moveTo(0, 0).moveTo(0, 0).lineTo(0, 0);
        equal(multiPath.paths[1].segments.length, 2);
    });

    test("lineTo returns multiPath", function() {
        deepEqual(multiPath.moveTo(0, 0).lineTo(0, 0), multiPath);
    });

    test("close closes last path", function() {
        multiPath.moveTo(0, 0).close();
        ok(multiPath.paths[0].options.closed);
    });

    test("close does nothing if called first", function() {
        multiPath.close(0, 0);
        equal(multiPath.paths.length, 0);
    });

    test("close returns multiPath", function() {
        deepEqual(multiPath.moveTo(0, 0).close(), multiPath);
    });
})();
