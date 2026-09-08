/*
================================================================
 BOMB DEFUSAL GAME — COMBAT ENHANCEMENT SYSTEM
================================================================

THIS FILE IS AN ADD-ON.

THE ORIGINAL main.js REMAINS THE FOUNDATION.

It preserves:
- original village
- original houses
- original roads
- original trees
- original rifle
- original hands
- original movement
- original shooting
- original score
- original bomb
- original HUD
- original enemies

This system adds:
- scattered enemies
- armed enemies
- enemy vision
- enemy hearing
- enemy investigation
- enemy attack
- enemy search
- enemy reload
- enemy muzzle flash
- enemy identification
- enemy warning
- player health
- player death
- E bomb interaction
- intelligent wire puzzle
================================================================
*/

import * as THREE from "three";

import {
    scene,
    camera,
    controls,
    enemies,
    bomb,
    bombIndicator,
    bombLight,
    objectiveText,
    statusText,
    scoreText,
    levelText
} from "./main.js";


/* ================================================================
   MASTER FLAG
================================================================ */

window.__enhancedEnemyAI = true;


/* ================================================================
   GAME CONFIGURATION
================================================================ */

const CONFIG = {

    player: {

        maxHealth: 100

    },

    enemy: {

        detectionRange: 36,

        fieldOfView: 58,

        hearingRange: 40,

        attackRange: 30,

        preferredDistance: 15,

        minimumDistance: 8,

        patrolSpeed: 1.7,

        investigateSpeed: 2.4,

        attackSpeed: 2.8,

        fireMinDelay: 0.9,

        fireMaxDelay: 1.35,

        magazineSize: 8,

        reloadTime: 2.1,

        damageClose: 20,

        damageMedium: 12,

        damageFar: 7

    },

    bomb: {

        interactionDistance: 4.8

    }

};


/* ================================================================
   PLAYER STATE
================================================================ */

let playerHealth =
    CONFIG.player.maxHealth;

let playerDead =
    false;

let gamePaused =
    false;


/* ================================================================
   THREAT STATE
================================================================ */

let currentThreat =
    null;

let threatTimer =
    0;


/* ================================================================
   BOMB STATE
================================================================ */

let bombUIOpen =
    false;

let bombSolved =
    false;

let bombOverlay =
    null;

let bombPuzzle =
    null;


/* ================================================================
   ENEMY NUMBER
================================================================ */

let enemyNumber =
    0;


/* ================================================================
   SCATTERED ENEMY POSITIONS
================================================================ */

const ENEMY_SPAWNS = [

    {
        x: -35,
        z: -8
    },

    {
        x: 35,
        z: -12
    },

    {
        x: -35,
        z: -30
    },

    {
        x: 35,
        z: -32
    },

    {
        x: -27,
        z: -53
    },

    {
        x: 28,
        z: -53
    }

];


/* ================================================================
   HUD
================================================================ */

const combatHUD =
    document.createElement(
        "div"
    );

combatHUD.style.cssText = `
position:fixed;
inset:0;
pointer-events:none;
z-index:80;
font-family:Arial,Helvetica,sans-serif;
`;

document.body.appendChild(
    combatHUD
);


/* ================================================================
   HEALTH HUD
================================================================ */

const healthPanel =
    document.createElement(
        "div"
    );

healthPanel.style.cssText = `
position:absolute;
left:32px;
bottom:58px;
width:255px;
padding:10px 12px;
background:rgba(0,0,0,.65);
border:1px solid rgba(255,255,255,.15);
border-radius:8px;
box-sizing:border-box;
`;

healthPanel.innerHTML = `

<div
style="
font-size:11px;
font-weight:bold;
letter-spacing:1px;
color:#dce7ef;
margin-bottom:6px;
">
OPERATOR HEALTH
</div>

<div
style="
height:14px;
background:rgba(255,255,255,.12);
border-radius:4px;
overflow:hidden;
">

<div
id="enhanced-health-fill"
style="
width:100%;
height:100%;
background:#32d74b;
transition:width .15s;
">
</div>

</div>

<div
id="enhanced-health-number"
style="
margin-top:5px;
color:white;
font-size:12px;
font-weight:bold;
">
100 / 100 HP
</div>

`;

combatHUD.appendChild(
    healthPanel
);


const healthFill =
    healthPanel.querySelector(
        "#enhanced-health-fill"
    );


const healthNumber =
    healthPanel.querySelector(
        "#enhanced-health-number"
    );


/* ================================================================
   THREAT WARNING
================================================================ */

const threatWarning =
    document.createElement(
        "div"
    );

threatWarning.style.cssText = `
position:absolute;
left:50%;
top:70px;
transform:translateX(-50%);
padding:12px 24px;
background:rgba(125,0,0,.93);
border:1px solid rgba(255,70,70,.9);
border-radius:8px;
color:white;
font-size:17px;
font-weight:bold;
letter-spacing:1px;
opacity:0;
transition:opacity .12s;
white-space:nowrap;
`;

combatHUD.appendChild(
    threatWarning
);


/* ================================================================
   DIRECTION ARROW
================================================================ */

const threatArrow =
    document.createElement(
        "div"
    );

threatArrow.style.cssText = `
position:absolute;
left:50%;
top:125px;
width:0;
height:0;
border-left:11px solid transparent;
border-right:11px solid transparent;
border-bottom:18px solid #ff3838;
filter:drop-shadow(0 0 6px rgba(255,0,0,.8));
opacity:0;
`;

combatHUD.appendChild(
    threatArrow
);


/* ================================================================
   DAMAGE FLASH
================================================================ */

const damageFlash =
    document.createElement(
        "div"
    );

damageFlash.style.cssText = `
position:fixed;
inset:0;
pointer-events:none;
background:
radial-gradient(
circle,
transparent 40%,
rgba(255,0,0,.42) 100%
);
opacity:0;
transition:opacity .1s;
z-index:90;
`;

document.body.appendChild(
    damageFlash
);


/* ================================================================
   BOMB PROMPT
================================================================ */

const bombPrompt =
    document.createElement(
        "div"
    );

bombPrompt.style.cssText = `
position:absolute;
left:50%;
top:61%;
transform:translate(-50%,-50%);
padding:13px 25px;
background:rgba(0,0,0,.85);
border:1px solid rgba(255,50,50,.9);
border-radius:8px;
color:white;
font-size:15px;
font-weight:bold;
opacity:0;
transition:opacity .15s;
`;

