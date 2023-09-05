import "./style.css";
import * as THREE from "three";
// import Objects from './Objects'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "dat.gui";
import { Light, TetrahedronGeometry } from "three";
import planet from "./assets/planet.jpg";
import sun from "./assets/sun.jpg";

const types = ["Planet", "Star"];
const resolutionSphere = 16;
const intersecting = false;
const debayTurn = true;
const debaevskayaConst = 350;
const enableLight = false;
const g = 39.5;
const dt = 0.001;
const softeningConstant = 0.15;
const trailLength = 1500;
const enableDebay = false;
const widthTrail = 0.01;

class Star {
  constructor(params) {
    this.scene = params.scene;
    const data = params.data;
    this.mass = data.m;
    this.radius = 0.4;
    this.DebayConst = params.debayConst;
    this.enableDebay = params.enableDebay;
    this.x = data.x;
    this.y = data.y;
    this.z = data.z;
    this.trail = [];
    this.color = 0xffffff;
    this.StarTexture = params.Texture;
    this.Objects;
  }

  Init(x, y, z) {
    if (this.mass < 1) {
      this.color = 0xffffff;
      this.radius = 0.1 * this.mass;
    }
    if (this.mass >= 1 && this.mass < 5) {
      this.color = 0xfff000;
      this.radius = 0.4 * this.mass;
    }
    if (this.mass >= 5 && this.mass < 10) {
      this.color = 0xffa500;
      this.radius = 0.7 * this.mass;
    }
    if (this.mass >= 10) {
      this.color = 0xff0000;
      this.radius = 1 * this.mass;
    }

    const material = this.StarTexture
      ? { map: this.StarTexture }
      : { color: this.color };

    let StarActivity;
    if (enableLight) {
      StarActivity = new THREE.Mesh(
        new THREE.SphereGeometry(
          this.radius,
          resolutionSphere,
          resolutionSphere
        ),
        new THREE.MeshBasicMaterial(material)
      );
      StarActivity.position.set(x, y, z);
      this.scene.add(StarActivity);
    } else {
      StarActivity = new THREE.Mesh(
        new THREE.SphereGeometry(
          this.radius,
          resolutionSphere,
          resolutionSphere
        ),
        new THREE.MeshBasicMaterial(material)
      );
      StarActivity.position.set(x, y, z);
      this.scene.add(StarActivity);
    }

    let Debay = null;

    if (debayTurn) {
      Debay = new THREE.Mesh(
        new THREE.SphereGeometry(this.radius * this.DebayConst, 8, 8),
        new THREE.MeshNormalMaterial({ wireframe: true })
      );
      if (this.enableDebay) {
        Debay.position.set(x, y, z);
        this.scene.add(Debay);
      }
    }

    let StarLight = null;

    if (enableLight) {
      StarLight = new THREE.PointLight(0xfff, 0.5);
      StarLight.position.set(x, y, z);
      this.scene.add(StarLight);
    }

    this.Objects = {
      Activity: StarActivity,
      trail: this.trail,
      debay: Debay,
      Light: StarLight,
    };
  }

  Position(x, y, z, angle) {
    this.Objects.Activity.position.x = x;
    this.Objects.Activity.position.y = y;
    this.Objects.Activity.position.z = z;
    this.Objects.Activity.rotation.y += angle;

    if (enableLight) {
      this.Objects.Light.position.x = x;
      this.Objects.Light.position.y = y;
      this.Objects.Light.position.z = z;
    }

    if (this.enableDebay && debayTurn) {
      this.Objects.debay.position.x = x;
      this.Objects.debay.position.y = y;
      this.Objects.debay.position.z = z;
    }
  }

  InitDebay(x, y, z) {
    this.Objects.debay.position.set(x, y, z);
    this.scene.add(this.Objects.debay);
  }

  RemoveDebay() {
    this.scene.remove(this.Objects.debay);
  }

  Trail(x, y, z, wT, len) {
    this.Objects.trail.push(
      new THREE.Mesh(
        new THREE.SphereGeometry(wT, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0x0000ff })
      )
    );
    this.Objects.trail[this.Objects.trail.length - 1].position.set(x, y, z);
    this.scene.add(this.Objects.trail[this.Objects.trail.length - 1]);
    if (this.Objects.trail.length > len) {
      this.scene.remove(this.Objects.trail[0]);
      this.Objects.trail.shift();
    }
  }
}

