import * as THREE from "three";

export const ENEMY_STYLES = {
  grassland: {
    body: 0x3ccf7a,
    accent: 0xffe24a,
    trim: 0x2f855a,
  },
  snowfield: {
    body: 0x7dc5ff,
    accent: 0xffffff,
    trim: 0x4a88c9,
  },
  bowser: {
    body: 0x6b1f1f,
    accent: 0xff9f43,
    trim: 0x1b1114,
  },
};

export const applyEnemyDesign = (group, styleId) => {
  const style = ENEMY_STYLES[styleId] || ENEMY_STYLES.grassland;

  switch (styleId) {
    case "snowfield": {
      const capMat = new THREE.MeshStandardMaterial({ color: style.accent, roughness: 0.5 });
      const scarfMat = new THREE.MeshStandardMaterial({ color: 0xff6b6b, roughness: 0.6 });
      const iceMat = new THREE.MeshStandardMaterial({ color: style.trim, roughness: 0.2, metalness: 0.1 });

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.6, 12, 10), capMat);
      cap.scale.y = 0.6;
      cap.position.set(0, 1.55, -0.1);

      const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.08, 8, 16), scarfMat);
      scarf.rotation.x = Math.PI / 2;
      scarf.position.set(0, 1.1, 0.3);

      const finGeo = new THREE.ConeGeometry(0.15, 0.6, 8);
      const finLeft = new THREE.Mesh(finGeo, iceMat);
      finLeft.position.set(-1.0, 0.9, -0.6);
      finLeft.rotation.z = Math.PI / 2.2;
      const finRight = finLeft.clone();
      finRight.position.x = 1.0;
      finRight.rotation.z = -Math.PI / 2.2;

      group.add(cap, scarf, finLeft, finRight);
      break;
    }
    case "bowser": {
      const armorMat = new THREE.MeshStandardMaterial({ color: style.trim, roughness: 0.7, metalness: 0.2 });
      const spikeMat = new THREE.MeshStandardMaterial({ color: style.accent, roughness: 0.4, emissive: 0x331111 });

      const plate = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 1.2), armorMat);
      plate.position.set(0, 1.25, 0.6);

      const spikeGeo = new THREE.ConeGeometry(0.18, 0.6, 8);
      const positions = [-0.6, 0, 0.6];
      positions.forEach((x) => {
        const spike = new THREE.Mesh(spikeGeo, spikeMat);
        spike.position.set(x, 1.6, 0.6);
        group.add(spike);
      });

      const hornGeo = new THREE.ConeGeometry(0.12, 0.5, 6);
      const hornLeft = new THREE.Mesh(hornGeo, spikeMat);
      hornLeft.position.set(-0.7, 1.3, 1.4);
      hornLeft.rotation.x = Math.PI / 8;
      const hornRight = hornLeft.clone();
      hornRight.position.x = 0.7;

      group.add(plate, hornLeft, hornRight);
      break;
    }
    case "grassland":
    default: {
      const hatMat = new THREE.MeshStandardMaterial({ color: 0xf3c57c, roughness: 0.7 });
      const leafMat = new THREE.MeshStandardMaterial({ color: style.trim, roughness: 0.6 });

      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 14), hatMat);
      brim.position.set(0, 1.4, -0.2);

      const top = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.6, 12), hatMat);
      top.position.set(0, 1.75, -0.2);

      const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.5), leafMat);
      spoiler.position.set(0, 1.05, -1.7);
      spoiler.rotation.x = -0.2;

      group.add(brim, top, spoiler);
      break;
    }
  }
};
