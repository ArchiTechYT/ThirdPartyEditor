import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { seededRandom } from "three/src/math/MathUtils";

const rgbArray = [
  "rgb(194, 229, 242)",
  "rgb(136, 223, 242)",
  "rgb(  4, 196, 217)",
  "rgb(  4, 217, 217)",
  "rgb(108, 241, 247)",
  "rgb( 85, 188, 194)",
  "rgb(  7, 178, 217)",
  "rgb( 64, 141, 145)",
];

var counter = 0;

export function getColor() {
  // var index = getRandomInt(rgbArray.length);
  var index = counter % rgbArray.length;
  console.log(index);
  var cCode = rgbArray[index];
  counter++;
  return cCode;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// GEOMETRY
export function getVertices(mesh) {
  const position = mesh.geometry.getAttribute("position");
  const vertices = [];
  for (let i = 0; i < position.count / position.itemSize; i++) {
    const vertex = new THREE.Vector3(
      position.getX(i),
      position.getY(i),
      position.getZ(i)
    );
    vertices.push(vertex);
  }
  return vertices;
}
