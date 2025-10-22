varying vec2 vUv;

uniform sampler2D uVelocityTexture;
uniform sampler2D uMask;
uniform vec3 uColor;
uniform float uMinAlpha;
uniform float uMaxAlpha;

void main() {
  // Particle mask texture
  vec4 maskTexture = texture2D(uMask, gl_PointCoord);

  // Get the velocity from the velocity texture
  vec3 velocity = texture2D(uVelocityTexture, vUv).xyz * 100.0;

  // Increase alpha based on velocity magnitude
  float velocityAlpha = clamp(length(velocity.r), uMinAlpha, uMaxAlpha);

  gl_FragColor = vec4(uColor, velocityAlpha);
  gl_FragColor.a *= maskTexture.r;
}