class Planet {
  constructor(params) {
    this.scene = params.scene;
    const data = params.data;
    this.mass = data.m;
    this.radius = 0.1;
    this.DebayConst = params.debayConst;
    this.enableDebay = params.enableDebay;
    this.x = data.x;
    this.y = data.y;
    this.z = data.z;
    this.trail = [];
    this.PLanetTexture = params.Texture;
    this.Objects;
  }

  Init(x, y, z) {
    if (this.mass < 1.65956463e-7) {
      this.color = 0xdae;
      this.radius = 500000 * this.mass;
    }
    if (this.mass >= 1.65956463e-7 && this.mass < 4.365785e-5) {
      this.color = 0x000fff;
      this.radius = 80000 * this.mass;
    }
    if (this.mass >= 4.365785e-5 && this.mass < 0.001) {
      this.color = 0xdfff;
      this.radius = 5000 * this.mass;
    }
    if (this.mass > 0.001 && this.mass < 0.1) {
      this.color = 0xabc;
      this.radius = 10 * this.mass;
    }
    if (this.mass >= 0.11 && this.mass < 0.5) {
      this.color = 0xccd;
      this.radius = 7 * this.mass;
    }
    if (this.mass >= 0.5 && this.mass < 1) {
      this.color = 0xcde;
      this.radius = 4 * this.mass;
    }
    if (this.mass >= 1) {
      this.color = 0xdef;
      this.radius = 1 * this.mass;
    }

    const material = this.PLanetTexture
      ? { map: this.PLanetTexture }
      : { color: this.color };

    let PlanetActivity;

    if (enableLight) {
      PlanetActivity = new THREE.Mesh(
        new THREE.SphereGeometry(
          this.radius,
          resolutionSphere,
          resolutionSphere
        ),
        new THREE.MeshPhongMaterial(material)
      );
      PlanetActivity.position.set(x, y, z);
      this.scene.add(PlanetActivity);
    } else {
      PlanetActivity = new THREE.Mesh(
        new THREE.SphereGeometry(
          this.radius,
          resolutionSphere,
          resolutionSphere
        ),
        new THREE.MeshBasicMaterial(material)
      );
      PlanetActivity.position.set(x, y, z);
      this.scene.add(PlanetActivity);
    }

    let Debay = null;

    if (debayTurn) {
      Debay = new THREE.Mesh(
        new THREE.SphereGeometry(this.radius * this.DebayConst, 8, 8),
        new THREE.MeshNormalMaterial({ wireframe: true })
      );
      if (this.enableDebay) {
        Debay.position.set(x, y, z);
        this.scene.add(Debay);
      }
    }

    this.Objects = {
      Activity: PlanetActivity,
      trail: this.trail,
      debay: Debay,
    };
  }

  Position(x, y, z, angle = 0) {
    this.Objects.Activity.position.x = x;
    this.Objects.Activity.position.y = y;
    this.Objects.Activity.position.z = z;
    this.Objects.Activity.rotation.y += angle;

    if (this.enableDebay && debayTurn) {
      this.Objects.debay.position.x = x;
      this.Objects.debay.position.y = y;
      this.Objects.debay.position.z = z;
    }
  }

  InitDebay(x, y, z) {
    this.Objects.debay.position.set(x, y, z);
    this.scene.add(this.Objects.debay);
  }

  RemoveDebay() {
    this.scene.remove(this.Objects.debay);
  }

  Trail(x, y, z, wT, len) {
    this.Objects.trail.push(
      new THREE.Mesh(
        new THREE.SphereGeometry(wT, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0x0000ff })
      )
    );
    this.Objects.trail[this.Objects.trail.length - 1].position.set(x, y, z);
    this.scene.add(this.Objects.trail[this.Objects.trail.length - 1]);
    if (this.Objects.trail.length > len) {
      this.scene.remove(this.Objects.trail[0]);
      this.Objects.trail.shift();
    }
  }
}

class Galaxy {
  constructor(params) {
    this.time = params.time;
    this.scene = params.scene;
    this.g = g;
    this.dt = dt;
    this.softeningConstant = softeningConstant;
    this.debaevskayaConst = debaevskayaConst;
    this.enableDebay = enableDebay;
    this.data = params.data;
    this.masses = [];
  }

  getQuantityObjects() {
    return this.data.length;
  }

  getObjectData(index) {
    return this.data[index];
  }

  getMassOfGalaxy() {
    let mass = 0;
    this.data.forEach((dataOne) => {
      mass += dataOne.m;
    });

    return mass;
  }

