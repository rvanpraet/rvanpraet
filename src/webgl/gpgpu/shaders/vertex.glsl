#define M_PI (3.1415926535897932384626433832795)

//---------------------------------------------------------------------- CURL

vec4 permute(vec4 x) {
  return mod(x * x * 34.0 + x, 289.0);
}
float snoise(vec3 v) {
  const vec2 C = 1.0 / vec2(6, 3);
  const vec4 D = vec4(0, 0.5, 1, 2);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.x;
  vec3 x2 = x0 - i2 + C.y;
  vec3 x3 = x0 - D.yyy;
  i = mod(i, 289.0);
  vec4 p = permute(
    permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
      i.x +
      vec4(0.0, i1.x, i2.x, 1.0)
  );
  vec3 ns = 0.142857142857 * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = floor(j - 7.0 * x_) * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 sh = -step(h, vec4(0));
  vec4 a0 = b0.xzyw + (floor(b0) * 2.0 + 1.0).xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + (floor(b1) * 2.0 + 1.0).xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = inversesqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  return 0.5 + 12.0 * dot(m * m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

vec3 snoiseVec3(vec3 x) {
  return vec3(
    snoise(vec3(x) * 2.0 - 1.0),
    snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2)) * 2.0 - 1.0,
    snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4) * 2.0 - 1.0)
  );
}

vec3 curlNoise(vec3 p) {
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);

  vec3 p_x0 = snoiseVec3(p - dx);
  vec3 p_x1 = snoiseVec3(p + dx);
  vec3 p_y0 = snoiseVec3(p - dy);
  vec3 p_y1 = snoiseVec3(p + dy);
  vec3 p_z0 = snoiseVec3(p - dz);
  vec3 p_z1 = snoiseVec3(p + dz);

  float x = p_y1.z - p_y0.z - p_z1.y + p_z0.y;
  float y = p_z1.x - p_z0.x - p_x1.z + p_x0.z;
  float z = p_x1.y - p_x0.y - p_y1.x + p_y0.x;

  const float divisor = 1.0 / (2.0 * e);
  return normalize(vec3(x, y, z) * divisor);
}

float easeInCubic(float t) {
  return t * t * t;
}

float easeInOutSine(float x) {
  return -(cos(M_PI * x) - 1.0) / 2.0;
}

float easeInOutQuad(float x) {
  //x < 0.5f ? 2 * x* x : 1 - pow(-2 * x + 2,2) /2;
  float inValue = 2.0 * x * x;
  float outValue = 1.0 - pow(-2.0 * x + 2.0, 2.0) / 2.0;
  float inStep = step(inValue, 0.5) * inValue;
  float outStep = step(0.5, outValue) * outValue;

  return inStep + outStep;
}

float easeInOutQuart(float x) {
  //x < 0.5 ? 8 * x * x * x * x : 1 - pow(-2 * x + 2, 4) / 2;
  float inValue = 8.0 * x * x * x * x;
  float outValue = 1.0 - pow(-2.0 * x + 2.0, 4.0) / 2.0;
  return step(inValue, 0.5) * inValue + step(0.5, outValue) * outValue;
}

float easeInCirc(float x) {
  return 1.0 - sqrt(1.0 - pow(x, 2.0));
}

varying vec2 vUv;
varying vec3 vPosition;

uniform float uParticleSize;
uniform float uTime;
uniform sampler2D uPositionTexture;
uniform sampler2D uInfo;
uniform float uResponsiveMultiplier;
uniform float uCodingMultiplier;

void main() {
  vUv = uv;

  vec3 newpos = position;

  vec4 info = texture2D(uInfo, vUv);
  vec4 positionDT = texture2D(uPositionTexture, vUv);

  newpos.xyz = positionDT.xyz;

  newpos.y += float(snoise(info.xyz * uTime * 0.1) * 2.0 - 1.0) * 0.05 * uResponsiveMultiplier * uCodingMultiplier;

  vPosition = newpos;

  vec4 mvPosition = modelViewMatrix * vec4(newpos, 1.0);

  gl_PointSize = uParticleSize / -mvPosition.z;

  gl_Position = projectionMatrix * mvPosition;
}
