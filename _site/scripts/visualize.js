import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';
import * as d3 from 'd3';

// Set up the scene, camera, and renderer
console.log('Setting up scene, camera, and renderer...');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('visualizer').appendChild(renderer.domElement);

// Add controls for interaction
const controls = new OrbitControls(camera, renderer.domElement);

// Load the CSV file and parse the data
console.log('Loading and parsing CSV file...');
d3.csv('/data/points.csv').then(data => {
    console.log(data);
    // Variables to calculate the bounding box
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

    data.forEach(d => {
        // Convert string values to numbers
        d.x = +d.x;
        d.y = +d.y;
        d.z = +d.z;

        console.log(`Adding point: (${d.x}, ${d.y}, ${d.z})`); // Add this line

        // Update bounding box values
        if (d.x < minX) minX = d.x;
        if (d.y < minY) minY = d.y;
        if (d.z < minZ) minZ = d.z;
        if (d.x > maxX) maxX = d.x;
        if (d.y > maxY) maxY = d.y;
        if (d.z > maxZ) maxZ = d.z;

        // Create a sphere geometry for each point
        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const sphere = new THREE.Mesh(geometry, material);

        // Set the position of the sphere
        sphere.position.set(d.x, d.y, d.z);

        // Add the sphere to the scene
        scene.add(sphere);
    });

    // Calculate the center of the bounding box
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;

    // Calculate the size of the bounding box
    const sizeX = maxX - minX;
    const sizeY = maxY - minY;
    const sizeZ = maxZ - minZ;
    const maxSize = Math.max(sizeX, sizeY, sizeZ);

    // Set the camera position to fit all points
    camera.position.set(centerX, centerY, centerZ + maxSize * 1.5);
    camera.lookAt(new THREE.Vector3(centerX, centerY, centerZ));

    // Add a light source
    const light = new THREE.PointLight(0xffffff, 1);
    light.position.set(centerX, centerY, centerZ + maxSize * 2);
    scene.add(light);

    // Render the scene
    const animate = function () {
        requestAnimationFrame(animate);

        // Update controls
        controls.update();
        renderer.render(scene, camera);
    };

    animate();
}).catch(error => {
    console.error('Error loading or parsing CSV file:', error);
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});