combatHUD.appendChild(
    bombPrompt
);


/* ================================================================
   UPDATE HEALTH HUD
================================================================ */

function updateHealthHUD() {

    const percentage =
        THREE.MathUtils.clamp(
            playerHealth /
            CONFIG.player.maxHealth,
            0,
            1
        );


    healthFill.style.width =
        `${percentage * 100}%`;


    if (
        percentage <= 0.25
    ) {

        healthFill.style.background =
            "#ff453a";

    }

    else if (
        percentage <= 0.5
    ) {

        healthFill.style.background =
            "#ffcc00";

    }

    else {

        healthFill.style.background =
            "#32d74b";

    }


    healthNumber.textContent =
        `${Math.max(
            0,
            Math.ceil(playerHealth)
        )} / ${CONFIG.player.maxHealth} HP`;

}


/* ================================================================
   PLAYER DAMAGE
================================================================ */

function damagePlayer(
    amount,
    enemy
) {

    if (
        playerDead ||
        gamePaused
    ) {

        return;

    }


    playerHealth -=
        amount;


    if (
        enemy
    ) {

        showThreat(
            enemy,
            "ENEMY FIRING"
        );

    }


    damageFlash.style.opacity =
        "1";


    setTimeout(
        () => {

            damageFlash.style.opacity =
                "0";

        },
        130
    );


    updateHealthHUD();


    if (
        playerHealth <= 0
    ) {

        killPlayer(
            enemy
        );

    }

}


/* ================================================================
   PLAYER DEATH
================================================================ */

function killPlayer(
    enemy
) {

    if (
        playerDead
    ) {

        return;

    }


    playerDead =
        true;

    gamePaused =
        true;


    controls.unlock();


    const screen =
        document.createElement(
            "div"
        );


    screen.style.cssText = `
position:fixed;
inset:0;
z-index:200;
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
background:rgba(0,0,0,.94);
color:white;
font-family:Arial,Helvetica,sans-serif;
`;


    const title =
        document.createElement(
            "div"
        );


    title.textContent =
        "YOU DIED";


    title.style.cssText = `
font-size:60px;
font-weight:900;
color:#ff453a;
letter-spacing:2px;
margin-bottom:12px;
`;


    screen.appendChild(
        title
    );


    const reason =
        document.createElement(
            "div"
        );


    reason.textContent =
        enemy
            ? `Eliminated by ENEMY ${enemy.userData.enemyId}`
            : "You were eliminated.";


    reason.style.cssText = `
font-size:17px;
color:#b8c3cc;
margin-bottom:28px;
`;


    screen.appendChild(
        reason
    );


    const restart =
        document.createElement(
            "button"
        );


    restart.textContent =
        "RESTART LEVEL";


    restart.style.cssText = `
padding:13px 30px;
border:0;
border-radius:7px;
background:white;
color:#111;
font-size:15px;
font-weight:bold;
cursor:pointer;
`;


    restart.onclick =
        () => {

            location.reload();

        };


    screen.appendChild(
        restart
    );


    document.body.appendChild(
        screen
    );

}


/* ================================================================
   ENEMY ALERT MARKER
================================================================ */

function createEnemyMarker(
    id
) {

    const canvas =
        document.createElement(
            "canvas"
        );


    canvas.width =
        600;

    canvas.height =
        160;


    const ctx =
        canvas.getContext(
            "2d"
        );


    ctx.fillStyle =
        "rgba(130,0,0,.95)";


    ctx.beginPath();


    ctx.roundRect(
        5,
        5,
        590,
        150,
        25
    );


    ctx.fill();


    ctx.fillStyle =
        "white";


    ctx.font =
        "bold 100px Arial";


    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "middle";


    ctx.fillText(
        "!",
        65,
        80
    );


    ctx.font =
        "bold 44px Arial";


    ctx.fillText(
        `ENEMY ${id}`,
        350,
        80
    );


    const texture =
        new THREE.CanvasTexture(
            canvas
        );


    texture.colorSpace =
        THREE.SRGBColorSpace;


    const material =
        new THREE.SpriteMaterial(
            {
                map:
                    texture,

                transparent:
                    true,

                depthTest:
                    false,

                depthWrite:
                    false
            }
        );


    const sprite =
        new THREE.Sprite(
            material
        );


    sprite.scale.set(
        3.4,
        .91,
        1
    );


    sprite.position.y =
        4;


    sprite.visible =
        false;


    return sprite;

}


/* ================================================================
   ENEMY GUN
================================================================ */

function addEnemyGun(
    enemy
) {

    const gun =
        new THREE.Group();


    const metal =
        new THREE.MeshStandardMaterial(
            {
                color:
                    0x17191b,

                metalness:
                    .85,

                roughness:
                    .28
            }
        );


    const dark =
        new THREE.MeshStandardMaterial(
            {
                color:
                    0x090b0d,

                metalness:
                    .5,

                roughness:
                    .5
            }
        );


    const wood =
        new THREE.MeshStandardMaterial(
            {
                color:
                    0x40271b,

                roughness:
                    .9
            }
        );


    const receiver =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .28,
                .24,
                .95
            ),
            metal
        );


    receiver.position.z =
        -.32;


    gun.add(
        receiver
    );


    const handguard =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .22,
                .20,
                .75
            ),
            dark
        );


    handguard.position.z =
        -1;


    gun.add(
        handguard
    );


    const barrel =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                .045,
                .045,
                .85,
                8
            ),
            dark
        );


    barrel.rotation.x =
        Math.PI / 2;


    barrel.position.z =
        -1.65;


    gun.add(
        barrel
    );


    const stock =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .23,
                .2,
                .55
            ),
            wood
        );


    stock.position.z =
        .45;


    gun.add(
        stock
    );


    const magazine =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                .18,
                .45,
                .28
            ),
            dark
        );


    magazine.position.set(
        0,
        -.32,
        -.15
    );


    magazine.rotation.x =
        -.18;


    gun.add(
        magazine
    );


    gun.position.set(
        .43,
        1.55,
        -.28
    );


    gun.rotation.x =
        -.18;


    enemy.add(
        gun
    );


    const flash =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                .13,
                8,
                8
            ),
            new THREE.MeshBasicMaterial(
                {
                    color:
                        0xffb62d
                }
            )
        );


    flash.position.z =
        -2.1;


    flash.visible =
        false;


    gun.add(
        flash
    );


    const light =
        new THREE.PointLight(
            0xffa020,
            0,
            5
        );


    light.position.z =
        -2.1;


    gun.add(
        light
    );


    enemy.userData.enemyGun =
        gun;


    enemy.userData.enemyFlash =
        flash;


    enemy.userData.enemyLight =
        light;

}


