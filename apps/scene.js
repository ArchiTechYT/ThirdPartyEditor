import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { getColor, getVertices, SaveJsonToFile } from "./helpers";
import { getProfile } from "./convertor";
import { threeToCubsJson } from "./convertor";
import { generateUUID } from "three/src/math/MathUtils";
//import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
//const loader = new GLTFLoader();

// + SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// + CAMERA
const camera = new THREE.PerspectiveCamera(75, 1000 / 500, 0.1, 1000);
camera.position.z = 5;
camera.position.x = 5;
camera.position.y = 5;

// ADD A 2D-CEMERA OPTION

// + CANVAS
const canvas = document.querySelector(".webgl"); // query from html

// + RENDERER
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});

// + LIGHT
const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const dLight1 = new THREE.DirectionalLight(0xffffff, 1); // pos(0, 1, 0)

const dLight2 = new THREE.DirectionalLight(0xffffff, 1); // pos(1, 1, 0)
dLight2.position.x = 1;

const dLight3 = new THREE.DirectionalLight(0xffffff, 1); // pos(1, 1, 1)
dLight3.position.x = 1;
dLight3.position.z = 1;

const dLight4 = new THREE.DirectionalLight(0xffffff, 1); // pos(-1, 1, -1)
dLight3.position.x = -1;
dLight3.position.z = -1;

scene.add(dLight1);
scene.add(dLight2);
scene.add(dLight3);
scene.add(dLight4);

// + GEOMETRY
let box = new THREE.Mesh();
let ground = new THREE.Mesh();
let geometry = new THREE.BoxGeometry();
let selectedMaterial = new THREE.MeshBasicMaterial();

function addGeometry(name, x, y, z) {
  geometry = new THREE.BoxGeometry(x, y, z);
  geometry.translate(0.5 * x, 0.5 * y, 0.5 * z);

  const material = new THREE.MeshStandardMaterial();
  var cCode = getColor();
  material.color = new THREE.Color(cCode);

  box = new THREE.Mesh(geometry, material); // old
  // box = new THREE.Mesh(geometry, selectedMaterial); /// check!
  scene.add(box);
  box.userData.draggable = true;
  box.userData.name = name;
}

function addGround() {
  const geoGround = new THREE.BoxGeometry(50, 0.1, 50);
  geoGround.translate(0, -0.1, 0);
  const matGround = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
  ground = new THREE.Mesh(geoGround, matGround);
  ground.userData.ground = true;
  ground.userData.name = "ground";
  scene.add(ground);
}

// + CONTROLLER
const controls = new OrbitControls(camera, renderer.domElement);

// + GRID HELPER
const size = 50;
let divisions = 50;
let gridHelper = new THREE.GridHelper();

function addGridHelper() {
  gridHelper = new THREE.GridHelper(size, divisions, 0xaaaaaa, 0xffffff); // (size, division, central line colour, grid colour)
  scene.add(gridHelper);
}

function updateGridHelper(u) {
  scene.remove(gridHelper);
  divisions = parseInt(Math.floor(size / u));
  gridHelper = new THREE.GridHelper(size, divisions, 0xaaaaaa, 0xffffff);
  scene.add(gridHelper);
}

// + AXES HELPER
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

// + RAYCASTER
const raycaster = new THREE.Raycaster();
const clickMouse = new THREE.Vector2();
const moveMouse = new THREE.Vector2();
var draggableObj = new THREE.Object3D(); /// tutorial = var draggableObj: THREE.Object3D;

window.addEventListener("click", (event) => {
  if (draggableObj) {
    draggableObj = null;
    return;
  }

  clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(clickMouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0 && intersects[0].object.userData.draggable) {
    draggableObj = intersects[0].object;
    console.log(draggableObj.userData.name);
  }
});

window.addEventListener("mousemove", (event) => {
  moveMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  moveMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

function dragObejct() {
  if (draggableObj != null) {
    raycaster.setFromCamera(moveMouse, camera);
    const found = raycaster.intersectObjects(scene.children);

    if (found.length > 0) {
      for (let o of found) {
        if (o.object.userData.ground) {
          continue;
        } else {
          draggableObj.position.x = o.point.x;
          draggableObj.position.z = o.point.z;
        }
      }
    }
  }
}

// + HTML EVENTS
document.getElementById("btn_remove").onclick = function (e) {
  e.preventDefault();
  scene.remove(box);
};

document.getElementById("btn_create").onclick = function (e) {
  e.preventDefault();
  var name = document.getElementById("sName").value;
  var width = document.getElementById("sWidth").value;
  var length = document.getElementById("sLength").value;
  var height = document.getElementById("sHeight").value;
  addGridHelper();
  addGeometry(name, width, height, length);
};

document.getElementById("btn_update").onclick = function (e) {
  e.preventDefault();
  var sUnit = document.getElementById("sUnit").value;
  console.log(sUnit);
  updateGridHelper(sUnit);
};

document.getElementById("btn_upload").onclick = function (e) {
  e.preventDefault();
  var json = threeToCubsJson(scene);
  SaveJsonToFile(json);
};

// CHANGE MATERIALS
const styleDropdown = document.getElementById("style-names");

// Dropdown change event handler
styleDropdown.addEventListener("change", (e) => {
  e.preventDefault();
  //const selectedTexture = styleDropdown.value;

  //var filepath = "/images/" + selectedMaterial + ".jpg";
  //console.log("/images/modernism.jpg");

  const selectedTextureObj = new THREE.TextureLoader().load(
    "/images/modernism.jpg"
  );
  selectedMaterial = new THREE.MeshBasicMaterial({
    map: selectedTextureObj,
  });

  // boxMesh.material = selectedMaterial;
  // return a material to apply to box
});

/// TESTING ZONE
document.getElementById("btn_test").onclick = function (e) {
  e.preventDefault();
  console.log("testing now");
  var profile = getProfile(box);
  console.log(JSON.stringify(profile));

  var worldPosition = new THREE.Vector3();
  box.getWorldPosition(worldPosition);
  console.log("box's world position = ", worldPosition);
};

// ANIMATE
function animate() {
  dragObejct();
  renderer.render(scene, camera); // make camera switchable between 2d vs 3d
  requestAnimationFrame(animate);
}

///////// LOOPING FUNCTION ON SCENE /////////

addGround();
animate();
