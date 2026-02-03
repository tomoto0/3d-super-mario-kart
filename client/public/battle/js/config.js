export const GAME_CONFIG = {
  targetFps: 60,
  player: {
    maxSpeed: 32,
    maxReverse: -8,
    accel: 48,
    brake: 58,
    drag: 6,
    turnRate: 2.2,
    driftTurnBoost: 1.4,
    driftDrag: 4,
    driftBoost: 6,
  },
  camera: {
    height: 9.5,
    distance: -14,
    stiffness: 5.5,
    lookHeight: 2.2,
  },
  balloons: {
    startCount: 3,
    bobSpeed: 2.2,
    bobHeight: 0.35,
  },
};

export const STAGE_LIST = [
  { id: "grassland", name: "Grassland Arena" },
  { id: "snowfield", name: "Snowfield Arena" },
  { id: "bowser", name: "Fortress Arena" },
];
