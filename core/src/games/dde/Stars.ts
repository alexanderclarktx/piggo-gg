import {
  BackSide, Clock, Color, Mesh, Scene,
  ShaderMaterial, SphereGeometry, Vector3
} from "three"

export const createStarfieldSky = (scene: Scene) => {
  const skyGeo = new SphereGeometry(1000, 64, 32)
  const skyMat = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDensity: { value: 0.85 },               // overall star density
      uBrightness: { value: 1.4 },                // how bright the stars read
      uTwinkle: { value: 0.35 },               // 0 = static stars
      uHorizon: { value: new Color(0x02040a).toArray().slice(0, 3) }, // deep navy
      uZenith: { value: new Color(0x000107).toArray().slice(0, 3) }, // nearly black
      // A nice diagonal Milky Way; try different vectors
      uMWNormal: { value: new Vector3(0.0, 0.25, 1.0).normalize() },
      uMWWidth: { value: 0.07 },
      uMWStrength: { value: 0.6 },
    },
    vertexShader,
    fragmentShader,
    side: BackSide,
    depthWrite: false,
    depthTest: false,
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
    //   skyMesh.position.copy(camera.position);
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
#ifdef GL_ES
precision highp float;
#endif
#extension GL_OES_standard_derivatives : enable

uniform float uTime;
uniform float uDensity;     // 0..1 star probability gate
uniform float uBrightness;  // star brightness gain
uniform float uTwinkle;     // 0..1 twinkle amplitude
uniform vec3  uHorizon;     // base sky colors
uniform vec3  uZenith;
uniform vec3  uMWNormal;    // Milky Way great-circle normal (normalized)
uniform float uMWWidth;     // ~0.03..0.15
uniform float uMWStrength;  // 0..1

varying vec3 vWorldPosition;

const float PI = 3.1415926535897932384626433832795;

// --- tiny hash helpers (fast, repeatable) ---
float hash12(vec2 p){
  // https://www.shadertoy.com/view/4djSRW
  vec3 p3  = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx+p3.yz)*p3.zy);
}

// Signed distance for a circle in UV cell space
float circleSDF(vec2 p, vec2 c, float r){
  return length(p - c) - r;
}

// One star layer at a given cell count
// Returns RGB contribution (includes color + twinkle), scalar-weighted
vec3 starLayer(vec2 uv, float cells, float minR, float maxR, float time, float densityGate){
  // Tile space
  vec2 uvN = uv * cells;
  // Integer cell index (wrapped so seam at u=0/1 is clean)
  vec2 i  = floor(uvN);
  i = vec2(mod(i.x, cells), mod(i.y, cells));
  // Fractional position inside the cell
  vec2 f  = fract(uvN);

  // Random center and per-cell randomness
  vec2  c   = hash22(i);                 // center in [0,1]^2
  float rnd = hash12(i * 17.0 + 3.7);    // [0,1]

  // Gate by density so not every cell has a star
  if (rnd > densityGate) return vec3(0.0);

  // Random radius, bias towards more small stars
  float r = mix(minR, maxR, rnd*rnd);

  // SDF + analytic AA
  float d = circleSDF(f, c, r);
  float edge = fwidth(d) * 1.5;
  float s = 1.0 - smoothstep(0.0, edge, d); // hard circle with soft edge

  // Simple spectral tilt (cool ↔ warm)
  float temp = hash12(i * 19.19);
  vec3 starColor = mix(vec3(1.0, 0.95, 0.90), vec3(0.90, 0.95, 1.0), temp);

  // Twinkle (cell-specific rate/phase)
  float tw = 1.0 + uTwinkle * (0.5 + 0.5 * sin(time * mix(4.0, 12.0, rnd) + rnd * 6.28318));
  return starColor * s * tw;
}

void main(){
  // Direction from camera to fragment (on the inside of a big sphere)
  vec3 dir = normalize(vWorldPosition - cameraPosition);

  // Equirectangular UV from direction
  float u = atan(dir.z, dir.x) / (2.0*PI) + 0.5;  // [-pi..pi] → [0..1]
  float v = asin(clamp(dir.y, -1.0, 1.0)) / PI + 0.5; // [-pi/2..pi/2] → [0..1]
  vec2  uv = vec2(u, v);

  // Base night gradient (very dark)
  float t = clamp(dir.y*0.5 + 0.5, 0.0, 1.0);
  vec3 sky = mix(uHorizon, uZenith, pow(t, 1.6));

  // Milky Way band: great circle = dot(dir, n)=0; falloff by abs(dot)
  float band = exp(-abs(dot(dir, normalize(uMWNormal))) / max(1e-4, uMWWidth));
  // Slight grain to avoid perfectly smooth band
  float grain = hash12(floor(uv*vec2(1024.0))) * 0.6 + 0.7;
  vec3 mw = vec3(0.58, 0.66, 0.85) * band * grain * uMWStrength;

  // Stars: 4 layers at increasing density / decreasing size
  vec3 stars = vec3(0.0);
  // Tune global density into per-layer gates (sparser for big stars)
  float d0 = uDensity * 0.25; // big sparse
  float d1 = uDensity * 0.5;
  float d2 = uDensity * 0.8;
  float d3 = uDensity * 1.0;

  stars += starLayer(uv,  96.0, 0.0016, 0.0032, uTime, d0);
  stars += starLayer(uv, 192.0, 0.0012, 0.0024, uTime, d1);
  stars += starLayer(uv, 384.0, 0.0009, 0.0018, uTime, d2);
  stars += starLayer(uv, 768.0, 0.0007, 0.0012, uTime, d3);

  // Slightly boost star density where the Milky Way is (looks nice)
  stars *= (1.0 + 0.6 * clamp(band, 0.0, 1.0));

  vec3 col = sky + mw + stars * uBrightness;

  // Optional very gentle filmic-ish toe (leave tonemapping off on material)
  col = col / (1.0 + col);

  gl_FragColor = vec4(col, 1.0);
}
`