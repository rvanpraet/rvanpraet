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

uniform sampler2D uOriginalPosition;
uniform sampler2D uTarget;
uniform sampler2D uInfo;
uniform vec3 uMouse;
uniform float uMouseSpeed;
uniform float uForce;
uniform float uTime;
uniform float uEntropy;

void main() {
  vec2 vUv = gl_FragCoord.xy / resolution.xy;

  vec3 position = texture2D(uCurrentPosition, vUv).xyz;
  vec3 original = texture2D(uOriginalPosition, vUv).xyz;
  vec3 velocity = texture2D(uCurrentVelocity, vUv).xyz;
  vec3 target = texture2D(uTarget, vUv).xyz;
  vec4 info = texture2D(uInfo, vUv);

  float speedMod = info.y * 0.01;
  float newForce = uForce + uEntropy * 50.0 + speedMod;
  velocity *= newForce; // Velocity relaxation

  // Curl noise
  vec3 noise = curlNoise(position) * 0.002;
  vec3 transitionNoise = curlNoise(vec3(position.x * 1.0, position.y * 10.0, position.z * 5.0) * info.w) * 0.005;

  if (uEntropy > 0.0) {
    float rVar = 0.3 + info.z * 0.7;
    float r = 500.0 * rVar;
    // position.x = cos(uTime + info.x * M_PI * 2.0) * r * uEntropy;
    // position.y = sin(uTime + info.x * M_PI * 2.0) * r * uEntropy;

    float entropy = clamp(uEntropy, 0.5 * 0.01, 1.0 * 0.01);

    target.x = cos(uTime + info.x * M_PI * 2.0) * r * entropy;
    target.y = sin(uTime + info.x * M_PI * 2.0) * r * entropy;
    target.z = (info.z * 2.0 - 1.0) * entropy;
  }

  // Particle attraction to shape force
  vec3 direction = normalize(target - position);
  float dist = length(target - position);

  // // Linear attraction
  // velocity.x += sin(uTime * 1.2 + info.x * M_PI * 2.0) * dist * 0.005; // Adds extra wiggle
  // vec3 attraction = direction * dist * 0.01 + transitionNoise * dist;
  // velocity += attraction; // Force that pushes particles towards their current target

  // Exponential or eased attraction
  float maxDist = 2.0; // adjust to fit your system
  float normDist = clamp(dist / maxDist, 0.0, 1.0); // normalize dist to 0–1

  float falloff = easeInOutSine(normDist); // get easing-based force

  velocity.x += cos(uTime * 1.2 + info.x * M_PI * 2.0) * falloff * 0.025; // Adds extra wiggle

  vec3 attraction =
    (direction * falloff * 0.05 + transitionNoise * clamp(falloff, 0.005, 1.0) * 3.5) * step(0.001, dist);
  velocity += attraction; // Force that pushes particles towards their current target

  // Mouse repel force
  float mouseDistance = distance(position, uMouse);
  float maxDistance = 0.75;

  if (mouseDistance < maxDistance) {
    vec3 pushDirection = normalize(position - uMouse);
    velocity += (pushDirection * (1.0 - mouseDistance / maxDistance) * 0.035 + noise) * uMouseSpeed;
  }

  // velocity += curlNoise( position ) * 0.001;

  gl_FragColor = vec4(velocity, 1.0);
}
