export class Input {
  constructor(target = window) {
    this.target = target;
    this.keys = new Map();
    this.justPressed = new Set();
    this._onKeyDown = this.onKeyDown.bind(this);
    this._onKeyUp = this.onKeyUp.bind(this);
    this.target.addEventListener("keydown", this._onKeyDown);
    this.target.addEventListener("keyup", this._onKeyUp);
  }

  onKeyDown(event) {
    const code = event.code;
    if (!this.keys.get(code)) {
      this.justPressed.add(code);
    }
    this.keys.set(code, true);
  }

  onKeyUp(event) {
    this.keys.set(event.code, false);
  }

  isDown(code) {
    return Boolean(this.keys.get(code));
  }

  consumePressed(code) {
    if (this.justPressed.has(code)) {
      this.justPressed.delete(code);
      return true;
    }
    return false;
  }

  clearPressed() {
    this.justPressed.clear();
  }

  getAxis() {
    const forward = this.isDown("KeyW") || this.isDown("ArrowUp");
    const backward = this.isDown("KeyS") || this.isDown("ArrowDown");
    const left = this.isDown("KeyA") || this.isDown("ArrowLeft");
    const right = this.isDown("KeyD") || this.isDown("ArrowRight");

    return {
      throttle: (forward ? 1 : 0) + (backward ? -1 : 0),
      steer: (left ? 1 : 0) + (right ? -1 : 0),
      drift: this.isDown("Space"),
    };
  }

  dispose() {
    this.target.removeEventListener("keydown", this._onKeyDown);
    this.target.removeEventListener("keyup", this._onKeyUp);
  }
}
