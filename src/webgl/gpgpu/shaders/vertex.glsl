varying vec2 vUv;
varying vec3 vPosition;

uniform float uParticleSize;
uniform sampler2D uPositionTexture;
uniform sampler2D uInfo;

void main() {
  vUv = uv;

  vec3 newpos = position;

  vec4 info = texture2D(uInfo, vUv);
  vec4 positionDT = texture2D(uPositionTexture, vUv);

  newpos.xyz = positionDT.xyz;

  vPosition = newpos;

  vec4 mvPosition = modelViewMatrix * vec4(newpos, 1.0);

  gl_PointSize = uParticleSize / -mvPosition.z;

  gl_Position = projectionMatrix * mvPosition;
}
