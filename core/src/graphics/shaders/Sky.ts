import {
  Clock, Color, Mesh, ShaderMaterial, SphereGeometry
} from "three"

type Sky = { mesh: Mesh, material: ShaderMaterial, update: () => void }

export const Sky = (): Sky => {
  const geo = new SphereGeometry(500, 60, 40)

  const material = new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uDensity: { value: 0.0015 },
      uBrightness: { value: 0.9 },
      uHorizon: { value: new Color(0x000044).toArray().slice(0, 3) },
      uZenith: { value: new Color(0x000000).toArray().slice(0, 3) },
      uCloudDensity: { value: 1.0 }, // 0 = no clouds, 1 = overcast
      uCloudSpeed: { value: 0.1 },  // movement speed
    },
    vertexShader,
    fragmentShader,
    side: 1,
    depthWrite: false,
    depthTest: true,
    fog: false,
    toneMapped: true
  })

  const mesh = new Mesh(geo, material)
  mesh.frustumCulled = false

  const clock = new Clock()
  const update = () => {
    material.uniforms.uTime.value = clock.getElapsedTime()
  }

  return { mesh, material, update }
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
uniform vec3  uHorizon;
uniform vec3  uZenith;
uniform float uCloudDensity;
uniform float uCloudSpeed;

float uHour = 12.0;

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
vec2 octaProject(vec3 v){
  v = normalize(v);
  v /= (abs(v.x) + abs(v.y) + abs(v.z));
  vec2 uv = v.xz;
  if (v.y < 0.0) uv = (1.0 - abs(uv.yx)) * sign(uv);
  return uv * 0.5 + 0.5;
}
vec3 octaUnproject(vec2 e){
  e = e * 2.0 - 1.0;
  vec3 v = vec3(e.x, 1.0 - abs(e.x) - abs(e.y), e.y);
  float t = clamp(-v.y, 0.0, 1.0);
  v.x += v.x >= 0.0 ? -t :  t;
  v.z += v.z >= 0.0 ? -t :  t;
  return normalize(v);
}

// -------------------- SDF disc --------------------
float starDiscAngular(vec3 dir, vec3 centerDir, float r){
  float ang = acos(clamp(dot(dir, centerDir), -1.0, 1.0));
  float core = 1.0 - smoothstep(r*0.55, r, ang);
  float halo = 1.0 - smoothstep(r, r*1.9, ang);
  return core + 0.35 * halo;
}

// -------------------- star stamp --------------------
vec3 stampStar(vec3 dir, vec3 cDir, float baseR, float colorSeed){
  vec3 cool = vec3(0.8, 0.7, 1.00);
  vec3 warm = vec3(1.00, 1, 0.6);

  float t = smoothstep(0.15, 0.85, colorSeed);
  vec3 tint = mix(cool, warm, t);

  float m = starDiscAngular(dir, cDir, baseR);
  return tint * (m * uBrightness);
}

// -------------------- starfield --------------------
mat2 rot(float a){ float s=sin(a), c=cos(a); return mat2(c,-s,s,c); }

vec3 starLayers(vec3 dir, vec2 uv){
  vec3 acc = vec3(0.0);

  const int R = 1;
  for (int layer = 0; layer < 3; ++layer){
    float scale   = (layer==0) ? 420.0 : (layer==1) ? 1111.0 : 2777.0;
    float densMul = (layer==0) ? 0.55 : (layer==1) ? 0.35   : 0.18;
    float radius  = (layer==0) ? 0.0040: (layer==1)? 0.0024 : 0.0016;

    vec2 uvr = (layer==0) ? (uv * rot(0.32)) :
               (layer==1) ? (uv * rot(1.13)) :
                            (uv * rot(2.07));

    vec2 g = uvr * scale;
    vec2 c0 = floor(g);

    for (int j = -R; j <= R; ++j){
      for (int i = -R; i <= R; ++i){
        vec2 cell = c0 + vec2(float(i), float(j));

        float selSeed = hash12(cell + float(layer)*17.0);
        float threshold = 1.0 - clamp(uDensity * densMul, 0.0, 0.995);
        if (selSeed < threshold) continue;

        // independent seeds
        float colorSeed   = hash12(cell + 113.0 + float(layer)*7.0);
        float sizeSeed    = hash12(cell + 91.0  + float(layer)*5.0);

        vec2 r2 = hash22(cell + 7.0);
        vec2 centerUV = (cell + r2) / scale;
        centerUV = (layer==0) ? (centerUV * rot(-0.32)) :
                   (layer==1) ? (centerUV * rot(-1.13)) :
                                (centerUV * rot(-2.07));

        vec3 cDir = octaUnproject(fract(centerUV));
        float r = radius * mix(0.7, 1.8, sizeSeed);

        acc += stampStar(dir, cDir, r, colorSeed);
      }
    }
  }
  return acc;
}

// -------------------- simple noise from hash12 --------------------
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  // corners
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) +
         (c - a) * u.y * (1.0 - u.x) +
         (d - b) * u.x * u.y;
}

// fractal noise (fbm)
float fbm(vec2 p) {
  float f = 0.0;
  f += 0.5   * noise(p);   p *= 2.02;
  f += 0.25  * noise(p);   p *= 2.03;
  f += 0.125 * noise(p);
  return f;
}

void main(){
  vec3 dir = normalize(vWorldPosition - cameraPosition);

  // Horizon → Zenith gradient
  float t = smoothstep(-0.1, 0.9, dir.y);
  vec3 bg = mix(uHorizon, uZenith, t);

  // ---------------- day/night blending ----------------
  // Define "day" between 6h and 18h
  float dayFactor = smoothstep(5.0, 8.0, uHour) * (1.0 - smoothstep(17.0, 20.0, uHour));
  vec3 daySky = vec3(0.4, 0.7, 1.0); // light blue

  bg = mix(bg, daySky, dayFactor);

  
  // project dir onto XZ plane for clouds
  vec2 cloudUV = normalize(dir).xz * 0.5;
  cloudUV += uTime * uCloudSpeed;

  // sample cloud fbm
  float c = fbm(cloudUV * 4.0);
  c = pow(c, 2.0);
  float clouds = smoothstep(0.2, 0.5, c);

  // blend clouds on top (white tinted)
  vec3 cloudColor = mix(vec3(1.0), daySky, 0.2);
  bg = mix(bg, cloudColor, clouds * clouds * uCloudDensity * dayFactor);

  // stars (your existing starLayers + octaProject)
  vec2 uv = octaProject(dir);
  vec3 stars = starLayers(dir, uv);
  stars *= (1.0 - dayFactor);

  // dither using hash12
  float dither = (hash12(uv + uTime*0.123) - 0.5) * 0.003;
  vec3 color = bg + stars + dither;

  gl_FragColor = vec4(color, 1.0);
}

// void main(){
//   vec3 dir = normalize(vWorldPosition - cameraPosition);

//   float t = smoothstep(-0.1, 0.9, dir.y);
//   vec3 bg = mix(uHorizon, uZenith, t);

//   vec2 uv = octaProject(dir);
//   vec3 stars = starLayers(dir, uv);

//   float dither = (hash12(uv + uTime*0.123) - 0.5) * 0.003;
//   vec3 color = bg + stars + dither;

//   gl_FragColor = vec4(color, 1.0);
// }
`;
