rhino3dm = require("rhino3dm");
compute = require("compute-rhino3d");

// TASK TO MYSELF
// Draw a box via rhinoCompute
// [can rhino geometry be displayed directly on web-end? or it need to convert it to THREE.js?]
// show this box in html canvas

compute.authToken = "bearer " + process.env.RHINO_COMPUTE_TOKEN; // what the heck is this? do we need it for localhost???

rhino3dm().then(async (rh) => {
  // create a world xy plane
  plane = {
    Origin: { X: 0.0, Y: 0.0, Z: 0.0 },
    XAxis: { X: 1.0, Y: 0.0, Z: 0.0 },
    YAxis: { X: 0.0, Y: 1.0, Z: 0.0 },
    ZAxis: { X: 0.0, Y: 0.0, Z: 1.0 },
    Normal: { X: 0.0, Y: 0.0, Z: 1.0 },
  };
  console.log(plane);

  // create a sphere at the origin and convert to brep
  brep = new rh.Sphere([0, 0, 0], 5).toBrep();
  console.log(brep);

  // call compute to intersect the sphere with the xy plane
  try {
    r = await compute.Intersection.brepPlane(brep, plane, 0.001);
  } catch (err) {
    console.error(err);
  }
  console.log(r);

  // deserialise the output
  out = rh.CommonObject.decode(r[1][0]);
  console.log(out);
  console.log(out.radius); // out is an ArcCurve
});