/* ================================================================
   INITIALIZE ENEMIES
================================================================ */

for (
    let i = 0;
    i < enemies.length;
    i++
) {

    const enemy =
        enemies[i];


    const spawn =
        ENEMY_SPAWNS[
        i %
        ENEMY_SPAWNS.length
        ];


    enemy.position.set(
        spawn.x,
        0,
        spawn.z
    );


    enemyNumber++;


    const oldData =
        enemy.userData ||
        {};


    enemy.userData = {

        ...oldData,

        enhanced:
            true,

        enemyId:
            enemyNumber,

        health:
            100,

        alive:
            true,

        state:
            "patrol",

        speed:
            CONFIG.enemy.patrolSpeed +
            Math.random() * .45,

        direction:
            Math.random() *
            Math.PI *
            2,

        turnTimer:
            2 +
            Math.random() * 3,

        lastKnown:
            enemy.position.clone(),

        investigateTarget:
            enemy.position.clone(),

        investigateTimer:
            0,

        searchTimer:
            0,

        spotted:
            false,

        alertTimer:
            0,

        ammo:
            CONFIG.enemy.magazineSize,

        reloadTimer:
            0,

        fireTimer:
            .5 +
            Math.random(),

        strafeDirection:
            Math.random() > .5
                ? 1
                : -1,

        strafeTimer:
            1 +
            Math.random() * 2

    };


    enemy.traverse(
        child => {

            if (
                child.isMesh
            ) {

                child.userData.enemy =
                    enemy;

            }

        }
    );


    addEnemyGun(
        enemy
    );


    const marker =
        createEnemyMarker(
            enemyNumber
        );


    enemy.add(
        marker
    );


    enemy.userData.marker =
        marker;

}


/* ================================================================
   HOUSE COLLISION FOR ENEMIES
================================================================ */

function enemyBlocked(
    x,
    z
) {

    for (
        const house of houseCollisions
    ) {

        const padding =
            .65;


        if (

            x >
            house.x -
            house.width / 2 -
            padding &&

            x <
            house.x +
            house.width / 2 +
            padding &&

            z >
            house.z -
            house.depth / 2 -
            padding &&

            z <
            house.z +
            house.depth / 2 +
            padding

        ) {

            return true;

        }

    }


    return false;

}


/* ================================================================
   MOVE ENEMY
================================================================ */

function moveEnemy(
    enemy,
    target,
    speed,
    delta
) {

    const direction =
        target
            .clone()
            .sub(
                enemy.position
            );


    direction.y =
        0;


    if (
        direction.lengthSq() <
        .01
    ) {

        return;

    }


    direction.normalize();


    const nextX =
        enemy.position.x +
        direction.x *
        speed *
        delta;


    const nextZ =
        enemy.position.z +
        direction.z *
        speed *
        delta;


    if (
        !enemyBlocked(
            nextX,
            nextZ
        )
    ) {

        enemy.position.x =
            nextX;

        enemy.position.z =
            nextZ;

    }


    else {

        const slideX =
            enemy.position.x +
            direction.z *
            speed *
            delta;


        const slideZ =
            enemy.position.z -
            direction.x *
            speed *
            delta;


        if (
            !enemyBlocked(
                slideX,
                slideZ
            )
        ) {

            enemy.position.x =
                slideX;

            enemy.position.z =
                slideZ;

        }

    }


    enemy.position.x =
        THREE.MathUtils.clamp(
            enemy.position.x,
            -42,
            42
        );


    enemy.position.z =
        THREE.MathUtils.clamp(
            enemy.position.z,
            -67,
            -5
        );


    enemy.rotation.y =
        Math.atan2(
            direction.x,
            direction.z
        ) +
        Math.PI;

}


/* ================================================================
   ENEMY VISION
================================================================ */

const visionRay =
    new THREE.Raycaster();


function enemyCanSeePlayer(
    enemy
) {

    if (
        !enemy.userData.alive
    ) {

        return false;

    }


    const origin =
        enemy.position.clone();


    origin.y =
        1.85;


    const target =
        camera.position.clone();


    target.y =
        1.45;


    const toPlayer =
        target
            .clone()
            .sub(
                origin
            );


    const distance =
        toPlayer.length();


    if (
        distance >
        CONFIG.enemy.detectionRange
    ) {

        return false;

    }


    toPlayer.normalize();


    const forward =
        new THREE.Vector3(
            0,
            0,
            -1
        );


    forward.applyQuaternion(
        enemy.quaternion
    );


    const angle =
        THREE.MathUtils.radToDeg(
            forward.angleTo(
                toPlayer
            )
        );


    if (
        angle >
        CONFIG.enemy.fieldOfView
    ) {

        return false;

    }


    visionRay.set(
        origin,
        toPlayer
    );


    const hits =
        visionRay.intersectObjects(
            scene.children,
            true
        );


    for (
        const hit of hits
    ) {

        const object =
            hit.object;


        let parent =
            object.parent;


        let belongsToEnemy =
            false;


        while (
            parent
        ) {

            if (
                parent ===
                enemy
            ) {

                belongsToEnemy =
                    true;

                break;

            }


            parent =
                parent.parent;

        }


        if (
            belongsToEnemy
        ) {

            continue;

        }


        if (
            object.geometry &&
            object.geometry.type ===
            "PlaneGeometry"
        ) {

            continue;

        }


        const hitDistance =
            origin.distanceTo(
                hit.point
            );


        if (
            hitDistance <
            distance -
            .3
        ) {

            return false;

        }


        break;

    }


    return true;

}


/* ================================================================
   THREAT WARNING
================================================================ */

function showThreat(
    enemy,
    message
) {

    currentThreat =
        enemy;


    threatTimer =
        2.8;


    threatWarning.textContent =
        `⚠ ${message} • ENEMY ${enemy.userData.enemyId}`;


    threatWarning.style.opacity =
        "1";


    if (
        enemy.userData.marker
    ) {

        enemy.userData.marker.visible =
            true;


        enemy.userData.alertTimer =
            3.5;

    }

}