  createRandom(quantity, drm, drxyz, drv) {
    for (let i = 0; i < quantity; i++) {
      let randType = types[Math.round(Math.random() * (types.length - 1))];
      this.data.push({
        name: `randomPlanet №${i}`,
        type: randType,
        m: Math.random() * drm,
        x: Math.random() * drxyz - drxyz / 2,
        y: Math.random() * drxyz - drxyz / 2,
        z: Math.random() * drxyz - drxyz / 2,
        vx: Math.random() * drv - drv / 2,
        vy: Math.random() * drv - drv / 2,
        vz: Math.random() * drv - drv / 2,
      });
    }
  }

  createRandomStarSystem(quantity, randomDist, CenterDataObject) {
    let mass = CenterDataObject.m;
    for (let i = 0; i < quantity; i++) {
      let distAlhFi = [
        Math.random() * randomDist,
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI,
      ];
      let absV = Math.sqrt((mass * this.g) / distAlhFi[0]);
      this.data.push({
        name: `randomPlanetWithOrbitStar №${i}`,
        type: "Planet",
        m: mass / 10000,
        x:
          distAlhFi[0] * Math.sin(distAlhFi[1]) * Math.cos(distAlhFi[2]) +
          CenterDataObject.x,
        y:
          distAlhFi[0] * Math.sin(distAlhFi[1]) * Math.sin(distAlhFi[2]) +
          CenterDataObject.y,
        z: distAlhFi[0] * Math.cos(distAlhFi[1]) + CenterDataObject.z,
        vx:
          absV * Math.sin(distAlhFi[1]) * Math.cos(distAlhFi[2]) +
          CenterDataObject.vx,
        vy: -absV * Math.cos(distAlhFi[1]) + CenterDataObject.vy,
        vz:
          absV * Math.sin(distAlhFi[1]) * Math.sin(distAlhFi[2]) +
          CenterDataObject.vz,
      });
    }
  }

  createRandomOrbit(quantity, averageMass, averageDist, CenterDataObject) {
    let mass = CenterDataObject.m;
    for (let i = 0; i < quantity; i++) {
      let distAlhFi = [
        Math.random() * averageDist + averageDist / 2,
        Math.random() * 2 * Math.PI,
        Math.random() * 2 * Math.PI,
      ];
      let absV = Math.sqrt((mass * this.g) / distAlhFi[0]);
      let absVrandom = Math.random() * absV + absV / 2;
      this.data.push({
        name: `randomPlanetWithOrbit №${i}`,
        type: "Planet",
        m: Math.random() * averageMass + averageMass / 2,
        x:
          distAlhFi[0] * Math.sin(distAlhFi[1]) * Math.cos(distAlhFi[2]) +
          CenterDataObject.x,
        y:
          distAlhFi[0] * Math.sin(distAlhFi[1]) * Math.sin(distAlhFi[2]) +
          CenterDataObject.y,
        z: distAlhFi[0] * Math.cos(distAlhFi[1]) + CenterDataObject.z,
        vx:
          absVrandom * Math.sin(distAlhFi[1]) * Math.cos(distAlhFi[2]) +
          CenterDataObject.vx,
        vy: -absVrandom * Math.cos(distAlhFi[1]) + CenterDataObject.vy,
        vz:
          absVrandom * Math.sin(distAlhFi[1]) * Math.sin(distAlhFi[2]) +
          CenterDataObject.vz,
      });
    }
  }

  createObjectWithOrbit(mass, distance, alpha, fi, massiveObject) {
    let massOfMO = massiveObject.m;
    let absV = Math.sqrt((massOfMO * this.g) / distance);
    this.data.push({
      name: `PlanetWithOrbit ${mass}`,
      type: "Planet",
      m: mass,
      x: distance * Math.sin(alpha) * Math.cos(fi) + massiveObject.x,
      y: distance * Math.sin(alpha) * Math.sin(fi) + massiveObject.y,
      z: distance * Math.cos(alpha) + massiveObject.z,
      vx: absV * Math.sin(alpha) * Math.cos(fi) + massiveObject.vx,
      vy: -absV * Math.cos(alpha) + massiveObject.vy,
      vz: absV * Math.sin(alpha) * Math.sin(fi) + massiveObject.vz,
    });
    console.log(distance * 61000000 + " " + absV);
  }

