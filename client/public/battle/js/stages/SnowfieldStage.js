import * as THREE from "three";
import { randRange } from "../utils/math.js";

export const createSnowfieldStage = () => {
  const group = new THREE.Group();

  const snowMat = new THREE.MeshStandardMaterial({ color: 0xe8f6ff, roughness: 0.7 });
  const iceMat = new THREE.MeshStandardMaterial({ color: 0x8fd3ff, roughness: 0.2, metalness: 0.1 });
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x9fb0c7, roughness: 0.8 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(58, 58, 2, 64), snowMat);
  base.position.y = -1;

  const midPlate = new THREE.Mesh(new THREE.CylinderGeometry(26, 26, 3, 48), iceMat);
  midPlate.position.y = 2.5;

  const topPlate = new THREE.Mesh(new THREE.CylinderGeometry(12, 12, 3, 32), iceMat);
  topPlate.position.y = 6.5;

  const rampGeo = new THREE.BoxGeometry(8, 1.2, 18);
  const ramp1 = new THREE.Mesh(rampGeo, snowMat);
  ramp1.position.set(-16, 0.6, 8);
  ramp1.rotation.x = -0.35;

  const ramp2 = new THREE.Mesh(rampGeo, snowMat);
  ramp2.position.set(14, 0.6, -10);
  ramp2.rotation.x = 0.32;

  group.add(base, midPlate, topPlate, ramp1, ramp2);

  const rockGeo = new THREE.DodecahedronGeometry(1.6);
  for (let i = 0; i < 10; i += 1) {
    const rock = new THREE.Mesh(rockGeo, rockMat);
    const angle = randRange(0, Math.PI * 2);
    const radius = randRange(22, 46);
    rock.position.set(Math.cos(angle) * radius, 0.2, Math.sin(angle) * radius);
    group.add(rock);
  }

  const spawnPoints = [
    new THREE.Vector3(0, 0, 14),
    new THREE.Vector3(-18, 0, -8),
    new THREE.Vector3(18, 0, -12),
    new THREE.Vector3(0, 3, 0),
  ];

  const itemBoxPoints = [
    new THREE.Vector3(0, 2.6, 0),
    new THREE.Vector3(-20, 0, 10),
    new THREE.Vector3(20, 0, -6),
    new THREE.Vector3(6, 6.2, -2),
  ];

  const enemySpawns = [
    new THREE.Vector3(-14, 0, 16),
    new THREE.Vector3(16, 0, -14),
    new THREE.Vector3(0, 3, -2),
  ];

  return {
    id: "snowfield",
    name: "Snowfield Arena",
    group,
    spawnPoints,
    itemBoxPoints,
    enemySpawns,
    enemyStyle: "snowfield",
    arenaCenter: new THREE.Vector3(0, 0, 0),
    arenaRadius: 46,
    theme: {
      background: new THREE.Color(0xcce9ff),
      fog: new THREE.Fog(0xcce9ff, 70, 150),
    },
  };
};
