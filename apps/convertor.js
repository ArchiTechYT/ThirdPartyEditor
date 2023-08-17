import * as THREE from "three";
import { generateUUID } from "three/src/math/MathUtils";
import { getVertices } from "./helpers";

// reference : https://discourse.threejs.org/t/downloadjson-not-define/17224/11

// SAVE JSON FILE EXTERNALLY

// SCENE CONVERTOR
export function threeToCubsJson(scene) {
  // + CLUSTER MESH
  const tmpGeo = new THREE.BoxGeometry(0, 0, 0);
  const material = new THREE.MeshStandardMaterial();
  material.color = new THREE.Color("rgb(256, 256, 256)"); // random color from the palatte
  var cMesh = new THREE.Mesh(tmpGeo, material);
  cMesh.userData.name = "cluster";

  // + CLUSTER PLACEHOLDER
  var cluster = new cubsSpace(cMesh);
  cluster.type = "unit";

  // + ELEMENTS
  // + RELATIONSHIP
  var spaces = [];
  var rels = [];

  scene.traverse(function (object) {
    if (object instanceof THREE.Mesh && object.userData.name != "ground") {
      var space = new cubsSpace(object);
      spaces.push(space);

      var wVec = new THREE.Vector3();
      object.getWorldPosition(wVec);
      console.log(wVec);

      var plane = new cubsPlane(
        new cubsPoint3d(wVec.x, wVec.z, wVec.y),
        new cubsVector3d(1, 0, 0),
        new cubsVector3d(0, 1, 0),
        new cubsVector3d(0, 0, 1)
      );
      var placement = new cubsPlacement(plane);
      var relationship = new cubsRelationship(cluster, space, placement);
      rels.push(relationship);
    }
  });

  spaces.push(cluster);

  // console testing
  var oJson = new cubsJson(spaces, rels); // cubsJson(scene, spaces); => scene isDecomposedBy spaces
  var str = JSON.stringify(oJson);
  return str; // export "/"...???? format issue
}

/// CUBS OBJECT CLASS
class cubsJson {
  elements = [];
  relationships = [];
  errors = [];

  constructor(spaces, rels) {
    this.elements = spaces;
    this.relationships = rels;
    // convert
  }
}

/// CUBS RELATIONSHIP CLASS
class cubsRelationship {
  id = "";
  type = "isDecomposedBy";
  nature = "relationship";
  sourceId = "";
  targetId = "";
  version = 1;
  dynamicFacets = new cubsDynamicFacets();
  /*
  constructor(srcId, tarId, placement) {
    this.id = generateUUID();
    this.sourceId = srcId;
    this.targetId = tarid;
    this.dynamicFacets = new cubsDynamicFacets(placement); 
  }
  */
  constructor(srcElem, tarElem, placement) {
    this.id = generateUUID();
    this.sourceId = srcElem.id;
    this.targetId = tarElem.id;
    this.dynamicFacets = new cubsDynamicFacets(placement);
  }
}

class cubsDynamicFacets {
  placement = new cubsPlacement();
  constructor(placement) {
    this.placement = placement;
  }
}

class cubsPlacement {
  type = "plane3d";
  unit = "METER";
  value = new cubsPlane();

  constructor(plane) {
    this.value = plane;
  }
}

class cubsPlane {
  origin = new cubsPoint3d();
  xAxis = new cubsVector3d();
  yAxis = new cubsVector3d();
  zAxis = new cubsVector3d();
  constructor(o, x, y, z) {
    this.origin = o;
    this.xAxis = x;
    this.yAxis = y;
    this.zAxis = z;
  }
}

/// CUBS ELEMENT
class cubsSpace {
  id = "";
  name = "";
  description = "";
  type = "room";
  nature = "spatial";
  version = 1;
  geometry = null;

  constructor(mesh) {
    this.id = generateUUID();
    this.name = mesh.userData.name;
    this.geometry = new cubsGeometry(mesh);
  }
}

class cubsPoint2d {
  x = 0.0;
  y = 0.0;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class cubsPoint3d {
  x = 0.0;
  y = 0.0;
  z = 0.0;
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class cubsVector3d {
  x = 0.0;
  y = 0.0;
  z = 0.0;
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class cubsGeometry {
  version = 1;
  primary = new cubsPrimary();
  constructor(mesh) {
    var pri = new cubsPrimary();

    // three geo -> cubs format
    var val = new cubsValue();
    val.profile = getProfile(mesh);
    var mGeo = mesh.geometry;
    val.depth = mGeo.parameters.height;
    pri.value = val;

    // three material -> cubs style
    var tColor = mesh.material.color;
    var sty = new cubsStyle(tColor.r, tColor.g, tColor.b, 1.0);
    pri.style = sty;
    this.primary = pri;
  }
}

class cubsPrimary {
  type = "extrusion2d";
  unit = "METER";
  style = new cubsStyle(); // to be updated
  value = new cubsValue();
  constructor() {}
}

class cubsEmpty {}

class cubsValue {
  depth = 0.0;
  profile = new cubsProfile();
}

class cubsProfile {
  outerLoop = []; // List<cubsPoint2d>
  innerLoops = []; // List<cubsPoint2d>
  constructor() {
    // this.outerLoop = getProfile(mesh);
  }
}

// Q: Is nesting attributes inside constructor a good idea?
class cubsStyle {
  type = "basic";
  value = null;

  constructor(r, g, b, a) {
    var sValue = new cubsStyleValue(r, g, b, a);
    this.value = sValue;
  }
}

class cubsStyleValue {
  color = [];
  opacity = null;
  constructor(r, g, b, a) {
    this.color.push(r);
    this.color.push(g);
    this.color.push(b);
    this.opacity = a;
  }
}

export function getProfile(mesh) {
  // MIGHT NEED TO MAKE : CUBS.Z = -THREE.Z ???
  const position = mesh.geometry.getAttribute("position");
  const cubsPoints = [];
  let meshDepth = 0;

  for (let i = 0; i < position.count / position.itemSize; i++) {
    if (position.getY(i) == 0) {
      cubsPoints.push(new cubsPoint2d(position.getX(i), position.getZ(i)));
    } else {
      console.log(position.getY(i));
    }
  }
  var profile = new cubsProfile(); // need to remap cuz Y & Z
  profile.outerLoop = cubsPoints;
  profile.depth = meshDepth;
  return profile;
}
