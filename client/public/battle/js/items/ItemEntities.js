import * as THREE from "three";

export class ShellProjectile {
  constructor({ position, direction, ownerId }) {
    this.ownerId = ownerId;
    this.radius = 1.0;
    this.speed = 36;
    this.life = 4.5;
    this.graceTimer = 0.4;

    const shellMat = new THREE.MeshStandardMaterial({ color: 0x57d66f, roughness: 0.4 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 12), shellMat);
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.12, 10, 18), stripeMat);
    stripe.rotation.x = Math.PI / 2;
    this.mesh = new THREE.Group();
    this.mesh.add(core, stripe);
    this.mesh.position.copy(position);

    this.direction = direction.clone().normalize();
    this.spin = 0;
  }

  update(dt) {
    this.life -= dt;
    this.graceTimer = Math.max(0, this.graceTimer - dt);
    this.mesh.position.addScaledVector(this.direction, this.speed * dt);
    this.spin += dt * 6;
    this.mesh.rotation.y = this.spin;
  }

  isExpired() {
    return this.life <= 0;
  }

  canHit(targetId) {
    return this.graceTimer <= 0 || targetId !== this.ownerId;
  }
}

export class GreenShellShield {
  constructor({ ownerId, target }) {
    this.ownerId = ownerId;
    this.radius = 1.0;
    this.orbitRadius = 1.7;
    this.angle = 0;
    this.target = target;

    const shellMat = new THREE.MeshStandardMaterial({ color: 0x57d66f, roughness: 0.4 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 12), shellMat);
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.12, 10, 18), stripeMat);
    stripe.rotation.x = Math.PI / 2;
    this.mesh = new THREE.Group();
    this.mesh.add(core, stripe);
  }

  update(dt) {
    if (!this.target) return;
    this.angle += dt * 2.4;
    this.mesh.position.copy(this.target.position);
    this.mesh.position.x += Math.cos(this.angle) * this.orbitRadius;
    this.mesh.position.z += Math.sin(this.angle) * this.orbitRadius;
    this.mesh.position.y += 0.9;
    this.mesh.rotation.y = this.angle + Math.PI / 2;
  }
}

export class RedShellProjectile {
  constructor({ position, direction, ownerId }) {
    this.ownerId = ownerId;
    this.radius = 1.0;
    this.speed = 34;
    this.life = 5.2;
    this.graceTimer = 0.4;
    this.turnRate = 3.2;
    this.targetId = null;
    this.targetPosition = new THREE.Vector3();
    this.desired = new THREE.Vector3();

    const shellMat = new THREE.MeshStandardMaterial({ color: 0xff4d6d, roughness: 0.4 });
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 12), shellMat);
    const stripe = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.12, 10, 18), stripeMat);
    stripe.rotation.x = Math.PI / 2;
    this.mesh = new THREE.Group();
    this.mesh.add(core, stripe);
    this.mesh.position.copy(position);

    this.direction = direction.clone().normalize();
    this.spin = 0;
  }

  updateTarget(targets) {
    if (!targets || targets.length === 0) return;
    if (this.targetId) {
      const locked = targets.find((target) => target.id === this.targetId);
      if (locked) {
        this.targetPosition.copy(locked.position);
        return;
      }
    }

    let nearest = null;
    let nearestDist = Infinity;
    targets.forEach((target) => {
      if (target.id === this.ownerId) return;
      const distance = target.position.distanceTo(this.mesh.position);
      if (distance < nearestDist) {
        nearestDist = distance;
        nearest = target;
      }
    });

    if (nearest) {
      this.targetId = nearest.id;
      this.targetPosition.copy(nearest.position);
    }
  }

  update(dt) {
    this.life -= dt;
    this.graceTimer = Math.max(0, this.graceTimer - dt);

    if (this.targetId) {
      this.desired.subVectors(this.targetPosition, this.mesh.position).normalize();
      const turnStrength = Math.min(this.turnRate * dt, 1);
      this.direction.lerp(this.desired, turnStrength).normalize();
    }

    this.mesh.position.addScaledVector(this.direction, this.speed * dt);
    this.spin += dt * 7.2;
    this.mesh.rotation.y = this.spin;
  }

  isExpired() {
    return this.life <= 0;
  }

  canHit(targetId) {
    return this.graceTimer <= 0 || targetId !== this.ownerId;
  }
}

export class BananaHazard {
  constructor({ position, ownerId }) {
    this.ownerId = ownerId;
    this.radius = 1.1;
    this.life = 12;
    this.graceTimer = 0.6;

    const baseMat = new THREE.MeshStandardMaterial({ color: 0xffe24a, roughness: 0.6 });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x7a5523, roughness: 0.8 });
    const base = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 10), baseMat);
    base.scale.set(1, 0.7, 1);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.4, 8), stemMat);
    stem.position.y = 0.6;

    this.mesh = new THREE.Group();
    this.mesh.add(base, stem);
    this.mesh.position.copy(position);
  }

  update(dt) {
    this.life -= dt;
    this.graceTimer = Math.max(0, this.graceTimer - dt);
  }

  isExpired() {
    return this.life <= 0;
  }

  canHit(targetId) {
    return this.graceTimer <= 0 || targetId !== this.ownerId;
  }
}

export class OilHazard {
  constructor({ position, ownerId }) {
    this.ownerId = ownerId;
    this.radius = 1.6;
    this.life = 10;
    this.graceTimer = 0.6;

    const puddleMat = new THREE.MeshStandardMaterial({ color: 0x2f2723, roughness: 0.9 });
    const puddle = new THREE.Mesh(new THREE.CircleGeometry(1.3, 18), puddleMat);
    puddle.rotation.x = -Math.PI / 2;

    this.mesh = new THREE.Group();
    this.mesh.add(puddle);
    this.mesh.position.copy(position);
  }

  update(dt) {
    this.life -= dt;
    this.graceTimer = Math.max(0, this.graceTimer - dt);
  }

  isExpired() {
    return this.life <= 0;
  }

  canHit(targetId) {
    return this.graceTimer <= 0 || targetId !== this.ownerId;
  }
}

export class StarOrbit {
  constructor({ position }) {
    this.life = 4.5;

    const starMat = new THREE.MeshStandardMaterial({ color: 0xffd93d, emissive: 0xffd93d });
    const starGeo = new THREE.OctahedronGeometry(0.35);
    this.mesh = new THREE.Group();

    for (let i = 0; i < 5; i += 1) {
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.set(Math.cos((i / 5) * Math.PI * 2) * 1.2, 0.6, Math.sin((i / 5) * Math.PI * 2) * 1.2);
      this.mesh.add(star);
    }

    this.mesh.position.copy(position);
    this.spin = 0;
  }

  update(dt) {
    this.life -= dt;
    this.spin += dt * 2.8;
    this.mesh.rotation.y = this.spin;
  }

  isExpired() {
    return this.life <= 0;
  }
}