/* ================================================================
   THREAT DIRECTION
================================================================ */

function updateThreat(
    delta
) {

    if (
        threatTimer > 0
    ) {

        threatTimer -=
            delta;

    }


    if (
        threatTimer <= 0
    ) {

        threatWarning.style.opacity =
            "0";

        threatArrow.style.opacity =
            "0";

        return;

    }


    if (
        !currentThreat ||
        !currentThreat.userData.alive
    ) {

        threatArrow.style.opacity =
            "0";

        return;

    }


    const enemyPosition =
        currentThreat.position.clone();


    enemyPosition.y +=
        2.8;


    const projected =
        enemyPosition.project(
            camera
        );


    if (

        projected.x > -.8 &&
        projected.x < .8 &&
        projected.y > -.75 &&
        projected.y < .75 &&
        projected.z > 0 &&
        projected.z < 1

    ) {

        threatArrow.style.opacity =
            "0";

        return;

    }


    const direction =
        enemyPosition
            .clone()
            .sub(
                camera.position
            )
            .normalize();


    const cameraForward =
        new THREE.Vector3();


    camera.getWorldDirection(
        cameraForward
    );


    cameraForward.y =
        0;


    cameraForward.normalize();


    const right =
        new THREE.Vector3()
            .crossVectors(
                cameraForward,
                camera.up
            )
            .normalize();


    const angle =
        Math.atan2(
            right.dot(direction),
            cameraForward.dot(direction)
        );


    threatArrow.style.transform =
        `translateX(-50%) rotate(${THREE.MathUtils.radToDeg(
            angle
        )
        }deg)`;


    threatArrow.style.opacity =
        "1";

}


/* ================================================================
   PLAYER SPOTTED
================================================================ */

function playerSpotted(
    enemy
) {

    const data =
        enemy.userData;


    const firstTime =
        !data.spotted;


    data.spotted =
        true;


    data.lastKnown =
        camera.position.clone();


    data.investigateTarget =
        camera.position.clone();


    data.searchTimer =
        7;


    data.alertTimer =
        3.5;


    data.state =
        "attack";


    if (
        data.marker
    ) {

        data.marker.visible =
            true;

    }


    showThreat(
        enemy,
        firstTime
            ? "ENEMY SPOTTED"
            : "TARGET REACQUIRED"
    );


    /*
     * Nearby enemies hear the
     * radio/alert and investigate.
     *
     * They do NOT magically know
     * the player's current position.
     */

    for (
        const other of enemies
    ) {

        if (
            other === enemy
        ) {

            continue;

        }


        if (
            !other.userData.alive
        ) {

            continue;

        }


        if (
            other.userData.state ===
            "attack"
        ) {

            continue;

        }


        const distance =
            other.position.distanceTo(
                enemy.position
            );


        if (
            distance <= 34
        ) {

            other.userData.lastKnown =
                camera.position.clone();


            other.userData.investigateTarget =
                camera.position.clone();


            other.userData.investigateTimer =
                6;


            other.userData.state =
                "investigate";

        }

    }

}


/* ================================================================
   PATROL
================================================================ */

function patrolEnemy(
    enemy,
    delta
) {

    const data =
        enemy.userData;


    data.turnTimer -=
        delta;


    if (
        data.turnTimer <= 0
    ) {

        data.turnTimer =
            2 +
            Math.random() * 3;


        data.direction +=
            (Math.random() - .5) *
            2;

    }


    const target =
        enemy.position.clone();


    target.x +=
        Math.sin(
            data.direction
        ) *
        4;


    target.z +=
        Math.cos(
            data.direction
        ) *
        4;


    moveEnemy(
        enemy,
        target,
        data.speed * .55,
        delta
    );

}


/* ================================================================
   INVESTIGATION
================================================================ */

function investigateEnemy(
    enemy,
    delta
) {

    const data =
        enemy.userData;


    data.investigateTimer -=
        delta;


    if (
        enemyCanSeePlayer(
            enemy
        )
    ) {

        playerSpotted(
            enemy
        );

        return;

    }


    moveEnemy(
        enemy,
        data.investigateTarget,
        CONFIG.enemy.investigateSpeed,
        delta
    );


    if (

        enemy.position.distanceTo(
            data.investigateTarget
        ) < 2 ||

        data.investigateTimer <= 0

    ) {

        data.searchTimer =
            5;


        data.state =
            "search";

    }

}


/* ================================================================
   SEARCH
================================================================ */

function searchEnemy(
    enemy,
    delta
) {

    const data =
        enemy.userData;


    data.searchTimer -=
        delta;


    if (
        enemyCanSeePlayer(
            enemy
        )
    ) {

        playerSpotted(
            enemy
        );

        return;

    }


    const angle =
        performance.now() *
        .0012 +
        data.enemyId;


    const target =
        data.lastKnown.clone();


    target.x +=
        Math.cos(
            angle
        ) *
        3;


    target.z +=
        Math.sin(
            angle
        ) *
        3;


    moveEnemy(
        enemy,
        target,
        data.speed * .45,
        delta
    );


    if (
        data.searchTimer <= 0
    ) {

        data.spotted =
            false;


        data.state =
            "patrol";

    }

}


/* ================================================================
   ENEMY FIRE
================================================================ */

const enemyRay =
    new THREE.Raycaster();


