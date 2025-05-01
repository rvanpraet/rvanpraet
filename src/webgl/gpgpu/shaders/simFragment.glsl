#define M_PI (3.1415926535897932384626433832795)

uniform float uEntropy;
uniform float uTime;
uniform sampler2D uInfo;

void main() {
  vec2 vUv = gl_FragCoord.xy / resolution.xy;

  vec3 position = texture2D(uCurrentPosition, vUv).xyz;
  vec3 velocity = texture2D(uCurrentVelocity, vUv).xyz;
  vec4 info = texture2D(uInfo, vUv);

  // if (uEntropy > 0.0) {
  //   float r = 2000.0 * info.z;
  //   velo.x = cos(uTime + info.x * M_PI * 2.0) * r * uEntropy;
  //   position.y = sin(uTime + info.x * M_PI * 2.0) * r * uEntropy;
  // }

  position += velocity;

  // position.z =

  gl_FragColor = vec4(position, 1.0);
}
