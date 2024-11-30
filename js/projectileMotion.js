const canvas = document.getElementById('projectileCanvas');
const ctx = canvas.getContext('2d');

function simulate() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Get input values
    const velocity = parseFloat(document.getElementById('velocity').value);
    const angle = parseFloat(document.getElementById('angle').value);
    const height = parseFloat(document.getElementById('height').value);

    // Convert angle to radians
    const angleRad = (angle * Math.PI) / 180;

    // Constants
    const g = 9.81; // gravitational acceleration (m/s²)
    const timeInterval = 0.02; // time step for simulation

    // Calculate motion parameters
    const vx = velocity * Math.cos(angleRad); // horizontal velocity
    const vy = velocity * Math.sin(angleRad); // initial vertical velocity
    const totalTime = (vy + Math.sqrt(vy ** 2 + 2 * g * height)) / g; // total flight time
    const range = vx * totalTime; // horizontal range

    // Scale to fit canvas
    const scaleX = canvas.width / range;
    const scaleY = canvas.height / (Math.max(height, (vy ** 2) / (2 * g)) * 1.1);

    // Draw the trajectory
    let t = 0;
    let previousX = 0;
    let previousY = canvas.height - height * scaleY;

    ctx.beginPath();
    ctx.moveTo(previousX, previousY);

    while (t <= totalTime) {
        const x = vx * t;
        const y = height + vy * t - 0.5 * g * t ** 2;

        const canvasX = x * scaleX;
        const canvasY = canvas.height - y * scaleY;

        ctx.lineTo(canvasX, canvasY);

        previousX = canvasX;
        previousY = canvasY;

        t += timeInterval;
    }

    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Display information
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Range: ${range.toFixed(2)} m`, 10, 20);
    ctx.fillText(`Total Time: ${totalTime.toFixed(2)} s`, 10, 40);
}

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';

function visualize3D() {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI / 2;
    scene.add(ground);

    // Create projectile trajectory
    const points = [];
    const velocity = 50;
    const angleRad = Math.PI / 4;
    const g = 9.81;
    for (let t = 0; t < 5; t += 0.1) {
        const x = velocity * Math.cos(angleRad) * t;
        const y = velocity * Math.sin(angleRad) * t - 0.5 * g * t ** 2;
        points.push(new THREE.Vector3(x, y, 0));
        if (y < 0) break;
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const curveGeometry = new THREE.TubeGeometry(curve, 100, 0.1, 8, false);
    const curveMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const tube = new THREE.Mesh(curveGeometry, curveMaterial);
    scene.add(tube);

    camera.position.z = 30;
    camera.position.y = 20;

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }

    animate();
}
visualize3D();

