import * as THREE from 'three';
import * as PIXI from 'pixi.js';

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// PixiJS setup
const pixiApp = new PIXI.Application({ width: 512, height: 512, backgroundColor: 0x1099bb });
const pixiCanvas = pixiApp.view; // The canvas element PixiJS renders to

// Add a rotating square in PixiJS
const square = new PIXI.Graphics();
square.beginFill(0xff0000);
square.drawRect(-50, -50, 100, 100);
square.endFill();
square.x = 256; // Center in PixiJS canvas
square.y = 256;
pixiApp.stage.addChild(square);

// Create a Three.js texture from the PixiJS canvas
const pixiTexture = new THREE.CanvasTexture(pixiCanvas);
pixiTexture.needsUpdate = true; // Ensure texture updates each frame

// Create a plane in Three.js to display the PixiJS render
const geometry = new THREE.PlaneGeometry(5, 5);
const material = new THREE.MeshBasicMaterial({ map: pixiTexture, side: THREE.DoubleSide });
const plane = new THREE.Mesh(geometry, material);
scene.add(plane);

camera.position.z = 5;

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update PixiJS (rotate the square)
    square.rotation += 0.02;
    pixiApp.renderer.render(pixiApp.stage); // Render PixiJS scene
    pixiTexture.needsUpdate = true; // Tell Three.js the texture changed

    // Update Three.js (rotate the plane)
    plane.rotation.x += 0.01;
    plane.rotation.y += 0.01;

    renderer.render(scene, camera);
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
