import * as THREE from "three";
import { randRange } from "../utils/math.js";

export const createBowserCastleStage = () => {
  const group = new THREE.Group();

  const floorMat = new THREE.MeshStandardMaterial({ color: 0x3b2d2f, roughness: 0.8 });
  const lavaMat = new THREE.MeshStandardMaterial({ color: 0xff4d2d, roughness: 0.4, emissive: 0xff3200 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x6f4b4f, roughness: 0.7 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(56, 56, 2, 64), floorMat);
  base.position.y = -1;

  const pit = new THREE.Mesh(new THREE.CylinderGeometry(18, 18, 1, 40), lavaMat);
  pit.position.y = -0.4;

  const ring = new THREE.Mesh(new THREE.TorusGeometry(30, 1.5, 16, 48), wallMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 1.2;

  const bridgeGeo = new THREE.BoxGeometry(12, 1, 6);
  const bridge1 = new THREE.Mesh(bridgeGeo, wallMat);
  bridge1.position.set(-10, 0.2, 0);
  const bridge2 = new THREE.Mesh(bridgeGeo, wallMat);
  bridge2.position.set(10, 0.2, 0);

  const pillarGeo = new THREE.CylinderGeometry(2, 2.6, 8, 10);
  for (let i = 0; i < 8; i += 1) {
    const pillar = new THREE.Mesh(pillarGeo, wallMat);
    const angle = randRange(0, Math.PI * 2);
    const radius = randRange(34, 46);
    pillar.position.set(Math.cos(angle) * radius, 3, Math.sin(angle) * radius);
    group.add(pillar);
  }

  group.add(base, pit, ring, bridge1, bridge2);

  const spawnPoints = [
    new THREE.Vector3(-12, 0, 14),
    new THREE.Vector3(14, 0, -12),
    new THREE.Vector3(0, 0, 22),
    new THREE.Vector3(0, 0, -20),
  ];

  const itemBoxPoints = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-24, 0, 6),
    new THREE.Vector3(24, 0, -8),
    new THREE.Vector3(0, 0, 26),
  ];

  const enemySpawns = [
    new THREE.Vector3(-18, 0, 12),
    new THREE.Vector3(18, 0, -10),
    new THREE.Vector3(0, 0, -24),
  ];

  return {
    id: "bowser",
    name: "Fortress Arena",
    group,
    spawnPoints,
    itemBoxPoints,
    enemySpawns,
    enemyStyle: "bowser",
    arenaCenter: new THREE.Vector3(0, 0, 0),
    arenaRadius: 44,
    theme: {
      background: new THREE.Color(0x1b1114),
      fog: new THREE.Fog(0x1b1114, 60, 130),
    },
  };
};
