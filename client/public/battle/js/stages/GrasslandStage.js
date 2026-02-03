import * as THREE from "three";
import { randRange } from "../utils/math.js";

export const createGrasslandStage = () => {
  const group = new THREE.Group();

  const groundMat = new THREE.MeshStandardMaterial({ color: 0x54e08f, roughness: 0.9 });
  const pathMat = new THREE.MeshStandardMaterial({ color: 0xb2f5a1, roughness: 0.8 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.7 });

  const ground = new THREE.Mesh(new THREE.CylinderGeometry(60, 60, 2, 64), groundMat);
  ground.position.y = -1;
  ground.receiveShadow = true;

  const path = new THREE.Mesh(new THREE.CircleGeometry(30, 64), pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.y = 0.01;

  const wall = new THREE.Mesh(new THREE.TorusGeometry(45, 1.2, 16, 60), wallMat);
  wall.rotation.x = Math.PI / 2;
  wall.position.y = 0.5;

  group.add(ground, path, wall);

  const treeMat = new THREE.MeshStandardMaterial({ color: 0x2f855a, roughness: 0.9 });
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x7b4f2f, roughness: 0.8 });
  const trunkGeo = new THREE.CylinderGeometry(0.4, 0.5, 2, 8);
  const crownGeo = new THREE.SphereGeometry(1.2, 12, 10);

  for (let i = 0; i < 16; i += 1) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    const crown = new THREE.Mesh(crownGeo, treeMat);
    crown.position.y = 1.6;
    tree.add(trunk, crown);

    const angle = randRange(0, Math.PI * 2);
    const radius = randRange(36, 52);
    tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    group.add(tree);
  }

  const spawnPoints = [
    new THREE.Vector3(0, 0, 12),
    new THREE.Vector3(-8, 0, -6),
    new THREE.Vector3(10, 0, -10),
    new THREE.Vector3(-12, 0, 8),
  ];

  const itemBoxPoints = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(18, 0, 12),
    new THREE.Vector3(-16, 0, -14),
    new THREE.Vector3(24, 0, -6),
  ];

  const enemySpawns = [
    new THREE.Vector3(-10, 0, -18),
    new THREE.Vector3(16, 0, 4),
    new THREE.Vector3(6, 0, 20),
  ];

  return {
    id: "grassland",
    name: "Grassland Arena",
    group,
    spawnPoints,
    itemBoxPoints,
    enemySpawns,
    enemyStyle: "grassland",
    arenaCenter: new THREE.Vector3(0, 0, 0),
    arenaRadius: 48,
    theme: {
      background: new THREE.Color(0x7bd7ff),
      fog: new THREE.Fog(0x7bd7ff, 60, 140),
    },
  };
};
