import {
  Clock, Color, Mesh, Scene, ShaderMaterial, SphereGeometry, Vector3
} from "three"

export const createStarfieldSky = (scene: Scene) => {
  const skyGeo = new SphereGeometry(500, 60, 40)
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
varying vec3 vWorldPosition;

const float PI = 3.141592653589793;

// --- simple hash function for repeatable randomness ---
float hash3(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1,0.2,0.3));
  p += dot(p, p.yzx + 19.19);
  return fract(p.x * p.y * p.z);
}

vec2 hash2(vec3 p) {
  return vec2(hash3(p+1.0), hash3(p+2.0));
}

void main() {
  vec3 dir = normalize(vWorldPosition - cameraPosition);

  // Quantize into a 2D grid on sphere direction (XZ for simplicity)
  vec2 uv = normalize(dir.xz);
  vec2 cell = floor(uv * 64.0);      // controls density
  float rnd = hash3(vec3(cell, 0.0));

  // Gate: only some cells have stars
  if (rnd < 0.995) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // Random offset inside cell
  vec2 jitter = hash2(vec3(cell, 1.0));
  vec2 f = fract(uv * 64.0) - jitter;

  // Distance from star center
  float d = length(f);
  float radius = 0.02; // star size
  float edge = 0.005;  // softness
  float shape = 1.0 - smoothstep(radius - edge, radius + edge, d);

  // Color tint
  float tint = hash3(vec3(cell, 2.0));
  vec3 warm = vec3(1.0, 0.92, 0.78);
  vec3 cool = vec3(0.78, 0.90, 1.0);
  vec3 starColor = mix(warm, cool, tint);

  gl_FragColor = vec4(starColor * shape, 1.0);
}
`