function enemyFire(
    enemy
) {

    const data =
        enemy.userData;


    if (
        !data.alive
    ) {

        return;

    }


    if (
        data.reloadTimer > 0
    ) {

        return;

    }


    if (
        data.ammo <= 0
    ) {

        data.reloadTimer =
            CONFIG.enemy.reloadTime;

        return;

    }


    data.ammo--;


    data.fireTimer =
        THREE.MathUtils.randFloat(
            CONFIG.enemy.fireMinDelay,
            CONFIG.enemy.fireMaxDelay
        );


    /*
     * Muzzle flash.
     */

    if (
        data.enemyFlash
    ) {

        data.enemyFlash.visible =
            true;


        setTimeout(
            () => {

                if (
                    data.enemyFlash
                ) {

                    data.enemyFlash.visible =
                        false;

                }

            },
            65
        );

    }


    if (
        data.enemyLight
    ) {

        data.enemyLight.intensity =
            3.5;


        setTimeout(
            () => {

                if (
                    data.enemyLight
                ) {

                    data.enemyLight.intensity =
                        0;

                }

            },
            75
        );

    }


    showThreat(
        enemy,
        "ENEMY FIRING"
    );


    const origin =
        enemy.position.clone();


    origin.y =
        1.78;


    const target =
        camera.position.clone();


    target.y =
        1.45;


    const direction =
        target
            .clone()
            .sub(
                origin
            )
            .normalize();


    /*
     * Controlled inaccuracy.
     * The enemies are dangerous,
     * but NOT perfect aimbots.
     */

    direction.x +=
        THREE.MathUtils.randFloat(
            -.018,
            .018
        );


    direction.y +=
        THREE.MathUtils.randFloat(
            -.012,
            .012
        );


    direction.z +=
        THREE.MathUtils.randFloat(
            -.018,
            .018
        );


    direction.normalize();


    enemyRay.set(
        origin,
        direction
    );


    const hits =
        enemyRay.intersectObjects(
            scene.children,
            true
        );


    const playerDistance =
        origin.distanceTo(
            camera.position
        );


    for (
        const hit of hits
    ) {

        const object =
            hit.object;


        let parent =
            object.parent;


        let ownEnemy =
            false;


        while (
            parent
        ) {

            if (
                parent ===
                enemy
            ) {

                ownEnemy =
                    true;

                break;

            }


            parent =
                parent.parent;

        }


        if (
            ownEnemy
        ) {

            continue;

        }


        if (
            object.geometry &&
            object.geometry.type ===
            "PlaneGeometry"
        ) {

            continue;

        }


        const hitDistance =
            origin.distanceTo(
                hit.point
            );


        if (
            hitDistance <
            playerDistance -
            .35
        ) {

            /*
             * A wall/house/object
             * stopped the bullet.
             */

            return;

        }


        break;

    }


    const distance =
        playerDistance;


    let damage =
        CONFIG.enemy.damageFar;


    if (
        distance < 12
    ) {

        damage =
            CONFIG.enemy.damageClose;

    }

    else if (
        distance < 24
    ) {

        damage =
            CONFIG.enemy.damageMedium;

    }


    damagePlayer(
        damage,
        enemy
    );

}


/* ================================================================
   ENEMY ATTACK
================================================================ */

function attackEnemy(
    enemy,
    delta
) {

    const data =
        enemy.userData;


    const visible =
        enemyCanSeePlayer(
            enemy
        );


    if (
        visible
    ) {

        data.lastKnown =
            camera.position.clone();


        data.searchTimer =
            7;

    }

    else {

        data.searchTimer -=
            delta;


        if (
            data.searchTimer <= 0
        ) {

            data.state =
                "search";


            return;

        }

    }


    const distance =
        enemy.position.distanceTo(
            camera.position
        );


    /*
     * Chase player.
     */

    if (
        distance >
        CONFIG.enemy.preferredDistance
    ) {

        moveEnemy(
            enemy,
            camera.position,
            CONFIG.enemy.attackSpeed,
            delta
        );

    }


    /*
     * Too close: back away.
     */

    else if (
        distance <
        CONFIG.enemy.minimumDistance
    ) {

        const away =
            enemy.position
                .clone()
                .sub(
                    camera.position
                );


        away.y =
            0;


        if (
            away.lengthSq() > 0
        ) {

            away.normalize();


            const target =
                enemy.position
                    .clone()
                    .add(
                        away.multiplyScalar(
                            3
                        )
                    );


            moveEnemy(
                enemy,
                target,
                data.speed,
                delta
            );

        }

    }


    /*
     * Strafing.
     */

    else {

        data.strafeTimer -=
            delta;


        if (
            data.strafeTimer <= 0
        ) {

            data.strafeTimer =
                1.1 +
                Math.random() *
                1.4;


            data.strafeDirection *=
                -1;

        }


        const toPlayer =
            camera.position
                .clone()
                .sub(
                    enemy.position
                );


        toPlayer.y =
            0;


        if (
            toPlayer.lengthSq() > 0
        ) {

            toPlayer.normalize();


            const side =
                new THREE.Vector3(
                    -toPlayer.z,
                    0,
                    toPlayer.x
                );


            side.multiplyScalar(
                data.strafeDirection *
                2
            );


            const target =
                camera.position
                    .clone()
                    .add(
                        side
                    );


            moveEnemy(
                enemy,
                target,
                data.speed * .4,
                delta
            );

        }

    }


    /*
     * Aim directly at player.
     */

    const aim =
        camera.position.clone();


    aim.y =
        enemy.position.y +
        1.65;


    enemy.lookAt(
        aim
    );


    /*
     * Fire.
     */

    if (
        visible &&
        distance <=
        CONFIG.enemy.attackRange
    ) {

        data.fireTimer -=
            delta;


        if (
            data.fireTimer <= 0
        ) {

            enemyFire(
                enemy
            );

        }

    }

}


/* ================================================================
   ENEMY UPDATE
================================================================ */

function updateEnhancedEnemies(
    delta
) {

    if (
        gamePaused ||
        playerDead
    ) {

        return;

    }


    for (
        const enemy of enemies
    ) {

        if (
            !enemy.userData.enhanced
        ) {

            continue;

        }


        if (
            !enemy.userData.alive
        ) {

            continue;

        }


        const data =
            enemy.userData;


        /*
         * Reload.
         */

        if (
            data.reloadTimer > 0
        ) {

            data.reloadTimer -=
                delta;


            if (
                data.reloadTimer <= 0
            ) {

                data.ammo =
                    CONFIG.enemy.magazineSize;


                data.fireTimer =
                    .4;

            }

        }


        /*
         * Alert marker timer.
         */

        if (
            data.alertTimer > 0
        ) {

            data.alertTimer -=
                delta;


            if (
                data.alertTimer <= 0 &&
                data.marker
            ) {

                data.marker.visible =
                    false;

            }

        }


        /*
         * Automatic visual detection.
         */

        if (
            enemyCanSeePlayer(
                enemy
            ) &&
            data.state !==
            "attack"
        ) {

            playerSpotted(
                enemy
            );

        }


        /*
         * State machine.
         */

        if (
            data.state ===
            "patrol"
        ) {

            patrolEnemy(
                enemy,
                delta
            );

        }

        else if (
            data.state ===
            "investigate"
        ) {

            investigateEnemy(
                enemy,
                delta
            );

        }

        else if (
            data.state ===
            "attack"
        ) {

            attackEnemy(
                enemy,
                delta
            );

        }

        else if (
            data.state ===
            "search"
        ) {

            searchEnemy(
                enemy,
                delta
            );

        }

    }

}


