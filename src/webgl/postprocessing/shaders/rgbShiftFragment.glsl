#define M_PI (3.1415926535897932384626433832795)

varying vec2 vUv;

uniform sampler2D tDiffuse;
uniform float amount;
uniform float angle;
uniform float entropy;

void main() {
  float offset = amount * 0.001;
  vec2 offsetVec = vec2(cos(angle), sin(angle)) * offset;
  vec2 offsetVec2 = vec2(cos(angle + M_PI * 0.25), sin(angle + M_PI * 0.25)) * offset;

  vec4 cr = texture2D(tDiffuse, vUv + offsetVec * 2.0);
  vec4 cg = texture2D(tDiffuse, vUv);
  vec4 cb = texture2D(tDiffuse, vUv - offsetVec);

  gl_FragColor = vec4(cr.r, cg.g, cb.b, 1.0);
}
