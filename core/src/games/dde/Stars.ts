import {
  Clock, Color, Mesh, Scene, ShaderMaterial, SphereGeometry, Vector3
} from "three"

export const createStarfieldSky = (scene: Scene) => {
  const skyGeo = new SphereGeometry(500, 60, 40)
  const skyMat = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDensity: { value: 0.002 },               // overall star density
      uBrightness: { value: 0.8 },                // how bright the stars read
      uTwinkle: { value: 0.15 },               // 0 = static stars
      // uHorizon: { value: new Color(0x02040a).toArray().slice(0, 3) }, // deep navy
      uHorizon: { value: new Color(0x02046a).toArray().slice(0, 3) }, // deep navy
      uZenith: { value: new Color(0x000147).toArray().slice(0, 3) }, // nearly black

      uMWNormal: { value: new Vector3(0, 1, 1).normalize() },
      uMWWidth: { value: 0.2 },
      uMWStrength: { value: 3 },
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
uniform float uDensity;     // 0..1
uniform float uBrightness;  // overall star brightness
uniform float uTwinkle;     // 0 = static
uniform vec3  uHorizon;
uniform vec3  uZenith;

uniform vec3  uMWNormal;    // Milky Way great-circle normal
uniform float uMWWidth;     // angular width
uniform float uMWStrength;  // band strength

varying vec3 vWorldPosition;

const float PI = 3.141592653589793;

// -------------------- hash utils --------------------
float hash12(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p){
  float n = hash12(p);
  float m = hash12(p + 19.19);
  return vec2(n, m);
}

// -------------------- octahedral mapping --------------------
// Less distortion than equirectangular for distributing points.
vec2 octaProject(vec3 v){
  v = normalize(v);
  v /= (abs(v.x) + abs(v.y) + abs(v.z));
  vec2 uv = v.xz;
  if (v.y < 0.0) uv = (1.0 - abs(uv.yx)) * sign(uv);
  return uv * 0.5 + 0.5; // [0,1]^2
}
vec3 octaUnproject(vec2 e){
  e = e * 2.0 - 1.0;
  vec3 v = vec3(e.x, 1.0 - abs(e.x) - abs(e.y), e.y);
  float t = clamp(-v.y, 0.0, 1.0);
  v.x += v.x >= 0.0 ? -t :  t;
  v.z += v.z >= 0.0 ? -t :  t;
  return normalize(v);
}

// -------------------- SDF disc on the sphere --------------------
// Use true angular distance for perfectly round stars.
float starDiscAngular(vec3 dir, vec3 centerDir, float r){
  float ang = acos(clamp(dot(dir, centerDir), -1.0, 1.0)); // radians
  float core = 1.0 - smoothstep(r*0.55, r, ang);
  float halo = 1.0 - smoothstep(r, r*1.9, ang);
  return core + 0.35 * halo;
}

// Single star stamp (SDF circle) with tint and twinkle
vec3 stampStar(vec3 dir, vec3 cDir, float baseR, float seed){
  // per-star color temperature
  vec3 cool = vec3(0.82, 0.92, 1.00);
  vec3 warm = vec3(1.00, 0.93, 0.86);
  vec3 tint = mix(cool, warm, seed);

  // twinkle
  float f = 2.0 + 7.0 * fract(seed * 13.7);
  float ph = 6.2831853 * fract(seed * 5.3);
  float tw = 1.0 + uTwinkle * (0.5 * sin(uTime * f + ph) + 0.5 * sin(uTime * (f*0.63) + ph*1.7));

  float m = starDiscAngular(dir, cDir, baseR);
  return cool * (m * tw * uBrightness);
}

// -------------------- starfield --------------------
// We place SDF circles using octahedral UV, but avoid visible grid artifacts by:
//  - using octa mapping (no pole streaking)
//  - sampling only a tiny 3x3 neighborhood per scale (cheap)
//  - layering multiple incommensurate scales and slight rotations
// This keeps stars fixed in space while remaining efficient.
mat2 rot(float a){ float s=sin(a), c=cos(a); return mat2(c,-s,s,c); }

vec3 starLayers(vec3 dir, vec2 uv){
  vec3 acc = vec3(0.0);

  // Milky Way boosts local density near the band
  float band = exp(-pow(abs(dot(dir, normalize(uMWNormal))) / max(uMWWidth, 1e-4), 2.0));
  float bandBoost = 1.0 + uMWStrength * band;

  // Three layers: big (sparse), medium, tiny (dense)
  // Scales chosen irrational-ish and rotated to kill repetition.
  const int R = 1; // neighborhood radius (3x3)
  for (int layer = 0; layer < 3; ++layer){
    float scale   = (layer==0) ? 420.0 : (layer==1) ? 1111.0 : 2777.0;
    float densMul = (layer==0) ? 0.55 : (layer==1) ? 0.35   : 0.18;
    float radius  = (layer==0) ? 0.0040: (layer==1)? 0.0024 : 0.0016; // in radians

    vec2 uvr = (layer==0) ? (uv * rot(0.32)) :
               (layer==1) ? (uv * rot(1.13)) :
                            (uv * rot(2.07));

    vec2 g = uvr * scale;           // into tile space
    vec2 c0 = floor(g);

    // check a tiny neighborhood; at most a few stars light up
    for (int j = -R; j <= R; ++j){
      for (int i = -R; i <= R; ++i){
        vec2 cell = c0 + vec2(float(i), float(j));
        // decide if this tile spawns a star
        float h = hash12(cell + float(layer)*17.0);
        float threshold = 1.0 - clamp(uDensity * densMul * bandBoost, 0.0, 0.995);
        float present = step(threshold, h);
        if (present < 0.5) continue;

        // random center in this tile + slight per-layer jitter
        vec2 r2 = hash22(cell + 7.0);
        vec2 centerUV = (cell + r2) / scale;
        // undo layer rotation
        centerUV = (layer==0) ? (centerUV * rot(-0.32)) :
                   (layer==1) ? (centerUV * rot(-1.13)) :
                                (centerUV * rot(-2.07));

        // center direction on the sphere
        vec3 cDir = octaUnproject(fract(centerUV));

        // slight per-star size variance
        float r = radius * mix(0.7, 1.1, hash12(cell + 91.0));

        // boost density/brightness if THIS STAR lies near MW band
        float starBand = exp(-pow(abs(dot(cDir, normalize(uMWNormal))) / max(uMWWidth, 1e-4), 2.0));
        float boost = 1.0 + uMWStrength * starBand;

        acc += stampStar(dir, cDir, r, h) * boost;
      }
    }
  }

  return acc;
}

void main(){
  vec3 dir = normalize(vWorldPosition - cameraPosition);

  // Background vertical gradient
  float t = smoothstep(-0.1, 0.9, dir.y);
  vec3 bg = mix(uHorizon, uZenith, t);

  // Soft Milky Way glow on background
  float band = exp(-pow(abs(dot(dir, normalize(uMWNormal))) / max(uMWWidth, 1e-4), 2.0));
  bg += vec3(0.08, 0.03, 0.15) * band * uMWStrength;

  // Stars via true angular SDF discs
  vec2 uv = octaProject(dir);
  vec3 stars = starLayers(dir, uv);

  // tiny dithering to reduce gradient banding
  float dither = (hash12(uv + uTime*0.123) - 0.5) * 0.003;
  vec3 color = bg + stars + dither;

  gl_FragColor = vec4(color, 1.0);
}
`;