  initMasses() {
    for (let i = 0; i < this.data.length; i++) {
      for (let j = 0; j < this.data.length; j++) {
        if (this.data[i].m > this.data[j].m) {
          let help = this.data[j];
          this.data[j] = this.data[i];
          this.data[i] = help;
        }
      }
    }
    this.data.forEach((dataOne, i) => {
      switch (dataOne.type) {
        case "Planet":
          this.masses[i] = new Planet({
            scene: this.scene,
            data: dataOne,
            debayConst: this.debaevskayaConst,
            enableDebay: this.enableDebay,
            Texture: null,
          });
          break;
        case "Star":
          this.masses[i] = new Star({
            scene: this.scene,
            data: dataOne,
            debayConst: this.debaevskayaConst,
            enableDebay: this.enableDebay,
            Texture: null,
          });
          break;

        default:
          break;
      }
    });
    this.masses.forEach((mass) => {
      mass.Init(mass.x, mass.y, mass.z);
    });

    return this;
  }

  initDebayAll() {
    this.masses.forEach((mass) => {
      mass.InitDebay(mass.x, mass.y, mass.z);
    });

    return this;
  }

  deleteDebay() {
    this.masses.forEach((mass) => {
      mass.RemoveDebay();
    });

    return this;
  }

  InitPositionTrail() {
    this.masses.forEach((mass, i) => {
      mass.Trail(
        this.data[i].x,
        this.data[i].y,
        this.data[i].z,
        widthTrail,
        trailLength
      );
    });

    return this;
  }

  intersectForStars(mass1, i1) {
    let inter = false;
    let massInter;
    if (mass1.type == "Star") {
      this.data.forEach((mass2, i2) => {
        if (mass2.type == "Star") {
          let dx = mass1.x - mass2.x;
          let dy = mass1.y - mass2.y;
          let dz = mass1.z - mass2.z;
          let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (
            dist < (this.masses[i1].radius + this.masses[i2].radius) / 2 &&
            dist != 0
          ) {
            inter = true;
            massInter = i2;
          }
        }
      });
    }
    return { inter, massInter };
  }

  intersectForAll(mass1, i1) {
    let inter = false;
    let massInter;
    this.data.forEach((mass2, i2) => {
      let dx = mass1.x - mass2.x;
      let dy = mass1.y - mass2.y;
      let dz = mass1.z - mass2.z;
      let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < this.masses[i1].radius + this.masses[i2].radius && dist != 0) {
        inter = true;
        massInter = i2;
      }
    });
    return { inter, massInter };
  }

  updatePositions() {
    this.time += this.dt / 4;
    this.updateAcceleration();
    this.updateVelocity();

    if (debayTurn) {
      if (this.enableDebay) {
        this.initDebayAll();
      } else {
        this.deleteDebay();
      }
    }

    this.data.forEach((mass, i) => {
      mass.x += mass.vx * this.dt;
      mass.y += mass.vy * this.dt;
      mass.z += mass.vz * this.dt;

      if (intersecting) {
        const { inter, massInter } = this.intersectForStars(mass, i);

        if (inter) {
          if (mass.m > this.data[massInter].m) {
            mass.m += this.data[massInter].m;
            this.data.splice(massInter, 1);
            this.scene.remove(this.masses[massInter].Objects.Activity);
            this.masses.splice(massInter, 1);
          } else {
            this.data[massInter].m += mass.m;
            this.data.splice(i, 1);
            this.scene.remove(this.masses[i].Objects.Activity);
            this.masses.splice(i, 1);
          }
        }
      }

      this.masses[i].Position(mass.x, mass.y, mass.z, 0);
      if (this.enableDebay && debayTurn) {
        this.masses[i].enableDebay = true;
      }
    });

    return this;
  }

  updateVelocity() {
    this.data.forEach((mass) => {
      mass.vx += mass.ax * this.dt;
      mass.vy += mass.ay * this.dt;
      mass.vz += mass.az * this.dt;
    });

    return this;
  }

  updateAcceleration() {
    this.data.forEach((mass1) => {
      let ax = 0;
      let ay = 0;
      let az = 0;

      this.data.forEach((mass2) => {
        if (mass1 !== mass2) {
          const dx = mass2.x - mass1.x;
          const dy = mass2.y - mass1.y;
          const dz = mass2.z - mass1.z;
          const distSq = dx * dx + dy * dy + dz * dz;

          if (
            mass2.m * this.debaevskayaConst > Math.sqrt(distSq) ||
            !debayTurn
          ) {
            const f =
              (this.g * mass2.m) /
              (distSq * Math.sqrt(distSq + this.softeningConstant));
            ax += dx * f;
            ay += dy * f;
            az += dz * f;
          }
        }
      });

      mass1.ax = ax;
      mass1.ay = ay;
      mass1.az = az;
    });

    return this;
  }
}

export {
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
};
