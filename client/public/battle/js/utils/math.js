export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const lerp = (a, b, t) => a + (b - a) * t;

export const damp = (value, target, lambda, dt) => {
  return lerp(value, target, 1 - Math.exp(-lambda * dt));
};

export const randRange = (min, max) => min + Math.random() * (max - min);

export const wrapAngle = (angle) => {
  let wrapped = angle;
  while (wrapped > Math.PI) wrapped -= Math.PI * 2;
  while (wrapped < -Math.PI) wrapped += Math.PI * 2;
  return wrapped;
};
