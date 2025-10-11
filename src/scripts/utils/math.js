export function random(a, b) {
  return a + (b - a) * Math.random()
}

export function map(val, fromMin, fromMax, toMin, toMax) {
  if (fromMin === fromMax) throw new Error('Input range cannot be zero')
  const ratio = (val - fromMin) / (fromMax - fromMin)
  return toMin + ratio * (toMax - toMin)
}

/**
 * @param {number} t
 * @returns {number} Returns a bell shaped ramp curve from 0 to 1 to 0 when t goes from 0 to 1
 */
export function ramp(t) {
  return 1 - 4 * (t - 0.5) ** 2
}

/**
 * @param {number} t
 * @returns {number} Returns a triangle shaped ramp from 0 to 1 to 0 when t goes from 0 to 1
 */
export function triangleRamp(t) {
  return 1 - Math.abs(2 * t - 1)
}
