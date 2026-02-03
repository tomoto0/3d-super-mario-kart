import { createGrasslandStage } from "../stages/GrasslandStage.js";
import { createSnowfieldStage } from "../stages/SnowfieldStage.js";
import { createBowserCastleStage } from "../stages/BowserCastleStage.js";
import { disposeObject3D } from "../utils/dispose.js";

const STAGE_FACTORY = {
  grassland: createGrasslandStage,
  snowfield: createSnowfieldStage,
  bowser: createBowserCastleStage,
};

export class World {
  constructor(scene) {
    this.scene = scene;
    this.activeStage = null;
  }

  setStage(stageId) {
    if (!STAGE_FACTORY[stageId]) {
      throw new Error(`Unknown stage: ${stageId}`);
    }
    this.disposeStage();
    const stage = STAGE_FACTORY[stageId]();
    this.activeStage = stage;
    this.scene.add(stage.group);
    return stage;
  }

  update(dt) {
    if (this.activeStage && this.activeStage.update) {
      this.activeStage.update(dt);
    }
  }

  disposeStage() {
    if (!this.activeStage) return;
    this.scene.remove(this.activeStage.group);
    disposeObject3D(this.activeStage.group);
    if (this.activeStage.dispose) {
      this.activeStage.dispose();
    }
    this.activeStage = null;
  }
}
