import * as THREE from "three";

/* =========================================================
   VISUAL EFFECTS & PARTICLE WEATHER ENGINE
========================================================= */

let sceneRef = null;
let cameraRef = null;

// Particle pools
const activeSparks = [];
const activeSmoke = [];

// Screen Shake State
let screenShakeIntensity = 0;
const originalCameraOffset = new THREE.Vector3();

// Weather Systems
let rainParticles = null;
let rainGeometry = null;
let isRaining = false;
let lightningLight = null;
let nextLightningTime = 0;

// Red Alert Lighting
let redAlertLights = [];
let redAlertAngle = 0;
let isRedAlert = false;

/* =========================================================
   INITIALIZATION
========================================================= */
function initVisualEffects(scene, camera) {
    sceneRef = scene;
    cameraRef = camera;

    // Lightning Flash PointLight
    lightningLight = new THREE.PointLight(0xddeeff, 0, 250);
    lightningLight.position.set(0, 45, 0);
    scene.add(lightningLight);

    // Create Rain Particle System (Preallocated)
    const rainCount = 1800;
    rainGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);
    const velocities = new Float32Array(rainCount);

    for (let i = 0; i < rainCount; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 120;
        positions[i * 3 + 1] = Math.random() * 40;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 120;
        velocities[i] = 25 + Math.random() * 20;
    }

    rainGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    rainGeometry.userData = { velocities };

    const rainMaterial = new THREE.PointsMaterial({
        color: 0x88bbdd,
        size: 0.18,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
    });

    rainParticles = new THREE.Points(rainGeometry, rainMaterial);
    rainParticles.visible = false;
    scene.add(rainParticles);
}

/* =========================================================
   BULLET IMPACT SPARKS & DEBRIS
========================================================= */
function createImpactSparks(point, normal, isMetal = false) {
    if (!sceneRef) return;

    const sparkCount = isMetal ? 14 : 8;
    const sparkColor = isMetal ? 0xffea78 : 0xffa347;

    for (let i = 0; i < sparkCount; i++) {
        const sparkGeom = new THREE.SphereGeometry(0.025, 4, 4);
        const sparkMat = new THREE.MeshBasicMaterial({
            color: sparkColor,
            transparent: true,
            opacity: 1
        });
        const spark = new THREE.Mesh(sparkGeom, sparkMat);
        spark.position.copy(point);

        // Velocity biased in normal direction
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 4 + (normal ? normal.x * 3 : 0),
            Math.random() * 4 + 1 + (normal ? normal.y * 3 : 0),
            (Math.random() - 0.5) * 4 + (normal ? normal.z * 3 : 0)
        );

        sceneRef.add(spark);
        activeSparks.push({
            mesh: spark,
            velocity,
            life: 0.35 + Math.random() * 0.25,
            maxLife: 0.6
        });
    }
}

/* =========================================================
   BLOOD / HOSTILE HIT SPLATTER
========================================================= */
function createHitBlood(point) {
    if (!sceneRef) return;

    for (let i = 0; i < 7; i++) {
        const bloodGeom = new THREE.SphereGeometry(0.04, 4, 4);
        const bloodMat = new THREE.MeshBasicMaterial({
            color: 0x990000,
            transparent: true,
            opacity: 0.95
        });
        const blood = new THREE.Mesh(bloodGeom, bloodMat);
        blood.position.copy(point);

        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 3,
            Math.random() * 2 + 0.5,
            (Math.random() - 0.5) * 3
        );

        sceneRef.add(blood);
        activeSparks.push({
            mesh: blood,
            velocity,
            life: 0.3,
            maxLife: 0.3
        });
    }
}

/* =========================================================
   MUZZLE SMOKE PUFF
========================================================= */
function createMuzzleSmoke(origin, direction) {
    if (!sceneRef) return;

    const smokeGeom = new THREE.SphereGeometry(0.06, 6, 6);
    const smokeMat = new THREE.MeshBasicMaterial({
        color: 0x778899,
        transparent: true,
        opacity: 0.45
    });

    const smoke = new THREE.Mesh(smokeGeom, smokeMat);
    smoke.position.copy(origin);

    const velocity = direction.clone().multiplyScalar(1.5);
    velocity.y += 0.3;

    sceneRef.add(smoke);
    activeSmoke.push({
        mesh: smoke,
        velocity,
        life: 0.45,
        maxLife: 0.45
    });
}

/* =========================================================
   SCREEN SHAKE TRIGGER
========================================================= */
function triggerScreenShake(intensity = 0.3) {
    screenShakeIntensity = Math.min(screenShakeIntensity + intensity, 0.8);
}

