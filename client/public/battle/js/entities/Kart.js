import * as THREE from "three";
import { clamp, damp } from "../utils/math.js";
import { GAME_CONFIG } from "../config.js";

const Y_AXIS = new THREE.Vector3(0, 1, 0);

export class Kart {
  constructor({ color = 0xff4d6d } = {}) {
    this.group = new THREE.Group();
    this.heading = 0;
    this.speed = 0;
    this.velocity = new THREE.Vector3();
    this.forward = new THREE.Vector3(0, 0, 1);
    this.tmpVec = new THREE.Vector3();
    this.driftTimer = 0;
    this.boostTimer = 0;
    this.boostAmount = 0;

    this.config = { ...GAME_CONFIG.player };

    this.buildMesh(color);
  }

  buildMesh(color) {
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.2 });
    const accentMat = new THREE.MeshStandardMaterial({ color: 0xffe24a, roughness: 0.4 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.8 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 3.2), bodyMat);
    body.position.y = 0.5;
    const cockpit = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.6, 1.2), accentMat);
    cockpit.position.set(0, 1.0, -0.1);

    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.4, 16);
    const wheelOffsets = [
      [1.1, 0.2, 1.2],
      [-1.1, 0.2, 1.2],
      [1.1, 0.2, -1.2],
      [-1.1, 0.2, -1.2],
    ];
    this.wheels = wheelOffsets.map(([x, y, z]) => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      return wheel;
    });

    this.group.add(body, cockpit, ...this.wheels);
  }

  reset(position = new THREE.Vector3(0, 0, 0), heading = 0) {
    this.group.position.copy(position);
    this.heading = heading;
    this.speed = 0;
    this.velocity.set(0, 0, 0);
  }

  update(dt, input) {
    const { throttle, steer, drift } = input.getAxis();
    const { maxReverse, accel, brake, drag, turnRate, driftTurnBoost, driftDrag } = this.config;
    const boostActive = this.boostTimer > 0;
    const boostValue = boostActive ? this.boostAmount : 0;
    const maxSpeed = this.config.maxSpeed + boostValue;
    const accelBoost = boostActive ? boostValue * 1.2 : 0;

    if (throttle > 0) {
      this.speed += (accel + accelBoost) * throttle * dt;
    } else if (throttle < 0) {
      this.speed += brake * throttle * dt;
    }

    const driftBoost = drift ? driftTurnBoost : 1;
    const turnMultiplier = 0.4 + Math.min(Math.abs(this.speed) / maxSpeed, 1);
    this.heading += steer * turnRate * driftBoost * turnMultiplier * dt;

    const effectiveDrag = drift ? driftDrag : drag;
    const targetSpeed = clamp(this.speed, maxReverse, maxSpeed);
    this.speed = damp(this.speed, targetSpeed, 8, dt);
    this.speed *= Math.max(0, 1 - effectiveDrag * dt);

    if (Math.abs(this.speed) < 0.02) this.speed = 0;

    this.forward.set(0, 0, 1).applyAxisAngle(Y_AXIS, this.heading);

    const desiredVelocity = this.tmpVec.copy(this.forward).multiplyScalar(this.speed);
    const velocityLerp = drift ? 0.08 : 0.2;
    this.velocity.lerp(desiredVelocity, velocityLerp);

    this.group.position.addScaledVector(this.velocity, dt);
    this.group.rotation.y = this.heading;

    this.updateWheels(dt);
    this.driftTimer = drift ? this.driftTimer + dt : 0;
    if (this.boostTimer > 0) {
      this.boostTimer = Math.max(0, this.boostTimer - dt);
    }
  }

  applyBoost(duration, amount) {
    this.boostTimer = Math.max(this.boostTimer, duration);
    this.boostAmount = amount;
  }

  updateWheels(dt) {
    const spin = this.speed * dt * 1.6;
    this.wheels.forEach((wheel) => {
      wheel.rotation.x += spin;
    });
  }
}
