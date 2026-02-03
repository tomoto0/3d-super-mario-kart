import { disposeObject3D } from "../utils/dispose.js";

export class MemoryManager {
  constructor() {
    this.tracked = new Set();
  }

  track(object) {
    if (!object) return;
    this.tracked.add(object);
  }

  release(object) {
    if (!object) return;
    this.tracked.delete(object);
  }

  flush() {
    this.tracked.forEach((object) => disposeObject3D(object));
    this.tracked.clear();
  }
}
