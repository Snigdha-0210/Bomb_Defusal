import * as THREE from "three";
import { playPickupSound } from "./audioSystem.js";

/* =========================================================
   TACTICAL PICKUPS & LOOT SYSTEM
========================================================= */

let sceneRef = null;
const activePickups = [];

function initPickups(scene) {
    sceneRef = scene;
}

/* =========================================================
   SPAWN DROP ON ENEMY DEATH
========================================================= */
function spawnEnemyDrop(position) {
    if (!sceneRef) return;

    // 50% chance for Health, 50% for Ammo
    const isHealth = Math.random() > 0.5;
    const dropType = isHealth ? "health" : "ammo";
    const color = isHealth ? 0x00ff88 : 0xffcc00;

    const group = new THREE.Group();
    group.position.copy(position);
    group.position.y = 0.5;

    // Box Mesh
    const boxGeom = new THREE.BoxGeometry(0.35, 0.25, 0.35);
    const boxMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.6,
        roughness: 0.3,
        metalness: 0.8
    });
    const boxMesh = new THREE.Mesh(boxGeom, boxMat);
    group.add(boxMesh);

    // Glowing Light Beacon
    const light = new THREE.PointLight(color, 2.5, 4);
    group.add(light);

    sceneRef.add(group);

    activePickups.push({
        group,
        type: dropType,
        spawnTime: Date.now(),
        initialY: 0.5
    });
}

/* =========================================================
   UPDATE & CHECK PICKUP PROXIMITY
========================================================= */
function updatePickups(delta, playerPosition, onCollectCallback) {
    const now = Date.now();

    for (let i = activePickups.length - 1; i >= 0; i--) {
        const item = activePickups[i];

        // Animate spin & float bob
        item.group.rotation.y += delta * 2.2;
        const bob = Math.sin((now - item.spawnTime) * 0.004) * 0.12;
        item.group.position.y = item.initialY + bob;

        // Distance Check
        const dist = item.group.position.distanceTo(playerPosition);
        if (dist < 1.8) {
            // Collect item
            playPickupSound(item.type === "health");
            if (onCollectCallback) {
                onCollectCallback(item.type);
            }

            // Remove from scene
            sceneRef.remove(item.group);
            activePickups.splice(i, 1);
        }
    }
}

function clearAllPickups() {
    if (!sceneRef) return;
    activePickups.forEach(item => {
        sceneRef.remove(item.group);
    });
    activePickups.length = 0;
}

export {
    initPickups,
    spawnEnemyDrop,
    updatePickups,
    clearAllPickups
};