/* =========================================================
   WEATHER & MOOD CONTROLLER
========================================================= */
function setWeatherMood(mood = "nocturnal") {
    if (!sceneRef) return;

    if (mood === "rain") {
        isRaining = true;
        isRedAlert = false;
        if (rainParticles) rainParticles.visible = true;
        sceneRef.fog.color.setHex(0x060e1a);
        sceneRef.fog.density = 0.02;
    } else if (mood === "crimson") {
        isRaining = false;
        isRedAlert = true;
        if (rainParticles) rainParticles.visible = false;
        sceneRef.fog.color.setHex(0x1a0505);

        // Spawn rotating red alert beacon lights if not present
        if (redAlertLights.length === 0) {
            const l1 = new THREE.PointLight(0xff1122, 6, 35);
            l1.position.set(0, 8, 0);
            sceneRef.add(l1);
            redAlertLights.push(l1);
        }
    } else {
        // Default Nocturnal Fog
        isRaining = false;
        isRedAlert = false;
        if (rainParticles) rainParticles.visible = false;
        sceneRef.fog.color.setHex(0x0b1424);
        if (lightningLight) lightningLight.intensity = 0;
    }
}

/* =========================================================
   UPDATE VISUAL EFFECTS LOOP
========================================================= */
function updateVisualEffects(delta, camera) {
    // 1. Update Sparks
    for (let i = activeSparks.length - 1; i >= 0; i--) {
        const s = activeSparks[i];
        s.life -= delta;
        if (s.life <= 0) {
            sceneRef.remove(s.mesh);
            s.mesh.geometry.dispose();
            s.mesh.material.dispose();
            activeSparks.splice(i, 1);
            continue;
        }

        s.velocity.y -= 9.8 * delta; // Gravity
        s.mesh.position.addScaledVector(s.velocity, delta);
        s.mesh.material.opacity = s.life / s.maxLife;
    }

    // 2. Update Smoke
    for (let i = activeSmoke.length - 1; i >= 0; i--) {
        const sm = activeSmoke[i];
        sm.life -= delta;
        if (sm.life <= 0) {
            sceneRef.remove(sm.mesh);
            sm.mesh.geometry.dispose();
            sm.mesh.material.dispose();
            activeSmoke.splice(i, 1);
            continue;
        }

        sm.mesh.position.addScaledVector(sm.velocity, delta);
        sm.mesh.scale.addScalar(delta * 1.8);
        sm.mesh.material.opacity = (sm.life / sm.maxLife) * 0.4;
    }

    // 3. Screen Shake Decay & Application
    if (screenShakeIntensity > 0.005 && camera) {
        const shakeX = (Math.random() - 0.5) * screenShakeIntensity * 0.25;
        const shakeY = (Math.random() - 0.5) * screenShakeIntensity * 0.25;
        camera.position.x += shakeX;
        camera.position.y += shakeY;
        screenShakeIntensity -= delta * 1.6;
    } else {
        screenShakeIntensity = 0;
    }

    // 4. Rain & Thunder Update
    if (isRaining && rainGeometry && camera) {
        const pos = rainGeometry.attributes.position.array;
        const vels = rainGeometry.userData.velocities;
        const count = pos.length / 3;

        for (let i = 0; i < count; i++) {
            pos[i * 3 + 1] -= vels[i] * delta;
            if (pos[i * 3 + 1] < 0) {
                pos[i * 3 + 1] = 35 + Math.random() * 5;
                pos[i * 3 + 0] = camera.position.x + (Math.random() - 0.5) * 80;
                pos[i * 3 + 2] = camera.position.z + (Math.random() - 0.5) * 80;
            }
        }
        rainGeometry.attributes.position.needsUpdate = true;

        // Thunder Flash Random Timer
        if (Date.now() > nextLightningTime) {
            if (lightningLight) {
                lightningLight.intensity = 18 + Math.random() * 15;
                setTimeout(() => {
                    if (lightningLight) lightningLight.intensity = 0;
                }, 90);
                setTimeout(() => {
                    if (lightningLight) lightningLight.intensity = 12;
                    setTimeout(() => {
                        if (lightningLight) lightningLight.intensity = 0;
                    }, 60);
                }, 160);
            }
            nextLightningTime = Date.now() + 6000 + Math.random() * 12000;
        }
    }

    // 5. Red Alert Beacon Rotation
    if (isRedAlert && redAlertLights.length > 0) {
        redAlertAngle += delta * 3.5;
        redAlertLights[0].position.x = Math.sin(redAlertAngle) * 18;
        redAlertLights[0].position.z = Math.cos(redAlertAngle) * 18;
        redAlertLights[0].intensity = 4 + Math.sin(redAlertAngle * 2) * 3;
    }
}

export {
    initVisualEffects,
    createImpactSparks,
    createHitBlood,
    createMuzzleSmoke,
    triggerScreenShake,
    setWeatherMood,
    updateVisualEffects
};
