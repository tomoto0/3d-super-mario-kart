import * as THREE from "three";
import { Enemy } from "../entities/Enemy.js";
import { disposeObject3D } from "../utils/dispose.js";

export class EnemySystem {
  constructor(scene) {
    this.scene = scene;
    this.enemies = [];
    this.arena = {
      center: new THREE.Vector3(0, 0, 0),
      radius: 40,
    };
  }

  setup(stage) {
    this.clear();
    if (!stage) return;
    const styleId = stage.enemyStyle || stage.id || "grassland";
    const enemySpawns = stage.enemySpawns || [];
    const arenaCenter = stage.arenaCenter || new THREE.Vector3(0, 0, 0);
    const arenaRadius = stage.arenaRadius || 40;

    this.arena.center.copy(arenaCenter);
    this.arena.radius = arenaRadius;

    enemySpawns.forEach((spawn, index) => {
      const enemy = new Enemy({
        id: `enemy_${index}`,
        styleId,
        spawn,
        arena: this.arena,
      });
      this.enemies.push(enemy);
      this.scene.add(enemy.group);
    });
  }

  update(dt, player) {
    this.enemies.forEach((enemy) => enemy.update(dt, player));
  }

  getTargets() {
    return this.enemies
      .filter((enemy) => enemy.state.alive)
      .map((enemy) => ({
        id: enemy.id,
        position: enemy.group.position,
        radius: enemy.radius,
        onHit: () => enemy.applyDamage(1),
      }));
  }

  checkPlayerCollisions(player) {
    const playerPos = player.group.position;
    const playerRadius = 1.6;

    this.enemies.forEach((enemy) => {
      if (!enemy.state.alive) return;
      if (enemy.state.hitCooldown > 0) return;
      const distance = playerPos.distanceTo(enemy.group.position);
      if (distance < playerRadius + enemy.radius) {
        enemy.applyDamage(1);
      }
    });
  }

  remaining() {
    return this.enemies.filter((enemy) => enemy.state.alive).length;
  }

  clear() {
    this.enemies.forEach((enemy) => {
      this.scene.remove(enemy.group);
      disposeObject3D(enemy.group);
    });
    this.enemies = [];
  }
}
