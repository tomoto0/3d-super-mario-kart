import * as THREE from "three";
import { GAME_CONFIG } from "../config.js";

const BALLOON_COLORS = [0xff3d6e, 0x54e08f, 0x42b7ff];

export class BalloonRig {
  constructor() {
    this.group = new THREE.Group();
    this.balloons = [];
    this.count = 0;
    this.clock = 0;
    this.buildBalloons();
  }

  buildBalloons() {
    const balloonGeo = new THREE.SphereGeometry(0.5, 16, 12);
    const stringGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);

    BALLOON_COLORS.forEach((color, index) => {
      const balloon = new THREE.Group();
      const sphere = new THREE.Mesh(balloonGeo, new THREE.MeshStandardMaterial({ color }));
      const string = new THREE.Mesh(stringGeo, new THREE.MeshStandardMaterial({ color: 0x1f1f1f }));
      sphere.position.y = 0.8;
      string.position.y = 0.2;
      balloon.add(sphere, string);
      balloon.position.set((index - 1) * 0.8, 2.4, -1.2);
      this.group.add(balloon);
      this.balloons.push(balloon);
    });

    this.setCount(GAME_CONFIG.balloons.startCount);
  }

  setCount(count) {
    this.count = Math.max(0, Math.min(count, this.balloons.length));
    this.balloons.forEach((balloon, index) => {
      balloon.visible = index < this.count;
    });
  }

  pop() {
    if (this.count <= 0) return;
    this.setCount(this.count - 1);
  }

  update(dt) {
    this.clock += dt * GAME_CONFIG.balloons.bobSpeed;
    this.balloons.forEach((balloon, index) => {
      const offset = Math.sin(this.clock + index) * GAME_CONFIG.balloons.bobHeight;
      balloon.position.y = 2.4 + offset;
    });
  }
}
