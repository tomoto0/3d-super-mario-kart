import * as THREE from "three";

const createQuestionTexture = () => {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = "#ffe24a";
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "#201a14";
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, size - 12, size - 12);

  ctx.fillStyle = "#201a14";
  ctx.font = "bold 86px 'Bungee', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("?", size / 2, size / 2 + 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
};

const QUESTION_TEXTURE = createQuestionTexture();

export class ItemBox {
  constructor(position) {
    this.group = new THREE.Group();
    this.position = position.clone();
    this.active = true;
    this.respawnTimer = 0;
    this.spin = 0;
    this.bob = 0;
    this.createMesh();
    this.group.position.copy(this.position);
  }

  createMesh() {
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      emissive: 0xffd166,
      roughness: 0.4,
    });
    const faceMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      roughness: 0.3,
      map: QUESTION_TEXTURE,
    });
    const materials = [faceMat, faceMat, baseMat, baseMat, faceMat, faceMat];

    const box = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.6, 1.6), materials);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.08, 12, 32),
      new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff1a6 })
    );
    ring.rotation.x = Math.PI / 2;

    this.group.add(box, ring);
  }

  setActive(active) {
    this.active = active;
    this.group.visible = active;
    this.group.userData.active = active;
  }

  collect() {
    if (!this.active) return;
    this.setActive(false);
    this.respawnTimer = 6.5;
  }

  update(dt) {
    if (!this.active) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        this.setActive(true);
      }
      return;
    }

    this.spin += dt * 1.8;
    this.bob += dt * 2.4;
    this.group.rotation.y = this.spin;
    this.group.position.y = this.position.y + Math.sin(this.bob) * 0.3 + 0.6;
  }
}
