import "./style.css";
import * as THREE from "three";
import {
  Galaxy,
  Star,
  Planet,
  g,
  dt,
  debayTurn,
  softeningConstant,
  trailLength,
  enableDebay,
  debaevskayaConst,
} from "./classes";
// import Objects from './Objects'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "dat.gui";
import { Light, TetrahedronGeometry } from "three";
import planet from "./assets/planet.jpg";
import sun from "./assets/sun.jpg";
import dataJson from "./data.json";

// data ---------------------------------
let data = JSON.parse(JSON.stringify(dataJson));

// scene ---------------------------------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);

// render ---------------------------------
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//const controls = new THREE.OrbitControls(camera, renderer.domElement);

// control ---------------------------------
const controls = new OrbitControls(camera, renderer.domElement);

// const loader = new THREE.TextureLoader()

camera.position.z = 20;

let time = 0;

// create Galaxy ---------------------------------
const Samsung = new Galaxy({
  scene,
  time,
  data,
});

// {
//   "name": "Earth",
//   "type": "Planet",
//   "m": 3.0024584e-6,
//   "x": 2.165,
//   "y": 1.25,
//   "z": 4.33,
//   "vx": 1.216,
//   "vy": -2.43,
//   "vz": 0.702
// }

// create Objects ---------------------------------
//Samsung.createRandomOrbit(2, 3.0024584e-6, 2.459, Samsung.data[0])

Samsung.createObjectWithOrbit(
  1.65956463e-7,
  1.051,
  Math.PI / 14,
  Math.PI / 2,
  Samsung.data[0]
); // Меркурий
Samsung.createObjectWithOrbit(
  2.44699613e-6,
  1.77,
  Math.PI / 1,
  Math.PI / 10,
  Samsung.data[0]
); // Венера
Samsung.createObjectWithOrbit(
  3.0024584e-6,
  2.459,
  Math.PI / 6,
  Math.PI / 4,
  Samsung.data[0]
); // Земля
Samsung.createObjectWithOrbit(
  3.2271514e-7,
  3.737,
  Math.PI / 14,
  Math.PI / 2,
  Samsung.data[0]
); // Марс
// Samsung.createObjectWithOrbit(9.5459429e-4, 13.377, Math.PI/ 1, Math.PI/ 10, Samsung.data[0]) // Юпитер real
Samsung.createObjectWithOrbit(
  9.5459429e-5,
  13.377,
  Math.PI / 1,
  Math.PI / 10,
  Samsung.data[0]
); // Юпитер
Samsung.createObjectWithOrbit(
  2.85815e-4,
  23.426,
  Math.PI / 6,
  Math.PI / 4,
  Samsung.data[0]
); // Сатурн
Samsung.createObjectWithOrbit(
  4.365785e-5,
  47.147,
  Math.PI / 1,
  Math.PI / 10,
  Samsung.data[0]
); // Уран
Samsung.createObjectWithOrbit(
  5.150314e-5,
  73.819,
  Math.PI / 6,
  Math.PI / 4,
  Samsung.data[0]
); // Нептун
for (let i = 0; i < 300; i++) {
  let rand = Math.random() * 2;
  let rand2 = Math.random() * 100;
  let range = Math.random() * 0.1 + 2.959;
  Samsung.createObjectWithOrbit(
    1.0024584e-7,
    range,
    Math.PI / rand,
    Math.PI / 2,
    Samsung.data[0]
  ); // кольцо
}

for (let i = 0; i < 2300; i++) {
  let rand = Math.random() * 2;
  let rand2 = Math.random() * 100;
  let range = Math.random() * 0.1 + 78.819;
  Samsung.createObjectWithOrbit(
    1.0024584e-7,
    range,
    Math.PI / rand,
    Math.PI / 2,
    Samsung.data[0]
  ); // койпер
}
Samsung.initMasses();
// первая космическая скорость земли = 4
// R = 1 = 61 000 000 км

// gui ---------------------------------
const gui = new GUI();
const timeFolder = gui.addFolder("time");
timeFolder.add(Samsung, "dt", 0, 1);
timeFolder.add(Samsung, "g", 10, 500);
if (debayTurn) {
  timeFolder.add(Samsung, "enableDebay", true, false);
}
timeFolder.open();

let div = document.createElement("p");
//div.innerHTML = Samsung.time.toFixed(2);
document.body.appendChild(div);
div.classList = "time";

let divData = document.createElement("div");
divData.appendChild(document.createElement("p"));
divData.appendChild(document.createElement("input"));
divData.appendChild(document.createElement("button"));
divData.appendChild(document.createElement("ul"));

divData.classList = "data";

function ShowNobjects(n) {
  while (SetData[3].firstChild) {
    SetData[3].removeChild(SetData[3].firstChild);
  }
  if (n > Samsung.getQuantityObjects()) {
    n = Samsung.getQuantityObjects();
  }
  for (let i = 0; i < n; i++) {
    let li = document.createElement("li");
    let name = document.createElement("p");
    let data = document.createElement("p");
    li.appendChild(name);
    li.appendChild(data);
    SetData[3].appendChild(li);
  }
}

let SetData = divData.children;
let updateData = SetData[3].children;
let n = 1;

SetData[1].addEventListener("change", (e) => {
  n = e.target.value;
});

SetData[2].innerHTML = "get";

SetData[2].addEventListener("click", () => {
  ShowNobjects(n);
});
document.body.appendChild(divData);
divData.firstChild.innerHTML =
  "mass of system: " +
  Samsung.getMassOfGalaxy().toFixed(6) * 1.988 +
  " * 10^30 кг" +
  "<br />r = км" +
  "<br />v = км/c";

// OneFrame function ---------------------------------
function animate() {
  requestAnimationFrame(animate);

  Samsung.updatePositions();
  //Samsung.InitPositionTrail()

  if (updateData.length != 0) {
    let i = 0;

    for (let elem of updateData) {
      if (Samsung.getObjectData(i)) {
        const object = Samsung.getObjectData(i);
        let name = object.name ? object.name : "unknown";
        let liChildrens = elem.children;
        liChildrens[0].innerHTML = "name: " + name;
        liChildrens[1].innerHTML =
          "mass: " +
          object.m * 1.98892 +
          " * 10^30 кг" +
          "<br />" +
          "x:" +
          Math.round(object.x * 61) +
          " * 10^6" +
          " y: " +
          Math.round(object.y * 61) +
          " * 10^6" +
          " z:" +
          Math.round(object.z * 61) +
          " * 10^6" +
          "<br />" +
          "vx:" +
          Math.round(object.vx * 1.975) +
          " vy: " +
          Math.round(object.vy * 1.975) +
          " vz:" +
          Math.round(object.vz * 1.975);
        i++;
      }
    }
  }

  div.innerHTML = "time: " + Samsung.time.toFixed(2) + " (years)";

  controls.update();

  renderer.render(scene, camera);
}
animate();
