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
precision highp float;

uniform float uTime;
varying vec3 vWorldPosition;

const float PI = 3.141592653589793;

// --- simple hash function for repeatable randomness ---
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  // direction from camera to fragment (on inside of sphere)
  vec3 dir = normalize(vWorldPosition - cameraPosition);

  // equirectangular UV from direction
  float u = atan(dir.z, dir.x) / (2.0*PI) + 0.5;
  float v = asin(clamp(dir.y, -1.0, 1.0)) / PI + 0.5;
  vec2 uv = vec2(u, v);

  // scale up to a grid (controls star density)
  vec2 grid = floor(uv * 200.0);   // 200x200 grid of possible stars
  float rnd = hash(grid);

  // only some cells contain stars
  float star = step(0.995, rnd);   // about 0.5% of cells become stars

  // brightness: fade edges with fwidth for AA
  float brightness = star;

  vec3 color = vec3(0.0);
  color += vec3(brightness);

  gl_FragColor = vec4(color, 1.0);
}
`