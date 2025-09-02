import {
  Clock, Color, Mesh, Scene, ShaderMaterial, SphereGeometry, Vector3
} from "three"

export const createStarfieldSky = (scene: Scene) => {
  const skyGeo = new SphereGeometry(500, 60, 40)
  const skyMat = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDensity: { value: 0.02 },               // overall star density
      uBrightness: { value: 1.4 },                // how bright the stars read
      uTwinkle: { value: 0.35 },               // 0 = static stars
      uHorizon: { value: new Color(0x02040a).toArray().slice(0, 3) }, // deep navy
      uZenith: { value: new Color(0x000107).toArray().slice(0, 3) }, // nearly black
      // A nice diagonal Milky Way; try different vectors
      uMWNormal: { value: new Vector3(0.0, 0.25, 1.0).normalize() },
      uMWWidth: { value: 0.07 },
      uMWStrength: { value: 0.9 },
    },
    vertexShader,
    fragmentShader,
    side: 1,
    depthWrite: false,
    depthTest: true,
    fog: false,
    toneMapped: false,          // keep stars crisp; let the scene be tonemapped separately
    // extensions: { derivatives: true }
  })

  const skyMesh = new Mesh(skyGeo, skyMat)
  skyMesh.frustumCulled = false // always render
  scene.add(skyMesh)

  // Keep the sky centered on the camera so it behaves like a skybox
  const clock = new Clock();
  const update = () => {
    skyMat.uniforms.uTime.value = clock.getElapsedTime();
  }

  return { mesh: skyMesh, material: skyMat, update }
}

const vertexShader = /* glsl */`
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const fragmentShader = /* glsl */`
precision highp float;

uniform float uTime;
uniform float uDensity;
uniform float uBrightness;
uniform float uTwinkle;
uniform vec3  uHorizon;
uniform vec3  uZenith;

uniform vec3  uMWNormal;
uniform float uMWWidth;
uniform float uMWStrength;

varying vec3 vWorldPosition;

// ----------------- utilities -----------------
const float PI = 3.141592653589793;

float hash12(vec2 p){
  // pseuodorandom in [0,1)
  vec3 p3  = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p){
  // 2D random
  float n = hash12(p);
  float m = hash12(p + n + 19.19);
  return vec2(n, m);
}

// equirectangular map of direction to [0,1]^2
vec2 dirToUV(vec3 d){
  d = normalize(d);
  float u = atan(d.z, d.x) / (2.0*PI) + 0.5; // [-pi,pi] -> [0,1]
  float v = asin(clamp(d.y, -1.0, 1.0)) / PI + 0.5; // [-pi/2,pi/2] -> [0,1]
  return vec2(u, v);
}

// Soft circular star (anti-aliased with smoothstep only)
float starDisc(vec2 p, vec2 c, float r){
  float d = distance(p, c);
  // core then halo
  float core  = 1.0 - smoothstep(r*0.5, r, d);
  float halo  = 1.0 - smoothstep(r, r*1.8, d);
  return core + 0.35 * halo;
}

// One starfield layer; returns rgb contribution
vec3 starLayer(vec2 uv, float scale, float density, float bandBoost, float time){
  // grid in uv-space
  vec2 g      = uv * scale;
  vec2 cell   = floor(g);
  vec2 f      = fract(g);

  // whether this cell spawns a star
  float choose = hash12(cell);
  float thresh = 1.0 - clamp(density * bandBoost, 0.0, 0.995);
  float present = step(thresh, choose);

  // random center and radius inside the cell
  vec2  rnd2   = hash22(cell + 17.0);
  vec2  center = rnd2;                // random center inside the cell
  float rCell  = mix(0.10, 0.30, rnd2.x*rnd2.x); // radius in *cell* units (tiny)
  float disc   = starDisc(f, center, rCell);

  // color temperature: cool->warm
  vec3 cool = vec3(0.80, 0.90, 1.00);
  vec3 warm = vec3(1.00, 0.92, 0.85);
  vec3 tint = mix(cool, warm, hash12(cell + 3.7));

  // twinkle (per-cell frequency & phase)
  float twF   = 2.0 + 6.0 * rnd2.y;
  float twP   = 6.2831853 * rnd2.x;
  float tw    = 1.0 + uTwinkle * (0.5 * sin(time * twF + twP) + 0.5 * sin(time * (twF*0.67) + twP*1.7));

  float intensity = present * disc * tw * uBrightness;

  return tint * intensity;
}

void main(){
  // view direction
  vec3 dir = normalize(vWorldPosition);

  // vertical gradient background
  float t = smoothstep(-0.1, 0.9, dir.y);
  vec3 bg = mix(uHorizon, uZenith, t);

  // Milky Way band factor (gaussian around great-circle defined by uMWNormal)
  float invW = 1.0 / max(uMWWidth, 1e-4);
  float band = exp(-pow(abs(dot(dir, normalize(uMWNormal))) * invW, 2.0));

  // subtle milky way glow on the background
  bg += vec3(0.06, 0.07, 0.09) * band * uMWStrength;

  // convert direction to [0,1]^2 for star placement
  vec2 uv = dirToUV(dir);

  // star layers (different scales -> sizes)
  float baseDensity = clamp(uDensity, 0.0, 0.995);
  float bandBoost   = 1.0 + uMWStrength * band;

  vec3 stars = vec3(0.0);
  stars += starLayer(uv, 650.0,  baseDensity * 0.70, bandBoost, uTime); // larger, sparser
  stars += starLayer(uv, 1800.0, baseDensity * 0.45, bandBoost, uTime); // smaller, denser
  stars += starLayer(uv, 4200.0, baseDensity * 0.20, bandBoost, uTime); // tiniest specks

  // final color with a tiny bit of dithering to reduce banding
  float dither = (hash12(uv + uTime*0.123) - 0.5) * 0.003;
  vec3 color = bg + stars + dither;

  gl_FragColor = vec4(color, 1.0);
}
`;