/* ================================================================
   PLAYER GUNSHOT → ENEMY HEARING
================================================================ */

function notifyEnemiesOfGunshot(
    position
) {

    for (
        const enemy of enemies
    ) {

        const data =
            enemy.userData;


        if (
            !data.alive
        ) {

            continue;

        }


        /*
         * Enemies already attacking
         * don't need another alert.
         */

        if (
            data.state ===
            "attack"
        ) {

            continue;

        }


        const distance =
            enemy.position.distanceTo(
                position
            );


        if (
            distance >
            CONFIG.enemy.hearingRange
        ) {

            continue;

        }


        data.lastKnown =
            position.clone();


        data.investigateTarget =
            position.clone();


        data.investigateTimer =
            6 +
            Math.max(
                0,
                (
                    CONFIG.enemy.hearingRange -
                    distance
                ) / 10
            );


        data.state =
            "investigate";

    }

}


/* ================================================================
   SHOOT LISTENER
================================================================ */

window.addEventListener(
    "mousedown",
    event => {

        if (
            event.button !== 0
        ) {

            return;

        }


        if (
            !controls.isLocked
        ) {

            return;

        }


        if (
            playerDead ||
            gamePaused
        ) {

            return;

        }


        /*
         * The original shoot()
         * function is still used.
         *
         * This listener only tells
         * the enemies that a gunshot
         * happened.
         */

        notifyEnemiesOfGunshot(
            camera.position.clone()
        );

    }
);


/* ================================================================
   BOMB PUZZLE GENERATOR
================================================================ */

function createBombPuzzle() {

    const targetFrequency =
        THREE.MathUtils.randInt(
            40,
            70
        );


    const targetPolarity =
        Math.random() > .5
            ? "POSITIVE"
            : "NEGATIVE";


    const targetPulse =
        THREE.MathUtils.randInt(
            2,
            8
        );


    const correctWire =
        THREE.MathUtils.randInt(
            0,
            3
        );


    const wires =
        [];


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const label =
            ["A", "B", "C", "D"][i];


        if (
            i ===
            correctWire
        ) {

            wires.push(
                {

                    label,

                    frequency:
                        targetFrequency,

                    polarity:
                        targetPolarity,

                    pulse:
                        targetPulse,

                    traced:
                        false

                }
            );

        }

        else {

            let frequency =
                targetFrequency +
                THREE.MathUtils.randInt(
                    -15,
                    15
                );


            while (
                frequency ===
                targetFrequency
            ) {

                frequency =
                    targetFrequency +
                    THREE.MathUtils.randInt(
                        -15,
                        15
                    );

            }


            let polarity =
                Math.random() > .5
                    ? "POSITIVE"
                    : "NEGATIVE";


            let pulse =
                THREE.MathUtils.randInt(
                    1,
                    9
                );


            /*
             * Make absolutely sure
             * this isn't accidentally
             * identical to the correct
             * signal.
             */

            if (

                frequency ===
                targetFrequency &&

                polarity ===
                targetPolarity &&

                pulse ===
                targetPulse

            ) {

                pulse =
                    pulse === 9
                        ? 1
                        : pulse + 1;

            }


            wires.push(
                {

                    label,

                    frequency,

                    polarity,

                    pulse,

                    traced:
                        false

                }
            );

        }

    }


    return {

        targetFrequency,

        targetPolarity,

        targetPulse,

        wires

    };

}


/* ================================================================
   OPEN BOMB
================================================================ */

function openBombDefusal() {

    if (
        bombUIOpen ||
        bombSolved ||
        playerDead
    ) {

        return;

    }


    const distance =
        camera.position.distanceTo(
            bomb.position
        );


    if (
        distance >
        CONFIG.bomb.interactionDistance
    ) {

        statusText.textContent =
            "MOVE CLOSER TO THE BOMB";


        return;

    }


    bombUIOpen =
        true;


    gamePaused =
        true;


    controls.unlock();


    bombPuzzle =
        createBombPuzzle();


    bombOverlay =
        document.createElement(
            "div"
        );


    bombOverlay.style.cssText = `
position:fixed;
inset:0;
z-index:150;
display:flex;
align-items:center;
justify-content:center;
background:rgba(3,7,11,.97);
color:white;
font-family:Arial,Helvetica,sans-serif;
`;


    const panel =
        document.createElement(
            "div"
        );


    panel.style.cssText = `
width:min(930px,92vw);
max-height:90vh;
overflow:auto;
padding:28px;
border-radius:14px;
background:#10171f;
border:1px solid #34404b;
box-shadow:0 30px 100px rgba(0,0,0,.7);
box-sizing:border-box;
`;


    panel.innerHTML = `

<div
style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:18px;
">

<div
style="
font-size:28px;
font-weight:900;
">
BOMB CONTROL SYSTEM
</div>

<div
style="
color:#ff453a;
font-weight:bold;
">
● LIVE DEVICE
</div>

</div>


<div
style="
padding:18px;
margin-bottom:18px;
border-radius:9px;
background:#18212a;
border:1px solid #283541;
">

<div
style="
font-weight:bold;
font-size:16px;
margin-bottom:10px;
">
STEP 1 — IDENTIFY THE DETONATOR SIGNAL
</div>


<div
id="bomb-target-signal"
style="
display:flex;
flex-wrap:wrap;
gap:10px;
">
</div>


<div
style="
margin-top:13px;
color:#aebbc6;
font-size:13px;
line-height:1.55;
">

Do not guess the wire.

TRACE each wire and compare its
frequency, polarity and pulse pattern.

The wire matching the detonator signal
is the safe circuit.

</div>

</div>


<div
id="bomb-wire-grid"
style="
display:grid;
grid-template-columns:
repeat(auto-fit,minmax(190px,1fr));
gap:14px;
">
</div>


<div
id="bomb-message"
style="
min-height:25px;
margin-top:18px;
text-align:center;
font-weight:bold;
">
</div>

`;


    bombOverlay.appendChild(
        panel
    );


    document.body.appendChild(
        bombOverlay
    );


    const target =
        panel.querySelector(
            "#bomb-target-signal"
        );


    addSignalBadge(
        target,
        "FREQUENCY",
        `${bombPuzzle.targetFrequency} Hz`
    );


    addSignalBadge(
        target,
        "POLARITY",
        bombPuzzle.targetPolarity
    );


    addSignalBadge(
        target,
        "PULSE",
        bombPuzzle.targetPulse
    );


    const grid =
        panel.querySelector(
            "#bomb-wire-grid"
        );


    bombPuzzle.wires.forEach(
        (
            wire,
            index
        ) => {

            createWireCard(
                grid,
                wire,
                index
            );

        }
    );


    const close =
        document.createElement(
            "button"
        );


    close.textContent =
        "CLOSE";


    close.style.cssText = `
display:block;
margin:18px auto 0;
padding:11px 24px;
border-radius:7px;
border:1px solid #3d4a56;
background:#202a33;
color:white;
cursor:pointer;
font-weight:bold;
`;


    close.onclick =
        closeBombDefusal;


    panel.appendChild(
        close
    );

}


