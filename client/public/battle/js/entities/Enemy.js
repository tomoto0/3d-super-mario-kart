import * as THREE from "three";
import { Kart } from "./Kart.js";
import { BalloonRig } from "./BalloonRig.js";
import { applyEnemyDesign, ENEMY_STYLES } from "./EnemyDesigns.js";
import { clamp, randRange, wrapAngle } from "../utils/math.js";

class AIInput {
  constructor() {
    this.state = { throttle: 0, steer: 0, drift: false };
  }

  set(state) {
    this.state = { ...this.state, ...state };
  }

  getAxis() {
    return this.state;
  }
}

export class Enemy {
  constructor({ id, styleId, spawn, arena }) {
    this.id = id;
    this.styleId = styleId;
    this.arena = arena;
    this.radius = 1.6;

    const style = ENEMY_STYLES[styleId] || ENEMY_STYLES.grassland;
    this.kart = new Kart({ color: style.body });
    applyEnemyDesign(this.kart.group, styleId);

    this.balloons = new BalloonRig();
    this.kart.group.add(this.balloons.group);

    this.group = this.kart.group;
    this.group.position.copy(spawn);

    this.aiInput = new AIInput();
    this.aiState = {
      mode: "roam",
      wanderTarget: spawn.clone(),
      decisionTimer: 0,
    };

    this.state = {
      balloons: 3,
      hitCooldown: 0,
      alive: true,
    };

    this.tmpVec = new THREE.Vector3();
    this.toTarget = new THREE.Vector3();
    this.toCenter = new THREE.Vector3();
  }

  update(dt, player) {
    if (!this.state.alive) return;
    this.updateAI(dt, player.group.position);
    this.kart.update(dt, this.aiInput);
    this.balloons.update(dt);
    if (this.state.hitCooldown > 0) {
      this.state.hitCooldown = Math.max(0, this.state.hitCooldown - dt);
    }
  }

  updateAI(dt, playerPosition) {
    const position = this.group.position;
    const arenaCenter = this.arena.center;
    const arenaRadius = this.arena.radius;

    this.toCenter.subVectors(position, arenaCenter);
    const distanceFromCenter = this.toCenter.length();

    const toPlayer = this.tmpVec.subVectors(playerPosition, position);
    const playerDistance = toPlayer.length();

    if (distanceFromCenter > arenaRadius) {
      this.aiState.mode = "return";
      this.aiState.wanderTarget.copy(arenaCenter);
      this.aiState.decisionTimer = 0.6;
    } else if (playerDistance < 24) {
      this.aiState.mode = "chase";
    } else {
      this.aiState.mode = "roam";
    }

    this.aiState.decisionTimer -= dt;
    if (this.aiState.mode === "roam") {
      if (this.aiState.decisionTimer <= 0 || position.distanceTo(this.aiState.wanderTarget) < 4) {
        const angle = randRange(0, Math.PI * 2);
        const radius = randRange(arenaRadius * 0.3, arenaRadius * 0.85);
        this.aiState.wanderTarget.set(
          arenaCenter.x + Math.cos(angle) * radius,
          arenaCenter.y,
          arenaCenter.z + Math.sin(angle) * radius,
        );
        this.aiState.decisionTimer = randRange(2.2, 4.2);
      }
    }

    const target = this.aiState.mode === "chase" ? playerPosition : this.aiState.wanderTarget;
    this.toTarget.subVectors(target, position);
    const distance = this.toTarget.length();

    const targetAngle = Math.atan2(this.toTarget.x, this.toTarget.z);
    const angleDiff = wrapAngle(targetAngle - this.kart.heading);
    const steer = clamp(angleDiff * 1.4, -1, 1);

    const throttle = distance > 3 ? 1 : 0.4;
    const drift = Math.abs(steer) > 0.6 && distance > 6;

    this.aiInput.set({ throttle, steer, drift });
  }

  applyDamage(amount) {
    if (!this.state.alive || this.state.hitCooldown > 0) return;
    this.state.balloons = Math.max(0, this.state.balloons - amount);
    this.balloons.setCount(this.state.balloons);
    this.state.hitCooldown = 0.7;
    if (this.state.balloons <= 0) {
      this.state.alive = false;
      this.group.visible = false;
    }
  }
}
