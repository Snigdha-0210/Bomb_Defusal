import * as THREE from "three";

/* =========================================================
   ENEMY ARCHETYPES & LASER TARGETING SYSTEM
========================================================= */

const ENEMY_TYPES = {
    ASSAULT: {
        name: "Assault Guard",
        health: 100,
        speed: 1.8,
        attackSpeed: 2.8,
        damage: 12,
        fireDelay: 1.0,
        color: 0x334455,
        scale: 1.0
    },
    SCOUT: {
        name: "Scout Rusher",
        health: 70,
        speed: 2.6,
        attackSpeed: 3.5,
        damage: 8,
        fireDelay: 0.65,
        color: 0x556644,
        scale: 0.92
    },
    SNIPER: {
        name: "Marksman Sniper",
        health: 80,
        speed: 1.2,
        attackSpeed: 1.2,
        damage: 38,
        fireDelay: 2.4,
        color: 0x223344,
        scale: 1.05,
        hasLaser: true
    },
    HEAVY: {
        name: "Heavy Enforcer",
        health: 260,
        speed: 1.1,
        attackSpeed: 1.4,
        damage: 18,
        fireDelay: 0.8,
        color: 0x222222,
        scale: 1.25
    }
};

/* =========================================================
   APPLY ARCHETYPE TO ENEMY MESH
========================================================= */
function applyEnemyArchetype(enemy, typeKey = "ASSAULT", scene = null) {
    const config = ENEMY_TYPES[typeKey] || ENEMY_TYPES.ASSAULT;
    enemy.userData.archetype = typeKey;
    enemy.userData.health = config.health;
    enemy.userData.maxHealth = config.health;
    enemy.userData.speed = config.speed;
    enemy.userData.damage = config.damage;
    enemy.userData.fireMinDelay = config.fireDelay;

    // Visual scale adjustments
    enemy.scale.set(config.scale, config.scale, config.scale);

    // Apply color theme to enemy meshes
    enemy.traverse((child) => {
        if (child.isMesh && child.material && !child.userData.preserveMaterial) {
            child.material = child.material.clone();
            child.material.color.setHex(config.color);
        }
    });

    // Sniper Red Laser Sight Beam
    if (config.hasLaser && scene) {
        const laserGeom = new THREE.BufferGeometry();
        const positions = new Float32Array([0, 0, 0, 0, 0, -30]);
        laserGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

        const laserMat = new THREE.LineBasicMaterial({
            color: 0xff0022,
            transparent: true,
            opacity: 0.85,
            linewidth: 2
        });

        const laserLine = new THREE.Line(laserGeom, laserMat);
        laserLine.position.set(0.38, 1.35, -1.0);
        laserLine.visible = false;
        enemy.add(laserLine);
        enemy.userData.laserSight = laserLine;
    }
}

/* =========================================================
   UPDATE SNIPER LASER BEAM
========================================================= */
function updateSniperLaser(enemy, playerPosition) {
    if (!enemy.userData.laserSight) return;

    if (enemy.userData.state === "attack" && enemy.userData.alive) {
        enemy.userData.laserSight.visible = true;

        // Aim laser line toward player world position
        const localPlayerPos = enemy.worldToLocal(playerPosition.clone());
        const posAttr = enemy.userData.laserSight.geometry.attributes.position;
        posAttr.setXYZ(1, localPlayerPos.x, localPlayerPos.y, localPlayerPos.z);
        posAttr.needsUpdate = true;
    } else {
        enemy.userData.laserSight.visible = false;
    }
}

export {
    ENEMY_TYPES,
    applyEnemyArchetype,
    updateSniperLaser
};
