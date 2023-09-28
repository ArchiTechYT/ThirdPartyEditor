import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from "three/addons/loaders/MTLLoader.js";
import { getColor } from "./helpers";

const canvas = document.getElementById("canvas_adingo");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // can this be a grunch style background?

// Lighting
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

// Camera
const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 100);
camera.position.x = -10;
camera.position.y = 5;
camera.position.z = 5;
scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(1000, 500); // how to automatically link to canvas?
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
// const controls = new THREE.OrbitControls(camera, canvas);
const controls = new OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.enablePan = true;
controls.addEventListener("change", (event) => {
  // console.log(controls.object.position);
});

const uploadForm = document.getElementById("btn_upload");

console.log("upload function is called!");

uploadForm.addEventListener("click", (e) => {
  e.preventDefault();

  addObject("model/adingo_base.obj", "model/adingo_base.mtl");
  addObject("model/adingo_floor.obj", "model/adingo_floor.mtl");
  addObject("model/adingo_kitchen.obj", "model/adingo_kitchen.mtl");
  addObject("model/adingo_walls.obj", "model/adingo_walls.mtl");
});

// LOAD OBJ + MTL
function addObject(objFileName, mtlFileName) {
  const mtlLoader = new MTLLoader();
  mtlLoader.load(mtlFileName, (materials) => {
    materials.preload();

    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load(objFileName, (object) => {
      scene.add(object);
      renderer.render(scene, camera);
    });
  });
}

// GRID HELPER
const size = 50;
let divisions = 50;
let gridHelper = new THREE.GridHelper();

function addGridHelper() {
  gridHelper = new THREE.GridHelper(size, divisions, 0xaaaaaa, 0xffffff); // (size, division, central line colour, grid colour)
  scene.add(gridHelper);
}

let ground = new THREE.Mesh();

// GROUND
function addGround() {
  const geoGround = new THREE.BoxGeometry(50, 0.1, 50);
  geoGround.translate(0, -0.1, 0);
  const matGround = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
  ground = new THREE.Mesh(geoGround, matGround);
  ground.userData.ground = true;
  ground.userData.name = "ground";
  scene.add(ground);
}

// Animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}

addGround();
animate();
addGridHelper();

// TODO: HOW TO ASSIGN MATERIALS?
