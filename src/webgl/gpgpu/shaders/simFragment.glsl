uniform float uEntropy;
uniform float uTime;
uniform sampler2D uInfo;

void main() {
  vec2 vUv = gl_FragCoord.xy / resolution.xy;

  vec3 position = texture2D(uCurrentPosition, vUv).xyz;
  vec3 velocity = texture2D(uCurrentVelocity, vUv).xyz;
  vec4 info = texture2D(uInfo, vUv);

  position += velocity;

  gl_FragColor = vec4(position, 1.0);
}