/* ================================================================
   SIGNAL BADGE
================================================================ */

function addSignalBadge(
    parent,
    label,
    value
) {

    const badge =
        document.createElement(
            "div"
        );


    badge.style.cssText = `
padding:9px 12px;
border-radius:6px;
background:#0d1217;
border:1px solid #2b3741;
font-size:12px;
`;


    badge.innerHTML = `
<span
style="
color:#8393a2;
">
${label}
</span>

<br>

<strong>
${value}
</strong>
`;


    parent.appendChild(
        badge
    );

}


/* ================================================================
   WIRE CARD
================================================================ */

function createWireCard(
    parent,
    wire,
    index
) {

    const wireColors =
        [

            "#ff3434",

            "#2d79ff",

            "#ffd43b",

            "#35d66a"

        ];


    const card =
        document.createElement(
            "div"
        );


    card.style.cssText = `
padding:16px;
border-radius:10px;
background:#151e27;
border:1px solid #303d49;
`;


    card.innerHTML = `

<div
style="
display:flex;
justify-content:space-between;
align-items:center;
margin-bottom:13px;
">

<strong
style="
font-size:22px;
">
WIRE ${wire.label}
</strong>


<span
style="
width:15px;
height:15px;
border-radius:50%;
display:block;
background:${wireColors[index]};
box-shadow:
0 0 10px ${wireColors[index]};
">
</span>

</div>


<div
class="wire-signal"
style="
min-height:88px;
padding:12px;
border-radius:7px;
background:#0b1015;
color:#c4ced6;
font-size:12px;
line-height:1.75;
">
SIGNAL NOT TRACED
</div>


<button
class="trace-button"
style="
width:100%;
margin-top:11px;
padding:10px;
border-radius:6px;
border:1px solid #465562;
background:#26323c;
color:white;
cursor:pointer;
font-weight:bold;
">
TRACE SIGNAL
</button>


<button
class="cut-button"
disabled
style="
width:100%;
margin-top:8px;
padding:10px;
border-radius:6px;
border:0;
background:#842323;
color:white;
cursor:pointer;
font-weight:bold;
opacity:.4;
">
CUT WIRE
</button>

`;


    parent.appendChild(
        card
    );


    const signal =
        card.querySelector(
            ".wire-signal"
        );


    const trace =
        card.querySelector(
            ".trace-button"
        );


    const cut =
        card.querySelector(
            ".cut-button"
        );


    trace.onclick =
        () => {

            wire.traced =
                true;


            signal.innerHTML = `

FREQUENCY:
<strong>
${wire.frequency} Hz
</strong>

<br>

POLARITY:
<strong>
${wire.polarity}
</strong>

<br>

PULSE:
<strong>
${wire.pulse}
</strong>

`;


            cut.disabled =
                false;


            cut.style.opacity =
                "1";


            const message =
                bombOverlay.querySelector(
                    "#bomb-message"
                );


            message.textContent =
                `WIRE ${wire.label} TRACED — compare all three properties.`;


            message.style.color =
                "#d7e1e9";

        };


    cut.onclick =
        () => {

            if (
                !wire.traced
            ) {

                return;

            }


            const correct =
                wire.frequency ===
                bombPuzzle.targetFrequency &&

                wire.polarity ===
                bombPuzzle.targetPolarity &&

                wire.pulse ===
                bombPuzzle.targetPulse;


            if (
                correct
            ) {

                solveBomb(
                    wire
                );

            }

            else {

                detonateBomb();

            }

        };

}


/* ================================================================
   BOMB SOLVED
================================================================ */

function solveBomb(
    wire
) {

    bombSolved =
        true;


    const message =
        bombOverlay.querySelector(
            "#bomb-message"
        );


    message.textContent =
        `✓ WIRE ${wire.label} MATCHED THE DETONATOR — BOMB DISARMED`;


    message.style.color =
        "#45ff8b";


    objectiveText.textContent =
        "LEVEL 1 COMPLETE — BOMB DISARMED";


    /*
     * We do NOT replace the original
     * bomb.
     *
     * We only change its light.
     */

    bombIndicator.material =
        new THREE.MeshBasicMaterial(
            {
                color:
                    0x32ff72
            }
        );


    bombLight.color.set(
        0x32ff72
    );


    bombLight.intensity =
        .7;


    setTimeout(
        () => {

            closeBombDefusal();


            statusText.textContent =
                "LEVEL 1 COMPLETE";

        },
        1300
    );

}


/* ================================================================
   BOMB DETONATION
================================================================ */

function detonateBomb() {

    closeBombDefusal();


    playerDead =
        true;


    gamePaused =
        true;


    controls.unlock();


    const flash =
        document.createElement(
            "div"
        );


    flash.style.cssText = `
position:fixed;
inset:0;
z-index:250;
background:rgba(255,100,20,.96);
transition:opacity 1s;
`;


    document.body.appendChild(
        flash
    );


    const explosion =
        new THREE.PointLight(
            0xff5a16,
            30,
            40
        );


    explosion.position.copy(
        bomb.position
    );


    scene.add(
        explosion
    );


    setTimeout(
        () => {

            flash.style.opacity =
                "0";

        },
        80
    );


    setTimeout(
        () => {

            flash.remove();


            explosion.remove();


            const screen =
                document.createElement(
                    "div"
                );


            screen.style.cssText = `
position:fixed;
inset:0;
z-index:251;
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
background:rgba(0,0,0,.93);
color:white;
font-family:Arial,Helvetica,sans-serif;
`;


            screen.innerHTML = `

<div
style="
font-size:52px;
font-weight:900;
color:#ff453a;
margin-bottom:12px;
">
BOMB DETONATED
</div>


<div
style="
color:#aeb8c0;
margin-bottom:24px;
">
The signal did not match the detonator circuit.
</div>

`;


            const restart =
                document.createElement(
                    "button"
                );


            restart.textContent =
                "RESTART LEVEL";


            restart.style.cssText = `
padding:13px 27px;
border:0;
border-radius:7px;
background:white;
color:#111;
font-weight:bold;
cursor:pointer;
`;


            restart.onclick =
                () => {

                    location.reload();

                };


            screen.appendChild(
                restart
            );


            document.body.appendChild(
                screen
            );

        },
        1000
    );

}


