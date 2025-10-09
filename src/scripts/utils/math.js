export function random(a, b) {
  return a + (b - a) * Math.random()
}

export function map(val, fromMin, fromMax, toMin, toMax) {
  if (fromMin === fromMax) throw new Error('Input range cannot be zero')
  const ratio = (val - fromMin) / (fromMax - fromMin)
  return toMin + ratio * (toMax - toMin)
}
