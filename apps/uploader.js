// Canvas
const canvas = document.querySelector("#model-viewer");

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // can this be a grunch style background?

// Lighting
const light = new THREE.PointLight();
light.position.set(0, 7.5, 20);
light.color.set(0x999999);
scene.add(light);

const amLight = new THREE.AmbientLight(0x404040); // soft white light
scene.add(amLight);

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
renderer.setSize(600, 300); // how to automatically link to canvas?
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const controls = new THREE.OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = true;
controls.addEventListener("change", (event) => {
  console.log(controls.object.position);
});

// model-selector
const uploadForm = document.getElementById("upload-form");
console.log(uploadForm);

uploadForm.addEventListener("submit", (e) => {
  e.preventDefault();

  let objName = "model/";
  var select = document.getElementById("template");
  var option = select.options[select.selectedIndex];

  var value = select.options[select.selectedIndex].value;
  objName += value;

  ObjUploader(objName);
});

// "model/oneBedroom.obj"

// OBJ-Loader
function ObjUploader(objName) {
  const loader = new THREE.OBJLoader();

  loader.load(
    objName,
    function (object) {
      object.position.set(5, 0, 2.5); // maybe add axis helper?
      scene.add(object);
    },
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function (error) {
      console.log("An error happened");
    }
  );
}

// Animate
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}

animate();