/* ================================================================
   CLOSE BOMB
================================================================ */

function closeBombDefusal() {

    if (
        !bombUIOpen
    ) {

        return;

    }


    bombUIOpen =
        false;


    gamePaused =
        false;


    if (
        bombOverlay
    ) {

        bombOverlay.remove();


        bombOverlay =
            null;

    }


    if (
        !playerDead
    ) {

        statusText.textContent =
            "CLICK TO ENTER";

    }

}


/* ================================================================
   E KEY
================================================================ */

/* ================================================================
   FIXED BOMB INTERACTION — E KEY
================================================================ */

let eKeyLocked = false;

window.addEventListener(
    "keydown",
    function (event) {

        /*
         * Only react to the E key.
         */
        if (
            event.code !== "KeyE" &&
            event.key.toLowerCase() !== "e"
        ) {
            return;
        }

        /*
         * Prevent browser/default behaviour.
         */
        event.preventDefault();
        event.stopPropagation();

        /*
         * Prevent the key from firing
         * repeatedly if held down.
         */
        if (eKeyLocked) {
            return;
        }

        eKeyLocked = true;

        setTimeout(
            () => {
                eKeyLocked = false;
            },
            250
        );

        /*
         * Dead player cannot interact.
         */
        if (playerDead) {
            return;
        }

        /*
         * If bomb interface is already open,
         * E closes it.
         */
        if (bombUIOpen) {

            closeBombDefusal();

            return;
        }

        /*
         * Check distance to the ORIGINAL bomb.
         */
        const distance =
            camera.position.distanceTo(
                bomb.position
            );

        /*
         * DEBUG / PLAYER FEEDBACK
         *
         * This makes it obvious why E
         * isn't opening the bomb.
         */
        if (
            distance >
            CONFIG.bomb.interactionDistance
        ) {

            statusText.textContent =
                `BOMB TOO FAR — ${distance.toFixed(1)}m AWAY`;

            /*
             * Show the normal objective again
             * after a short delay.
             */
            setTimeout(
                () => {

                    if (
                        !bombUIOpen &&
                        !playerDead
                    ) {

                        statusText.textContent =
                            "LOCATE THE BOMB";

                    }

                },
                1200
            );

            return;
        }

        /*
         * WE ARE CLOSE ENOUGH.
         *
         * Open the defusal interface.
         */
        openBombDefusal();

    },
    true
);


/* ================================================================
   BOMB DISTANCE FEEDBACK
================================================================ */

function updateBombInteractionPrompt() {

    if (
        playerDead ||
        bombSolved ||
        bombUIOpen
    ) {

        bombPrompt.style.opacity =
            "0";

        return;

    }

    const distance =
        camera.position.distanceTo(
            bomb.position
        );


    /*
     * Far away from bomb.
     */
    if (
        distance >
        12
    ) {

        bombPrompt.style.opacity =
            "0";

        return;

    }


    /*
     * Getting closer.
     */
    if (
        distance >
        CONFIG.bomb.interactionDistance
    ) {

        bombPrompt.innerHTML = `
            <div
            style="
            font-size:14px;
            font-weight:bold;
            color:#ffcc66;
            ">
            BOMB DETECTED
            </div>

            <div
            style="
            margin-top:5px;
            font-size:12px;
            color:#d0d7dd;
            ">
            ${distance.toFixed(1)}m away
            </div>
        `;

        bombPrompt.style.opacity =
            "1";

        return;

    }


    /*
     * CLOSE ENOUGH.
     */
    bombPrompt.innerHTML = `
        <div
        style="
        font-size:16px;
        font-weight:900;
        color:#ff453a;
        ">
        ⚠ BOMB FOUND
        </div>

        <div
        style="
        margin-top:6px;
        font-size:14px;
        color:white;
        ">
        PRESS <strong>E</strong> TO DEFUSE
        </div>
    `;

    bombPrompt.style.opacity =
        "1";

}


/* ================================================================
   REPLACE OLD BOMB PROMPT LOOP
================================================================ */

function enhancedBombInteractionLoop() {

    if (
        !gamePaused
    ) {

        updateBombInteractionPrompt();

    }

}


/* ================================================================
   RUN INTERACTION CHECK
================================================================ */

setInterval(
    enhancedBombInteractionLoop,
    100
);

/* ================================================================
   BOMB PROMPT
================================================================ */

function updateBombPrompt() {

    if (
        bombSolved ||
        bombUIOpen ||
        playerDead
    ) {

        bombPrompt.style.opacity =
            "0";


        return;

    }


    const distance =
        camera.position.distanceTo(
            bomb.position
        );


    if (
        distance <=
        CONFIG.bomb.interactionDistance
    ) {

        bombPrompt.textContent =
            "⚠ BOMB — PRESS E TO ACCESS DEFUSAL SYSTEM";


        bombPrompt.style.opacity =
            "1";

    }

    else {

        bombPrompt.style.opacity =
            "0";

    }

}


/* ================================================================
   INITIAL HEALTH
================================================================ */

updateHealthHUD();


/* ================================================================
   ENHANCED LOOP
================================================================ */

let previousTime =
    performance.now();


function enhancedLoop() {

    requestAnimationFrame(
        enhancedLoop
    );


    const now =
        performance.now();


    const delta =
        Math.min(
            (
                now -
                previousTime
            ) / 1000,
            .05
        );


    previousTime =
        now;


    updateEnhancedEnemies(
        delta
    );


    updateBombPrompt();


    updateThreat(
        delta
    );

}


enhancedLoop();


/* ================================================================
   END
================================================================ */