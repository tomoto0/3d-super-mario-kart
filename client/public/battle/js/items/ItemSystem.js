import * as THREE from "three";
import { ItemBox } from "./ItemBox.js";
import { getRandomItem, getItemById } from "./ItemTypes.js";
import {
  BananaHazard,
  OilHazard,
  ShellProjectile,
  StarOrbit,
  RedShellProjectile,
  GreenShellShield,
} from "./ItemEntities.js";
import { disposeObject3D } from "../utils/dispose.js";

const ROULETTE_DURATION = 1.8;
const ROULETTE_STEP = 0.12;

export class ItemSystem {
  constructor(scene, hud, { getTargets, onBoost, onStar }) {
    this.scene = scene;
    this.hud = hud;
    this.getTargets = getTargets;
    this.onBoost = onBoost;
    this.onStar = onStar;

    this.itemBoxes = [];
    this.activeItems = [];
    this.currentItem = null;
    this.greenShield = null;
    this.rouletteTimer = 0;
    this.rouletteStepTimer = 0;
    this.rouletteItem = null;
  }

  setItemBoxes(points = []) {
    this.itemBoxes.forEach((box) => {
      this.scene.remove(box.group);
      disposeObject3D(box.group);
    });
    this.itemBoxes = points.map((point) => {
      const box = new ItemBox(point);
      this.scene.add(box.group);
      return box;
    });
  }

  reset() {
    this.activeItems.forEach((item) => {
      if (item.mesh) {
        this.scene.remove(item.mesh);
        disposeObject3D(item.mesh);
      }
    });
    this.activeItems = [];
    if (this.greenShield) {
      this.scene.remove(this.greenShield.mesh);
      disposeObject3D(this.greenShield.mesh);
      this.greenShield = null;
    }
    this.currentItem = null;
    this.rouletteTimer = 0;
    this.rouletteStepTimer = 0;
    this.rouletteItem = null;
    this.hud.setItem(null);
    this.hud.setRoulette(false, null);
  }

  startRoulette() {
    this.rouletteTimer = ROULETTE_DURATION;
    this.rouletteStepTimer = 0;
    this.rouletteItem = getRandomItem();
    this.hud.setRoulette(true, this.rouletteItem);
  }

  finishRoulette() {
    const selected = this.rouletteItem || getRandomItem();
    this.currentItem = selected.id;
    this.rouletteTimer = 0;
    this.rouletteStepTimer = 0;
    this.hud.setRoulette(false, selected);
    this.hud.setItem(selected);
  }

  useCurrentItem(player) {
    if (!this.currentItem) return;
    const item = getItemById(this.currentItem);
    if (!item) return;

    switch (item.id) {
      case "green_shell": {
        if (!this.greenShield) {
          this.greenShield = new GreenShellShield({ ownerId: "player", target: player.group });
          this.scene.add(this.greenShield.mesh);
        } else {
          const direction = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.heading);
          const position = player.group.position.clone().addScaledVector(direction, 2);
          position.y += 0.6;
          const shell = new ShellProjectile({ position, direction, ownerId: "player" });
          this.activeItems.push(shell);
          this.scene.add(shell.mesh);
          this.scene.remove(this.greenShield.mesh);
          disposeObject3D(this.greenShield.mesh);
          this.greenShield = null;
          this.currentItem = null;
          this.hud.setItem(null);
        }
        break;
      }
      case "red_shell": {
        const direction = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.heading);
        const position = player.group.position.clone().addScaledVector(direction, 2);
        position.y += 0.6;
        const shell = new RedShellProjectile({ position, direction, ownerId: "player" });
        this.activeItems.push(shell);
        this.scene.add(shell.mesh);
        break;
      }
      case "banana": {
        const backward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.heading);
        const position = player.group.position.clone().addScaledVector(backward, 2);
        const banana = new BananaHazard({ position, ownerId: "player" });
        this.activeItems.push(banana);
        this.scene.add(banana.mesh);
        break;
      }
      case "oil": {
        const backward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.heading);
        const position = player.group.position.clone().addScaledVector(backward, 2);
        const oil = new OilHazard({ position, ownerId: "player" });
        this.activeItems.push(oil);
        this.scene.add(oil.mesh);
        break;
      }
      case "mushroom": {
        this.onBoost?.(player);
        break;
      }
      case "star": {
        this.onStar?.(player);
        const orbit = new StarOrbit({ position: player.group.position.clone() });
        orbit.mesh.userData.followTarget = player.group;
        this.activeItems.push(orbit);
        this.scene.add(orbit.mesh);
        break;
      }
      default:
        break;
    }

    if (item.id !== "green_shell") {
      this.currentItem = null;
      this.hud.setItem(null);
    }
  }

  update(dt, player) {
    this.itemBoxes.forEach((box) => box.update(dt));
    if (this.greenShield) {
      this.greenShield.update(dt);
    }

    if (!this.currentItem && this.rouletteTimer <= 0) {
      this.checkItemPickup(player);
    }

    if (this.rouletteTimer > 0) {
      this.rouletteTimer -= dt;
      this.rouletteStepTimer -= dt;
      if (this.rouletteStepTimer <= 0) {
        this.rouletteStepTimer = ROULETTE_STEP;
        this.rouletteItem = getRandomItem();
        this.hud.setRoulette(true, this.rouletteItem);
      }
      if (this.rouletteTimer <= 0) {
        this.finishRoulette();
      }
    }

    this.updateActiveItems(dt);
  }

  checkItemPickup(player) {
    const position = player.group.position;
    for (const box of this.itemBoxes) {
      if (!box.active) continue;
      const distance = box.group.position.distanceTo(position);
      if (distance < 2.4) {
        box.collect();
        this.startRoulette();
        break;
      }
    }
  }

  updateActiveItems(dt) {
    const targets = this.getTargets();
    this.activeItems.forEach((item) => {
      if (item.updateTarget) {
        item.updateTarget(targets);
      }
      item.update(dt);
      if (item.mesh?.userData?.followTarget) {
        item.mesh.position.copy(item.mesh.userData.followTarget.position);
        item.mesh.position.y += 1.6;
      }

      if (this.greenShield && item.ownerId !== this.greenShield.ownerId) {
        const distance = item.mesh.position.distanceTo(this.greenShield.mesh.position);
        if (distance < item.radius + this.greenShield.radius) {
          item.life = 0;
          this.scene.remove(this.greenShield.mesh);
          disposeObject3D(this.greenShield.mesh);
          this.greenShield = null;
          this.currentItem = null;
          this.hud.setItem(null);
          return;
        }
      }

      if (item.radius) {
        for (const target of targets) {
          if (!item.canHit?.(target.id)) continue;
          const distance = item.mesh.position.distanceTo(target.position);
          if (distance < item.radius + target.radius) {
            target.onHit(item);
            item.life = 0;
            break;
          }
        }
      }
    });

    this.activeItems = this.activeItems.filter((item) => {
      const expired = item.isExpired ? item.isExpired() : false;
      if (!expired) return true;
      if (item.mesh) {
        this.scene.remove(item.mesh);
        disposeObject3D(item.mesh);
      }
      return false;
    });
  }
}
