import * as THREE from 'https://unpkg.com/three/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three/examples/jsm/controls/OrbitControls.js';

// Initialize scene, camera, renderer, and controls
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 600 / 400, 0.1, 1000); // Match the aspect ratio of the visualizer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(600, 400); // Match the size of the visualizer
document.getElementById('visualizer').appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

// Add a light source
const light = new THREE.PointLight(0xffffff, 1);
light.position.set(0, 0, 100);
scene.add(light);

// Function to parse CSV data
function parseCSV(data) {
    const rows = data.trim().split('\n').slice(1); // Skip header row
    return rows.map(row => row.split(',').map((value, index) => index < 3 ? parseFloat(value) : index < 6 ? parseInt(value) : value));
}

// Load and parse CSV file
fetch('/data/points.csv')
    .then(response => response.text())
    .then(data => {
        const points = [];
        const classes = new Set();
        const parsedData = parseCSV(data);

        let sumX = 0, sumY = 0, sumZ = 0;

        parsedData.forEach(row => {
            const [x, y, z, r, g, b, C] = row;
            classes.add(C);

            sumX += x;
            sumY += y;
            sumZ += z;

            const geometry = new THREE.SphereGeometry(0.1, 32, 32);
            const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(`rgb(${r},${g},${b})`) });
            const point = new THREE.Mesh(geometry, material);
            point.position.set(x, y, z);
            point.userData.class = C;
            scene.add(point);
            points.push(point);
        });

        // Calculate the centroid of the points
        const centerX = sumX / parsedData.length;
        const centerY = sumY / parsedData.length;
        const centerZ = sumZ / parsedData.length;

        // Set the camera position to center on the data
        camera.position.set(centerX, centerY, centerZ + 10);
        controls.target.set(centerX, centerY, centerZ);
        controls.update();

        // Create menu with checkboxes
        const menu = document.getElementById('menu');

        classes.forEach(C => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.addEventListener('change', () => {
                points.forEach(point => {
                    if (point.userData.class === C) {
                        point.visible = checkbox.checked;
                    }
                });
            });
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(C));
            menu.appendChild(label);
            menu.appendChild(document.createElement('br'));
        });

        // Render the scene
        const animate = function () {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        };

        animate();
    })
    .catch(error => {
        console.error('Error loading or parsing CSV file:', error);
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = 600 / 400; // Match the aspect ratio of the visualizer
    camera.updateProjectionMatrix();
    renderer.setSize(600, 400); // Match the size of the visualizer
});