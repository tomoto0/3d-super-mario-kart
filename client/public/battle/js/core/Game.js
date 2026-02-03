import * as THREE from "three";
import { Input } from "./Input.js";
import { World } from "./World.js";
import { Kart } from "../entities/Kart.js";
import { BalloonRig } from "../entities/BalloonRig.js";
import { Hud } from "../ui/Hud.js";
import { ItemSystem } from "../items/ItemSystem.js";
import { EnemySystem } from "../systems/EnemySystem.js";
import { GAME_CONFIG } from "../config.js";
import { damp } from "../utils/math.js";

export class Game {
  constructor({ canvas, hudRoot }) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = false;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 500);
    this.camera.position.set(0, 8, 16);

    this.clock = new THREE.Clock();
    this.input = new Input(window);
    this.world = new World(this.scene);
    this.hud = new Hud(hudRoot);
    this.enemies = new EnemySystem(this.scene);

    this.player = new Kart({ color: 0xff4d6d });
    this.balloons = new BalloonRig();
    this.player.group.add(this.balloons.group);

    this.scene.add(this.player.group);

    this.playerState = {
      balloons: GAME_CONFIG.balloons.startCount,
      invincibleTimer: 0,
      boostTimer: 0,
    };

    this.itemSystem = new ItemSystem(this.scene, this.hud, {
      getTargets: () => this.getTargets(),
      onBoost: (player) => this.applyBoost(player),
      onStar: (player) => this.applyStar(player),
    });

    this.cameraOffset = new THREE.Vector3(0, GAME_CONFIG.camera.height, GAME_CONFIG.camera.distance);
    this.cameraOffsetVec = new THREE.Vector3();
    this.cameraTarget = new THREE.Vector3();
    this.cameraPosition = new THREE.Vector3();
    this.cameraLook = new THREE.Vector3();
    this.cameraLookOffset = new THREE.Vector3(0, GAME_CONFIG.camera.lookHeight, 0);
    this.yAxis = new THREE.Vector3(0, 1, 0);
    this.baseStatus = "Battle Ready";
    this.statusTimer = 0;

    this.running = false;
    this.stageId = "grassland";
    this.loop = this.loop.bind(this);

    this.setupLights();
    this.resize();
  }

  setupLights() {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
    keyLight.position.set(20, 30, 10);
    const rimLight = new THREE.DirectionalLight(0xffe0b0, 0.4);
    rimLight.position.set(-20, 18, -12);

    this.scene.add(ambient, keyLight, rimLight);
  }

  applyStageTheme(theme) {
    if (!theme) return;
    if (theme.background) {
      this.scene.background = theme.background;
    }
    if (theme.fog) {
      this.scene.fog = theme.fog;
    }
  }

  start(stageId, { practice = false } = {}) {
    this.stageId = stageId;
    this.itemSystem.reset();
    const stage = this.world.setStage(stageId);
    this.applyStageTheme(stage.theme);
    this.itemSystem.setItemBoxes(stage.itemBoxPoints || []);
    this.enemies.setup(stage);

    const spawn = stage.spawnPoints?.[0] || new THREE.Vector3(0, 0, 10);
    this.player.reset(spawn, 0);
    this.playerState.balloons = GAME_CONFIG.balloons.startCount;
    this.balloons.setCount(this.playerState.balloons);
    this.playerState.invincibleTimer = 0;
    this.playerState.boostTimer = 0;
    this.hud.setItem(null);

    this.baseStatus = practice ? "Practice Ride" : "Battle Ready";
    this.hud.show();
    this.hud.setStatus(practice ? "Practice Ride" : "Battle Start");

    this.running = true;
    this.clock.start();
    requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    this.world.disposeStage();
    this.itemSystem.reset();
    this.enemies.clear();
  }

  loop() {
    if (!this.running) return;
    const dt = Math.min(this.clock.getDelta(), 1 / GAME_CONFIG.targetFps);

    this.player.update(dt, this.input);
    this.balloons.update(dt);
    this.itemSystem.update(dt, this.player);
    this.enemies.update(dt, this.player);
    this.world.update(dt);
    this.enemies.checkPlayerCollisions(this.player);
    this.updateStatus(dt);
    this.updateCamera(dt);

    if (this.input.consumePressed("KeyJ")) {
      this.itemSystem.useCurrentItem(this.player);
    }

    this.hud.update({
      balloons: this.balloons.count,
      speed: this.player.speed,
    });

    this.checkWinCondition();

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.loop);
  }

  updateCamera(dt) {
    this.cameraOffsetVec.copy(this.cameraOffset).applyAxisAngle(this.yAxis, this.player.heading);
    this.cameraTarget.copy(this.player.group.position).add(this.cameraOffsetVec);

    this.cameraPosition.set(
      damp(this.camera.position.x, this.cameraTarget.x, GAME_CONFIG.camera.stiffness, dt),
      damp(this.camera.position.y, this.cameraTarget.y, GAME_CONFIG.camera.stiffness, dt),
      damp(this.camera.position.z, this.cameraTarget.z, GAME_CONFIG.camera.stiffness, dt),
    );

    this.camera.position.copy(this.cameraPosition);
    this.cameraLook.copy(this.player.group.position).add(this.cameraLookOffset);
    this.camera.lookAt(this.cameraLook);
  }

  resize() {
    const { clientWidth, clientHeight } = this.canvas;
    const width = clientWidth || window.innerWidth;
    const height = clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  updateStatus(dt) {
    if (this.playerState.invincibleTimer > 0) {
      this.playerState.invincibleTimer = Math.max(0, this.playerState.invincibleTimer - dt);
    }
    if (this.statusTimer > 0) {
      this.statusTimer = Math.max(0, this.statusTimer - dt);
      if (this.statusTimer <= 0) {
        this.hud.setStatus(this.baseStatus);
      }
    }
  }

  applyBoost(player) {
    player.applyBoost(1.8, 10);
    this.setTemporaryStatus("Mushroom Dash!", 1.2);
  }

  applyStar(player) {
    this.playerState.invincibleTimer = 4.5;
    this.setTemporaryStatus("Star Power!", 2.4);
  }

  applyDamage(amount) {
    if (this.playerState.invincibleTimer > 0) return;
    this.playerState.balloons = Math.max(0, this.playerState.balloons - amount);
    this.balloons.setCount(this.playerState.balloons);
    this.setTemporaryStatus("Balloon Popped!", 1.1);
    if (this.playerState.balloons <= 0) {
      this.hud.setStatus("Lose");
      this.running = false;
    }
  }

  setTemporaryStatus(text, duration) {
    this.hud.setStatus(text);
    this.statusTimer = duration;
  }

  getTargets() {
    const enemyTargets = this.enemies.getTargets();
    return [
      {
        id: "player",
        position: this.player.group.position,
        radius: 1.6,
        onHit: () => this.applyDamage(1),
      },
      ...enemyTargets,
    ];
  }

  checkWinCondition() {
    if (!this.running) return;
    if (this.enemies.remaining() <= 0) {
      this.hud.setStatus("Win");
      this.running = false;
    }
  }
}
