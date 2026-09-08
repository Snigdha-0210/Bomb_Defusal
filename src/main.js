import * as THREE from "three";

import {
    PointerLockControls
} from "three/addons/controls/PointerLockControls.js";


/* =========================================================
   HTML
========================================================= */

const game = document.getElementById("game");

const levelText =
    document.getElementById("level");

const scoreText =
    document.getElementById("score");

const objectiveText =
    document.getElementById("objective-text");

const statusText =
    document.getElementById("status-text");


/* =========================================================
   SCENE
========================================================= */

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x0b1424);

scene.fog =
    new THREE.Fog(
        0x0b1424,
        60,
        180
    );


/* =========================================================
   CAMERA
========================================================= */

const camera =
    new THREE.PerspectiveCamera(
        70,
        window.innerWidth /
        window.innerHeight,
        0.05,
        300
    );

camera.position.set(
    0,
    2,
    25
);


/*
    IMPORTANT

    Camera is inside the scene because
    the rifle and hands are children
    of the camera.
*/

scene.add(camera);


/* =========================================================
   RENDERER
========================================================= */

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        1.5
    )
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

game.appendChild(
    renderer.domElement
);


/* =========================================================
   FPS CONTROLS
========================================================= */

const controls =
    new PointerLockControls(
        camera,
        document.body
    );


/* =========================================================
   CLICK TO ENTER
========================================================= */

document.body.addEventListener(
    "click",
    () => {

        if (!controls.isLocked) {

            controls.lock();

        }

    }
);


controls.addEventListener(
    "lock",
    () => {

        statusText.textContent =
            "WASD MOVE • SHIFT SPRINT • SPACE JUMP • LEFT CLICK FIRE • E DEFUSE";

    }
);


controls.addEventListener(
    "unlock",
    () => {

        if (!playerDead) {

            statusText.textContent =
                "CLICK TO ENTER";

        }

    }
);


/* =========================================================
   LIGHTING
========================================================= */

const hemiLight =
    new THREE.HemisphereLight(
        0x9db7d9,
        0x202014,
        1.8
    );

scene.add(
    hemiLight
);


const sun =
    new THREE.DirectionalLight(
        0xffd6a0,
        2.4
    );

sun.position.set(
    -35,
    65,
    25
);

sun.castShadow = true;

sun.shadow.mapSize.width =
    2048;

sun.shadow.mapSize.height =
    2048;

sun.shadow.camera.left =
    -100;

sun.shadow.camera.right =
    100;

sun.shadow.camera.top =
    100;

sun.shadow.camera.bottom =
    -100;

scene.add(
    sun
);


/* =========================================================
   MATERIALS
========================================================= */

const grassMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x333b1b,
        roughness: 1
    });


const roadMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x5b402b,
        roughness: 1
    });


const houseMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x70432d,
        roughness: 0.95
    });


const roofMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x382015,
        roughness: 1
    });


const woodMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x3b2115,
        roughness: 1
    });


const darkMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x101412,
        roughness: 0.8
    });


const metalMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x34383a,
        metalness: 0.75,
        roughness: 0.28
    });


const glassMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x8fb5b7,
        roughness: 0.15,
        metalness: 0.1
    });


/* =========================================================
   ENVIRONMENT MESHES
========================================================= */

const environmentMeshes = [];


/* =========================================================
   GROUND
========================================================= */

const ground =
    new THREE.Mesh(
        new THREE.PlaneGeometry(
            180,
            180
        ),
        grassMaterial
    );

ground.rotation.x =
    -Math.PI / 2;

ground.receiveShadow = true;

scene.add(
    ground
);


/* =========================================================
   ROAD
========================================================= */

function createRoad(
    x,
    z,
    width,
    length,
    rotation = 0
) {

    const road =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                width,
                length
            ),
            roadMaterial
        );

    road.rotation.x =
        -Math.PI / 2;

    road.rotation.z =
        rotation;

    road.position.set(
        x,
        0.015,
        z
    );

    road.receiveShadow = true;

    scene.add(
        road
    );
}


createRoad(
    0,
    -20,
    10,
    120
);


createRoad(
    0,
    -20,
    100,
    9,
    Math.PI / 2
);


/* =========================================================
   HOUSE COLLISION
========================================================= */

const houseCollisions = [];


/* =========================================================
   HOUSE
========================================================= */

function createHouse(
    x,
    z,
    width,
    height,
    depth,
    rotation = 0
) {

    const house =
        new THREE.Group();

    house.position.set(
        x,
        0,
        z
    );

    house.rotation.y =
        rotation;


    /* BODY */

    const body =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),
            houseMaterial
        );

    body.position.y =
        height / 2;

    body.castShadow = true;

    body.receiveShadow = true;

    body.userData.isEnvironment = true;

    environmentMeshes.push(body);

    house.add(
        body
    );


    /* ROOF */

    const roof =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                Math.max(
                    width,
                    depth
                ) * 0.75,
                3.5,
                4
            ),
            roofMaterial
        );

    roof.position.y =
        height + 1.75;

    roof.rotation.y =
        Math.PI / 4;

    roof.castShadow = true;

    roof.userData.isEnvironment = true;

    environmentMeshes.push(roof);

    house.add(
        roof
    );


    /* DOOR */

    const door =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.35,
                2.3,
                0.12
            ),
            woodMaterial
        );

    door.position.set(
        0,
        1.15,
        depth / 2 + 0.07
    );

    door.castShadow = true;

    door.userData.isEnvironment = true;

    environmentMeshes.push(door);

    house.add(
        door
    );


    /* WINDOWS */

    for (
        const wx of [
            -width * 0.28,
            width * 0.28
        ]
    ) {

        const windowMesh =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.25,
                    1.05,
                    0.10
                ),
                glassMaterial
            );

        windowMesh.position.set(
            wx,
            height * 0.55,
            depth / 2 + 0.08
        );

        windowMesh.userData.isEnvironment = true;

        environmentMeshes.push(
            windowMesh
        );

        house.add(
            windowMesh
        );


        const vertical =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.07,
                    1.2,
                    0.12
                ),
                darkMaterial
            );

        vertical.position.set(
            wx,
            height * 0.55,
            depth / 2 + 0.14
        );

        vertical.userData.isEnvironment = true;

        environmentMeshes.push(
            vertical
        );

        house.add(
            vertical
        );


        const horizontal =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    1.35,
                    0.07,
                    0.12
                ),
                darkMaterial
            );

        horizontal.position.set(
            wx,
            height * 0.55,
            depth / 2 + 0.14
        );

        horizontal.userData.isEnvironment = true;

        environmentMeshes.push(
            horizontal
        );

        house.add(
            horizontal
        );

    }


    /* CHIMNEY */

    const chimney =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.7,
                2.2,
                0.7
            ),
            darkMaterial
        );

    chimney.position.set(
        width * 0.25,
        height + 1.4,
        -depth * 0.15
    );

    chimney.userData.isEnvironment = true;

    environmentMeshes.push(
        chimney
    );

    house.add(
        chimney
    );


    scene.add(
        house
    );


    houseCollisions.push({
        x,
        z,
        width,
        depth
    });

}


/* =========================================================
   VILLAGE
========================================================= */

createHouse(
    -23,
    -12,
    11,
    6,
    9
);


createHouse(
    23,
    -12,
    11,
    6,
    9,
    Math.PI
);


createHouse(
    -27,
    -30,
    9,
    5.5,
    8,
    0.1
);


createHouse(
    27,
    -30,
    10,
    6,
    8,
    -0.1
);


createHouse(
    -18,
    -47,
    10,
    5.5,
    8,
    0.2
);


createHouse(
    18,
    -47,
    10,
    5.5,
    8,
    -0.2
);


/* =========================================================
   TREES
========================================================= */

function createTree(
    x,
    z,
    scale = 1
) {

    const tree =
        new THREE.Group();

    tree.position.set(
        x,
        0,
        z
    );

    tree.scale.setScalar(
        scale
    );


    const trunk =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.45,
                0.65,
                4,
                8
            ),
            woodMaterial
        );

    trunk.position.y =
        2;

    trunk.castShadow = true;

    trunk.userData.isEnvironment = true;

    environmentMeshes.push(trunk);

    tree.add(
        trunk
    );


    const leaves =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                2.5,
                12,
                10
            ),
            new THREE.MeshStandardMaterial({
                color: 0x182515,
                roughness: 1
            })
        );

    leaves.position.y =
        5;

    leaves.castShadow = true;

    leaves.userData.isEnvironment = true;

    environmentMeshes.push(leaves);

    tree.add(
        leaves
    );


    scene.add(
        tree
    );
}


createTree(
    -42,
    -5,
    1.5
);

createTree(
    42,
    -5,
    1.5
);

createTree(
    -43,
    -27,
    1.25
);

createTree(
    43,
    -27,
    1.25
);

createTree(
    -39,
    -48,
    1.4
);

createTree(
    39,
    -48,
    1.4
);

createTree(
    -12,
    -7,
    0.8
);

createTree(
    13,
    -8,
    0.9
);

createTree(
    -11,
    -33,
    0.9
);

createTree(
    12,
    -33,
    0.9
);


/* =========================================================
   ROCK
========================================================= */

function createRock(
    x,
    z,
    scale = 1
) {

    const rock =
        new THREE.Mesh(
            new THREE.DodecahedronGeometry(
                1.1,
                0
            ),
            new THREE.MeshStandardMaterial({
                color: 0x53504a,
                roughness: 1
            })
        );

    rock.position.set(
        x,
        0.7,
        z
    );

    rock.scale.set(
        scale * 1.4,
        scale * 0.7,
        scale
    );

    rock.rotation.y =
        Math.random() *
        Math.PI;

    rock.castShadow = true;

    rock.userData.isEnvironment = true;

    environmentMeshes.push(
        rock
    );

    scene.add(
        rock
    );
}


createRock(
    -12,
    -18,
    1
);

createRock(
    14,
    -18,
    0.8
);

createRock(
    -35,
    -17,
    0.9
);

createRock(
    35,
    -17,
    1
);

createRock(
    -15,
    -42,
    0.7
);

createRock(
    16,
    -43,
    0.9
);


/* =========================================================
   BARRELS
========================================================= */

function createBarrel(
    x,
    z
) {

    const barrel =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.65,
                0.65,
                1.4,
                12
            ),
            woodMaterial
        );

    barrel.position.set(
        x,
        0.7,
        z
    );

    barrel.castShadow = true;

    barrel.userData.isEnvironment = true;

    environmentMeshes.push(
        barrel
    );

    scene.add(
        barrel
    );
}


createBarrel(
    -15,
    -12
);

createBarrel(
    15,
    -12
);

createBarrel(
    -30,
    -22
);

createBarrel(
    30,
    -22
);


/* =========================================================
   CRATES
========================================================= */

function createCrate(
    x,
    z
) {

    const crate =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                1.4,
                1.4,
                1.4
            ),
            woodMaterial
        );

    crate.position.set(
        x,
        0.7,
        z
    );

    crate.rotation.y =
        Math.random();

    crate.castShadow = true;

    crate.userData.isEnvironment = true;

    environmentMeshes.push(
        crate
    );

    scene.add(
        crate
    );
}


createCrate(
    -17,
    -16
);

createCrate(
    17,
    -16
);

createCrate(
    -30,
    -38
);

createCrate(
    30,
    -38
);


/* =========================================================
   FENCE
========================================================= */

function createFence(
    x,
    z,
    length,
    rotation = 0
) {

    const fence =
        new THREE.Group();

    fence.position.set(
        x,
        0,
        z
    );

    fence.rotation.y =
        rotation;


    for (
        let i = 0;
        i < length;
        i += 2
    ) {

        const post =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.18,
                    1.8,
                    0.18
                ),
                woodMaterial
            );

        post.position.set(
            i - length / 2,
            0.9,
            0
        );

        post.castShadow = true;

        post.userData.isEnvironment = true;

        environmentMeshes.push(
            post
        );

        fence.add(
            post
        );

    }


    const rail1 =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                length,
                0.15,
                0.15
            ),
            woodMaterial
        );

    rail1.position.y =
        1.2;

    rail1.userData.isEnvironment = true;

    environmentMeshes.push(
        rail1
    );

    fence.add(
        rail1
    );


    const rail2 =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                length,
                0.15,
                0.15
            ),
            woodMaterial
        );

    rail2.position.y =
        0.65;

    rail2.userData.isEnvironment = true;

    environmentMeshes.push(
        rail2
    );

    fence.add(
        rail2
    );


    scene.add(
        fence
    );
}


createFence(
    -35,
    -9,
    15,
    Math.PI / 2
);

createFence(
    35,
    -9,
    15,
    Math.PI / 2
);


/* =========================================================
   STREET LIGHT
========================================================= */

function createStreetLight(
    x,
    z
) {

    const pole =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.07,
                0.09,
                5,
                8
            ),
            darkMaterial
        );

    pole.position.set(
        x,
        2.5,
        z
    );

    pole.castShadow = true;

    scene.add(
        pole
    );


    const bulb =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.22,
                12,
                12
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffe7a3
            })
        );

    bulb.position.set(
        x,
        5.15,
        z
    );

    scene.add(
        bulb
    );


    const light =
        new THREE.PointLight(
            0xffd37a,
            1.5,
            14
        );

    light.position.set(
        x,
        5.1,
        z
    );

    scene.add(
        light
    );
}


createStreetLight(
    -7,
    -10
);

createStreetLight(
    7,
    -10
);

createStreetLight(
    -7,
    -27
);

createStreetLight(
    7,
    -27
);

createStreetLight(
    -7,
    -43
);

createStreetLight(
    7,
    -43
);


/* =========================================================
   WELL
========================================================= */

function createWell() {

    const well =
        new THREE.Group();

    well.position.set(
        0,
        0,
        -18
    );


    const base =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                3,
                3,
                1.2,
                16
            ),
            new THREE.MeshStandardMaterial({
                color: 0x5b554a,
                roughness: 1
            })
        );

    base.position.y =
        0.6;

    base.castShadow = true;

    well.add(
        base
    );


    const roof =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                2.8,
                2.2,
                4
            ),
            roofMaterial
        );

    roof.position.y =
        5;

    roof.rotation.y =
        Math.PI / 4;

    roof.castShadow = true;

    well.add(
        roof
    );


    for (
        const px of [
            -2.1,
            2.1
        ]
    ) {

        const post =
            new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.35,
                    4.5,
                    0.35
                ),
                woodMaterial
            );

        post.position.set(
            px,
            2.7,
            0
        );

        well.add(
            post
        );

    }


    scene.add(
        well
    );
}


createWell();


/* =========================================================
   PLAYER COMBAT STATE
========================================================= */

let playerHealth = 100;

const PLAYER_MAX_HEALTH = 100;

let playerDead = false;

let damageFlashTimer = 0;


/* =========================================================
   COMBAT HUD
========================================================= */

function createCombatHUD() {

    const combatHUD =
        document.createElement("div");

    combatHUD.id =
        "combat-hud";

    combatHUD.innerHTML = `
        <div id="health-label">HEALTH</div>

        <div id="health-bar">
            <div id="health-fill"></div>
        </div>

        <div id="health-number">100</div>
    `;

    document.body.appendChild(
        combatHUD
    );


    const damageFlash =
        document.createElement("div");

    damageFlash.id =
        "damage-flash";

    document.body.appendChild(
        damageFlash
    );


    const deathScreen =
        document.createElement("div");

    deathScreen.id =
        "death-screen";

    deathScreen.innerHTML = `
        <div id="death-title">
            YOU DIED
        </div>

        <div id="death-subtitle">
            THE ENEMY GOT YOU
        </div>

        <button id="restart-button">
            RESTART LEVEL
        </button>
    `;

    document.body.appendChild(
        deathScreen
    );


    const style =
        document.createElement("style");

    style.textContent = `

        #combat-hud {
            position: fixed;
            left: 30px;
            bottom: 30px;
            z-index: 50;
            width: 240px;
            pointer-events: none;
            font-family: Arial, sans-serif;
        }

        #health-label {
            color: white;
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 3px;
            margin-bottom: 6px;
            text-shadow: 0 2px 5px black;
        }

        #health-bar {
            width: 230px;
            height: 13px;
            background: rgba(0,0,0,0.65);
            border: 1px solid rgba(255,255,255,0.35);
            border-radius: 3px;
            overflow: hidden;
        }

        #health-fill {
            width: 100%;
            height: 100%;
            background: #42e66b;
            transition: width 0.15s ease;
        }

        #health-number {
            color: white;
            font-size: 13px;
            font-weight: bold;
            text-align: right;
            width: 230px;
            margin-top: 5px;
            text-shadow: 0 2px 5px black;
        }

        #damage-flash {
            position: fixed;
            inset: 0;
            z-index: 40;
            pointer-events: none;
            background: rgba(255,0,0,0);
            transition: background 0.08s;
        }

        #death-screen {
            position: fixed;
            inset: 0;
            z-index: 200;
            display: none;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            background: rgba(0,0,0,0.86);
            font-family: Arial, sans-serif;
        }

        #death-title {
            color: #ff3333;
            font-size: 65px;
            font-weight: 900;
            letter-spacing: 8px;
            text-shadow:
                0 0 20px rgba(255,0,0,0.45);
        }

        #death-subtitle {
            color: white;
            margin-top: 15px;
            font-size: 16px;
            letter-spacing: 4px;
            opacity: 0.75;
        }

        #restart-button {
            margin-top: 35px;
            padding: 14px 38px;
            background: rgba(255,255,255,0.08);
            color: white;
            border: 1px solid rgba(255,255,255,0.45);
            cursor: pointer;
            font-size: 14px;
            letter-spacing: 2px;
        }

        #restart-button:hover {
            background: rgba(255,255,255,0.2);
        }

    `;

    document.head.appendChild(
        style
    );


    document
        .getElementById("restart-button")
        .addEventListener(
            "click",
            () => {

                location.reload();

            }
        );
}


createCombatHUD();


/* =========================================================
   ENEMIES
========================================================= */

const enemies = [];


/* =========================================================
   ENEMY WEAPON
========================================================= */

function createEnemyWeapon() {

    const enemyGun =
        new THREE.Group();

    enemyGun.name =
        "enemyGun";


    const gunMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x17191b,
            metalness: 0.7,
            roughness: 0.3
        });


    const darkGunMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x292d30,
            metalness: 0.55,
            roughness: 0.4
        });


    /* RECEIVER */

    const receiver =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.20,
                0.16,
                0.62
            ),
            darkGunMaterial
        );

    receiver.position.z =
        -0.20;

    receiver.userData.enemyWeapon = true;

    enemyGun.add(
        receiver
    );


    /* BARREL */

    const barrel =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.035,
                0.035,
                0.60,
                8
            ),
            gunMaterial
        );

    barrel.rotation.x =
        Math.PI / 2;

    barrel.position.z =
        -0.70;

    barrel.userData.enemyWeapon = true;

    enemyGun.add(
        barrel
    );


    /* STOCK */

    const stock =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.16,
                0.14,
                0.30
            ),
            gunMaterial
        );

    stock.position.z =
        0.22;

    stock.userData.enemyWeapon = true;

    enemyGun.add(
        stock
    );


    /* MAGAZINE */

    const magazine =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.11,
                0.25,
                0.14
            ),
            gunMaterial
        );

    magazine.position.set(
        0,
        -0.17,
        -0.16
    );

    magazine.rotation.x =
        -0.12;

    magazine.userData.enemyWeapon = true;

    enemyGun.add(
        magazine
    );


    /* GRIP */

    const grip =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                0.11,
                0.25,
                0.12
            ),
            gunMaterial
        );

    grip.position.set(
        0,
        -0.16,
        0.08
    );

    grip.rotation.x =
        -0.18;

    grip.userData.enemyWeapon = true;

    enemyGun.add(
        grip
    );


    enemyGun.position.set(
        0.38,
        1.35,
        -0.35
    );

    enemyGun.rotation.x =
        -0.08;


    return enemyGun;
}


/* =========================================================
   CREATE ENEMY
========================================================= */

function createEnemy(
    x,
    z
) {

    const enemy =
        new THREE.Group();

    enemy.position.set(
        x,
        0,
        z
    );


    const enemyBodyMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x161a14,
            roughness: 0.85
        });


    const enemySkinMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xb8794c,
            roughness: 0.9
        });


    /* BODY */

    const body =
        new THREE.Mesh(
            new THREE.CapsuleGeometry(
                0.55,
                1.2,
                6,
                10
            ),
            enemyBodyMaterial
        );

    body.position.y =
        1.35;

    body.castShadow = true;

    body.userData.hitZone =
        "body";

    enemy.add(
        body
    );


    /* HEAD */

    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.45,
                16,
                12
            ),
            enemySkinMaterial
        );

    head.position.y =
        2.55;

    head.castShadow = true;

    head.userData.hitZone =
        "head";

    enemy.add(
        head
    );


    /* LEGS */

    for (
        const lx of [
            -0.23,
            0.23
        ]
    ) {

        const leg =
            new THREE.Mesh(
                new THREE.CylinderGeometry(
                    0.17,
                    0.2,
                    0.9,
                    8
                ),
                enemyBodyMaterial
            );

        leg.position.set(
            lx,
            0.45,
            0
        );

        leg.castShadow = true;

        enemy.add(
            leg
        );

    }


    /* ARMS */

    for (
        const ax of [
            -0.75,
            0.75
        ]
    ) {

        const arm =
            new THREE.Mesh(
                new THREE.CapsuleGeometry(
                    0.17,
                    0.75,
                    5,
                    8
                ),
                enemyBodyMaterial
            );

        arm.position.set(
            ax,
            1.4,
            0
        );

        arm.rotation.z =
            ax < 0
                ? -0.18
                : 0.18;

        arm.castShadow = true;

        enemy.add(
            arm
        );

    }


    /* =====================================================
       ENEMY GUN
    ===================================================== */

    const enemyGun =
        createEnemyWeapon();

    enemy.add(
        enemyGun
    );


    /* =====================================================
       ENEMY MUZZLE FLASH
    ===================================================== */

    const enemyMuzzleFlash =
        new THREE.Mesh(
            new THREE.ConeGeometry(
                0.12,
                0.40,
                8
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffb52e,
                transparent: true,
                opacity: 0.95
            })
        );

    enemyMuzzleFlash.rotation.x =
        -Math.PI / 2;

    enemyMuzzleFlash.position.set(
        0.38,
        1.35,
        -1.12
    );

    enemyMuzzleFlash.visible =
        false;

    enemy.add(
        enemyMuzzleFlash
    );


    /* =====================================================
       ENEMY MUZZLE LIGHT
    ===================================================== */

    const enemyMuzzleLight =
        new THREE.PointLight(
            0xff9d27,
            0,
            4
        );

    enemyMuzzleLight.position.set(
        0.38,
        1.35,
        -1.08
    );

    enemy.add(
        enemyMuzzleLight
    );


    /* =====================================================
       ENEMY STATE
    ===================================================== */

    enemy.userData = {

        health: 100,

        alive: true,

        speed:
            0.7 +
            Math.random() *
            0.35,

        direction:
            Math.random() *
            Math.PI *
            2,

        turnTimer:
            2 +
            Math.random() *
            4,

        state:
            "patrol",

        ammo:
            8,

        maxAmmo:
            8,

        attackCooldown:
            Math.random() * 1.5,

        reloadCooldown:
            0,

        detectionRange:
            32,

        attackRange:
            25,

        searchTimer:
            0,

        lastKnownPlayerPosition:
            new THREE.Vector3(),

        muzzleFlash:
            enemyMuzzleFlash,

        muzzleLight:
            enemyMuzzleLight

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


    scene.add(
        enemy
    );

    enemies.push(
        enemy
    );

}


/* =========================================================
   CREATE SIX ENEMIES
========================================================= */

createEnemy(
    -14,
    -10
);

createEnemy(
    14,
    -11
);

createEnemy(
    -17,
    -27
);

createEnemy(
    18,
    -28
);

createEnemy(
    -8,
    -42
);

createEnemy(
    10,
    -45
);


/* =========================================================
   BOMB
========================================================= */

const bomb =
    new THREE.Group();

bomb.position.set(
    0,
    0.8,
    -51
);


const bombBody =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            0.9,
            16,
            12
        ),
        darkMaterial
    );

bombBody.castShadow = true;

bomb.add(
    bombBody
);


const bombLight =
    new THREE.PointLight(
        0xff2020,
        2,
        7
    );

bombLight.position.set(
    0,
    0.4,
    0
);

bomb.add(
    bombLight
);


const bombIndicator =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            0.13,
            8,
            8
        ),
        new THREE.MeshBasicMaterial({
            color: 0xff0000
        })
    );

bombIndicator.position.set(
    0,
    0.9,
    0
);

bomb.add(
    bombIndicator
);

scene.add(
    bomb
);
/* =========================================================
   BOMB DEFUSAL SYSTEM
========================================================= */

let bombDefusalOpen = false;
let bombDefused = false;


/* =========================================================
   CREATE BOMB DEFUSAL UI
========================================================= */

const bombUI =
    document.createElement("div");

bombUI.style.position = "fixed";
bombUI.style.left = "50%";
bombUI.style.top = "50%";
bombUI.style.transform = "translate(-50%, -50%)";
bombUI.style.width = "520px";
bombUI.style.padding = "28px";
bombUI.style.background = "rgba(5, 8, 12, 0.97)";
bombUI.style.border = "2px solid #ff3030";
bombUI.style.borderRadius = "12px";
bombUI.style.color = "white";
bombUI.style.fontFamily = "Arial, sans-serif";
bombUI.style.textAlign = "center";
bombUI.style.zIndex = "9999";
bombUI.style.display = "none";
bombUI.style.boxShadow =
    "0 0 40px rgba(255, 0, 0, 0.35)";


bombUI.innerHTML = `

    <div style="
        font-size:26px;
        font-weight:bold;
        color:#ff4040;
        margin-bottom:8px;
    ">
        BOMB DEFUSAL
    </div>

    <div style="
        font-size:14px;
        color:#aaa;
        margin-bottom:20px;
    ">
        Trace the electrical signal and isolate the active circuit.
    </div>

    <div id="bombCircuit"
         style="
            position:relative;
            height:190px;
            margin-bottom:20px;
         ">

        <div style="
            position:absolute;
            left:20px;
            top:78px;
            width:80px;
            height:30px;
            border:2px solid #777;
            border-radius:6px;
            display:flex;
            align-items:center;
            justify-content:center;
            font-size:12px;
        ">
            POWER
        </div>


        <div id="circuitNode1"
             style="
                position:absolute;
                left:150px;
                top:70px;
                width:48px;
                height:48px;
                border:3px solid #888;
                border-radius:50%;
                display:flex;
                align-items:center;
                justify-content:center;
             ">
            1
        </div>


        <div id="circuitNode2"
             style="
                position:absolute;
                left:250px;
                top:25px;
                width:48px;
                height:48px;
                border:3px solid #888;
                border-radius:50%;
                display:flex;
                align-items:center;
                justify-content:center;
             ">
            2
        </div>


        <div id="circuitNode3"
             style="
                position:absolute;
                left:250px;
                top:115px;
                width:48px;
                height:48px;
                border:3px solid #888;
                border-radius:50%;
                display:flex;
                align-items:center;
                justify-content:center;
             ">
            3
        </div>


        <div id="circuitNode4"
             style="
                position:absolute;
                left:360px;
                top:70px;
                width:48px;
                height:48px;
                border:3px solid #888;
                border-radius:50%;
                display:flex;
                align-items:center;
                justify-content:center;
             ">
            4
        </div>

    </div>


    <div id="bombStatus"
         style="
            min-height:24px;
            margin-bottom:18px;
            color:#ffd166;
            font-size:15px;
         ">
        TRACE THE SIGNAL
    </div>


    <button id="bombClose"
            style="
                padding:10px 22px;
                background:#222;
                color:white;
                border:1px solid #666;
                border-radius:6px;
                cursor:pointer;
            ">
        CANCEL
    </button>

`;


document.body.appendChild(
    bombUI
);


/* =========================================================
   BOMB UI ELEMENTS
========================================================= */

const bombStatus =
    bombUI.querySelector(
        "#bombStatus"
    );

const bombClose =
    bombUI.querySelector(
        "#bombClose"
    );


const circuitNodes = [

    bombUI.querySelector(
        "#circuitNode1"
    ),

    bombUI.querySelector(
        "#circuitNode2"
    ),

    bombUI.querySelector(
        "#circuitNode3"
    ),

    bombUI.querySelector(
        "#circuitNode4"
    )

];


/* =========================================================
   BOMB PUZZLE
========================================================= */

let currentCircuitStep = 0;

const correctCircuit =
    [1, 3, 4, 2];


function resetBombPuzzle() {

    currentCircuitStep = 0;

    bombStatus.textContent =
        "TRACE THE SIGNAL";

    bombStatus.style.color =
        "#ffd166";


    for (
        const node of circuitNodes
    ) {

        node.style.background =
            "transparent";

        node.style.borderColor =
            "#888";

        node.style.color =
            "white";

    }

}


/* =========================================================
   CIRCUIT NODE CLICK
========================================================= */

circuitNodes.forEach(
    (node, index) => {

        node.style.cursor =
            "pointer";


        node.addEventListener(
            "click",
            () => {

                if (
                    !bombDefusalOpen
                ) {
                    return;
                }


                const selected =
                    index + 1;


                const expected =
                    correctCircuit[
                    currentCircuitStep
                    ];


                if (
                    selected === expected
                ) {

                    node.style.background =
                        "rgba(0, 220, 100, 0.25)";

                    node.style.borderColor =
                        "#00ff88";

                    node.style.color =
                        "#00ff88";


                    currentCircuitStep++;


                    if (
                        currentCircuitStep >=
                        correctCircuit.length
                    ) {

                        bombStatus.textContent =
                            "CIRCUIT ISOLATED — BOMB DEFUSED";

                        bombStatus.style.color =
                            "#00ff88";


                        bombDefused = true;

                        bombDefusalOpen = false;


                        setTimeout(
                            () => {

                                bombUI.style.display =
                                    "none";

                                bombLight.intensity =
                                    0;

                                bombIndicator.visible =
                                    false;

                                statusText.textContent =
                                    "BOMB DEFUSED";

                            },
                            1000
                        );

                    }
                    else {

                        bombStatus.textContent =
                            "SIGNAL TRACED — CONTINUE";

                    }

                }
                else {

                    bombStatus.textContent =
                        "WRONG CIRCUIT — SIGNAL LOST";

                    bombStatus.style.color =
                        "#ff4040";


                    currentCircuitStep = 0;


                    for (
                        const n of circuitNodes
                    ) {

                        n.style.background =
                            "transparent";

                        n.style.borderColor =
                            "#888";

                        n.style.color =
                            "white";

                    }

                }

            }
        );

    }
);


/* =========================================================
   CLOSE BOMB UI
========================================================= */

bombClose.addEventListener(
    "click",
    () => {

        closeBombDefusal();

    }
);


/* =========================================================
   OPEN BOMB DEFUSAL
========================================================= */

function openBombDefusal() {

    if (
        bombDefused
    ) {
        return;
    }


    const playerPosition =
        camera.position;


    const bombWorldPosition =
        new THREE.Vector3();


    bomb.getWorldPosition(
        bombWorldPosition
    );


    const distance =
        playerPosition.distanceTo(
            bombWorldPosition
        );


    if (
        distance > 5
    ) {

        statusText.textContent =
            "MOVE CLOSER TO THE BOMB";

        return;

    }


    bombDefusalOpen = true;

    bombUI.style.display =
        "block";


    resetBombPuzzle();


    statusText.textContent =
        "BOMB DEFUSAL ACTIVE";

}


/* =========================================================
   CLOSE BOMB DEFUSAL
========================================================= */

function closeBombDefusal() {

    bombDefusalOpen = false;

    bombUI.style.display =
        "none";


    if (
        !bombDefused
    ) {

        statusText.textContent =
            "BOMB DEFUSAL CANCELLED";

    }

}

/* =========================================================
   PLAYER RIFLE
========================================================= */

const weapon =
    new THREE.Group();


weapon.position.set(
    0.42,
    -0.38,
    -0.85
);


weapon.rotation.set(
    -0.03,
    -0.03,
    0
);


/* =========================================================
   RIFLE MATERIALS
========================================================= */

const rifleBlack =
    new THREE.MeshStandardMaterial({

        color: 0x17191b,

        metalness: 0.85,

        roughness: 0.25

    });


const rifleDark =
    new THREE.MeshStandardMaterial({

        color: 0x292d30,

        metalness: 0.75,

        roughness: 0.3

    });


const rifleGrip =
    new THREE.MeshStandardMaterial({

        color: 0x111315,

        metalness: 0.25,

        roughness: 0.55

    });


const handMaterial =
    new THREE.MeshStandardMaterial({

        color: 0xb8794c,

        roughness: 0.9

    });


const sleeveMaterial =
    new THREE.MeshStandardMaterial({

        color: 0x252a23,

        roughness: 0.95

    });


/* =========================================================
   RECEIVER
========================================================= */

const receiver =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.48,
            0.32,
            0.78
        ),
        rifleDark
    );

receiver.position.set(
    0,
    0.04,
    -0.15
);

receiver.castShadow = true;

weapon.add(
    receiver
);


/* =========================================================
   LOWER BODY
========================================================= */

const rifleBody =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.42,
            0.24,
            1.35
        ),
        rifleBlack
    );

rifleBody.position.set(
    0,
    -0.02,
    0.38
);

rifleBody.castShadow = true;

weapon.add(
    rifleBody
);


/* =========================================================
   HANDGUARD
========================================================= */

const handguard =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.36,
            0.25,
            0.82
        ),
        rifleDark
    );

handguard.position.set(
    0,
    0.02,
    -0.88
);

handguard.castShadow = true;

weapon.add(
    handguard
);


/* =========================================================
   BARREL
========================================================= */

const barrel =
    new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.055,
            0.065,
            1.25,
            12
        ),
        rifleDark
    );

barrel.rotation.x =
    Math.PI / 2;

barrel.position.set(
    0,
    0.08,
    -1.48
);

barrel.castShadow = true;

weapon.add(
    barrel
);


/* =========================================================
   MUZZLE
========================================================= */

const muzzle =
    new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.09,
            0.09,
            0.25,
            12
        ),
        rifleBlack
    );

muzzle.rotation.x =
    Math.PI / 2;

muzzle.position.set(
    0,
    0.08,
    -2.05
);

muzzle.castShadow = true;

weapon.add(
    muzzle
);


/* =========================================================
   MAGAZINE
========================================================= */

const magazine =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.23,
            0.68,
            0.38
        ),
        rifleGrip
    );

magazine.position.set(
    0,
    -0.42,
    0.20
);

magazine.rotation.x =
    -0.22;

magazine.castShadow = true;

weapon.add(
    magazine
);


/* =========================================================
   STOCK
========================================================= */

const stock =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.34,
            0.30,
            0.72
        ),
        rifleGrip
    );

stock.position.set(
    0,
    -0.02,
    1.12
);

stock.castShadow = true;

weapon.add(
    stock
);


/* =========================================================
   STOCK PAD
========================================================= */

const stockPad =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.37,
            0.32,
            0.12
        ),
        rifleBlack
    );

stockPad.position.set(
    0,
    -0.02,
    1.47
);

weapon.add(
    stockPad
);


/* =========================================================
   FRONT SIGHT
========================================================= */

const sight =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.065,
            0.18,
            0.065
        ),
        rifleDark
    );

sight.position.set(
    0,
    0.27,
    -1.22
);

weapon.add(
    sight
);


/* =========================================================
   REAR SIGHT
========================================================= */

const rearSight =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.16,
            0.12,
            0.12
        ),
        rifleBlack
    );

rearSight.position.set(
    0,
    0.24,
    -0.12
);

weapon.add(
    rearSight
);


/* =========================================================
   PISTOL GRIP
========================================================= */

const pistolGrip =
    new THREE.Mesh(
        new THREE.BoxGeometry(
            0.24,
            0.48,
            0.28
        ),
        rifleGrip
    );

pistolGrip.position.set(
    0,
    -0.30,
    0.53
);

pistolGrip.rotation.x =
    -0.18;

weapon.add(
    pistolGrip
);


/* =========================================================
   LEFT ARM
========================================================= */

const leftArm =
    new THREE.Group();

leftArm.position.set(
    -0.27,
    -0.34,
    -0.82
);

leftArm.rotation.set(
    -0.45,
    0.10,
    0.18
);


const leftForearm =
    new THREE.Mesh(
        new THREE.CapsuleGeometry(
            0.14,
            0.60,
            8,
            10
        ),
        sleeveMaterial
    );

leftForearm.position.set(
    0,
    -0.05,
    0.02
);

leftForearm.rotation.z =
    -0.15;

leftForearm.castShadow = true;

leftArm.add(
    leftForearm
);


const leftWrist =
    new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.13,
            0.15,
            0.20,
            10
        ),
        handMaterial
    );

leftWrist.position.set(
    0,
    0.28,
    -0.03
);

leftWrist.rotation.x =
    Math.PI / 2;

leftArm.add(
    leftWrist
);


const leftHand =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            0.17,
            12,
            10
        ),
        handMaterial
    );

leftHand.scale.set(
    1,
    0.75,
    1.15
);

leftHand.position.set(
    0,
    0.38,
    -0.08
);

leftHand.castShadow = true;

leftArm.add(
    leftHand
);


weapon.add(
    leftArm
);


/* =========================================================
   RIGHT ARM
========================================================= */

const rightArm =
    new THREE.Group();

rightArm.position.set(
    0.31,
    -0.35,
    -0.67
);

rightArm.rotation.set(
    -0.40,
    -0.12,
    -0.16
);


const rightForearm =
    new THREE.Mesh(
        new THREE.CapsuleGeometry(
            0.14,
            0.60,
            8,
            10
        ),
        sleeveMaterial
    );

rightForearm.position.set(
    0,
    -0.05,
    0.02
);

rightForearm.rotation.z =
    0.16;

rightForearm.castShadow = true;

rightArm.add(
    rightForearm
);


const rightWrist =
    new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.13,
            0.15,
            0.20,
            10
        ),
        handMaterial
    );

rightWrist.position.set(
    0,
    0.28,
    -0.03
);

rightWrist.rotation.x =
    Math.PI / 2;

rightArm.add(
    rightWrist
);


const rightHand =
    new THREE.Mesh(
        new THREE.SphereGeometry(
            0.17,
            12,
            10
        ),
        handMaterial
    );

rightHand.scale.set(
    1,
    0.75,
    1.15
);

rightHand.position.set(
    0,
    0.38,
    -0.08
);

rightHand.castShadow = true;

rightArm.add(
    rightHand
);


weapon.add(
    rightArm
);


/* =========================================================
   ADD WEAPON TO CAMERA
========================================================= */

camera.add(
    weapon
);

weapon.visible = true;


/* =========================================================
   PLAYER MUZZLE FLASH
========================================================= */

const muzzleFlash =
    new THREE.Mesh(
        new THREE.ConeGeometry(
            0.16,
            0.55,
            8
        ),
        new THREE.MeshBasicMaterial({
            color: 0xffb52e,
            transparent: true,
            opacity: 0.9
        })
    );

muzzleFlash.rotation.x =
    -Math.PI / 2;

muzzleFlash.position.set(
    0,
    0.08,
    -2.25
);

muzzleFlash.visible =
    false;

weapon.add(
    muzzleFlash
);


const muzzleLight =
    new THREE.PointLight(
        0xff9d27,
        0,
        5
    );

muzzleLight.position.set(
    0,
    0.08,
    -2.15
);

weapon.add(
    muzzleLight
);


/* =========================================================
   SHOOTING
========================================================= */

const raycaster =
    new THREE.Raycaster();

let score = 0;

let canShoot = true;

let muzzleFlashTimer = 0;


/* =========================================================
   ENEMY ALERT
========================================================= */

function alertNearbyEnemies(
    position
) {

    for (
        const enemy of enemies
    ) {

        if (
            !enemy.userData.alive
        ) {
            continue;
        }


        const distance =
            enemy.position.distanceTo(
                position
            );


        if (
            distance <= 45
        ) {

            enemy.userData.state =
                "investigate";

            enemy.userData.lastKnownPlayerPosition
                .copy(position);

            enemy.userData.searchTimer =
                8;

        }

    }

}


/* =========================================================
   SHOOT
========================================================= */

function shoot() {

    if (
        !controls.isLocked ||
        playerDead
    ) {

        return;

    }


    if (
        !canShoot
    ) {

        return;

    }


    canShoot = false;


    setTimeout(
        () => {

            canShoot = true;

        },
        180
    );


    /* RECOIL */

    weapon.position.z =
        -0.72;

    weapon.rotation.x =
        -0.08;


    setTimeout(
        () => {

            weapon.position.z =
                -0.85;

            weapon.rotation.x =
                -0.03;

        },
        90
    );


    /* MUZZLE FLASH */

    muzzleFlash.visible =
        true;

    muzzleLight.intensity =
        5;

    muzzleFlashTimer =
        0.06;


    /* ALERT ENEMIES */

    alertNearbyEnemies(
        camera.position
    );


    /* RAY */

    raycaster.setFromCamera(
        new THREE.Vector2(
            0,
            0
        ),
        camera
    );


    /* ENEMY MESHES */

    const enemyObjects = [];


    for (
        const enemy of enemies
    ) {

        if (
            !enemy.userData.alive
        ) {

            continue;

        }


        enemy.traverse(
            child => {

                if (
                    child.isMesh
                ) {

                    child.userData.enemy =
                        enemy;

                    enemyObjects.push(
                        child
                    );

                }

            }
        );

    }


    const hits =
        raycaster.intersectObjects(
            enemyObjects,
            false
        );


    /*
        Find an actual body/head hit.

        This prevents shooting an enemy's
        rifle from counting as a body shot.
    */

    let validHit = null;


    for (
        const hit of hits
    ) {

        if (
            hit.object.userData.hitZone ===
            "head" ||

            hit.object.userData.hitZone ===
            "body"
        ) {

            validHit =
                hit;

            break;

        }

    }


    /* MISS */

    if (
        !validHit
    ) {

        score -= 1;

        updateHUD();

        return;

    }


    const hit =
        validHit;

    const enemy =
        hit.object.userData.enemy;


    if (!enemy) {

        return;

    }


    /* HEADSHOT */

    if (
        hit.object.userData.hitZone ===
        "head"
    ) {

        score += 15;

        killEnemy(
            enemy
        );

    }


    /* BODY SHOT */

    else {

        score += 5;

        enemy.userData.health -=
            50;


        if (
            enemy.userData.health <=
            0
        ) {

            killEnemy(
                enemy
            );

        }

    }


    updateHUD();

}


/* =========================================================
   KILL ENEMY
========================================================= */

function killEnemy(
    enemy
) {

    if (
        !enemy.userData.alive
    ) {

        return;

    }


    enemy.userData.alive =
        false;

    enemy.userData.state =
        "dead";

    enemy.visible =
        false;

}


/* =========================================================
   PLAYER DAMAGE
========================================================= */

function damagePlayer(
    amount
) {

    if (
        playerDead
    ) {

        return;

    }


    playerHealth -=
        amount;


    playerHealth =
        Math.max(
            0,
            playerHealth
        );


    updateHealthHUD();


    /* DAMAGE FLASH */

    const flash =
        document.getElementById(
            "damage-flash"
        );


    if (
        flash
    ) {

        flash.style.background =
            "rgba(255,0,0,0.30)";


        setTimeout(
            () => {

                flash.style.background =
                    "rgba(255,0,0,0)";

            },
            100
        );

    }


    if (
        playerHealth <=
        0
    ) {

        killPlayer();

    }

}


/* =========================================================
   HEALTH HUD
========================================================= */

function updateHealthHUD() {

    const fill =
        document.getElementById(
            "health-fill"
        );

    const number =
        document.getElementById(
            "health-number"
        );


    if (
        !fill ||
        !number
    ) {

        return;

    }


    const percentage =
        playerHealth /
        PLAYER_MAX_HEALTH *
        100;


    fill.style.width =
        `${percentage}%`;


    number.textContent =
        Math.ceil(
            playerHealth
        );


    if (
        percentage <= 25
    ) {

        fill.style.background =
            "#ff3333";

    }

    else if (
        percentage <= 50
    ) {

        fill.style.background =
            "#ffb52e";

    }

    else {

        fill.style.background =
            "#42e66b";

    }

}


/* =========================================================
   PLAYER DEATH
========================================================= */

function killPlayer() {

    if (
        playerDead
    ) {

        return;

    }


    playerDead =
        true;


    if (
        controls.isLocked
    ) {

        controls.unlock();

    }


    const deathScreen =
        document.getElementById(
            "death-screen"
        );


    if (
        deathScreen
    ) {

        deathScreen.style.display =
            "flex";

    }


    statusText.textContent =
        "YOU DIED";

}


/* =========================================================
   LEFT CLICK
========================================================= */

window.addEventListener(
    "mousedown",
    event => {

        if (
            event.button === 0
        ) {

            shoot();

        }

    }
);


/* =========================================================
   KEYBOARD
========================================================= */

const keys = {};


window.addEventListener(
    "keydown",
    event => {

        keys[
            event.code
        ] = true;


        /* =====================================================
           E — BOMB DEFUSE
        ===================================================== */

        if (
            event.code === "KeyE"
        ) {

            event.preventDefault();

            console.log("E pressed");

            if (
                typeof openBombDefusal === "function"
            ) {

                openBombDefusal();

            }

        }


        /* =====================================================
           SPACE — JUMP
        ===================================================== */

        if (
            event.code ===
            "Space"
        ) {

            event.preventDefault();

        }

    }
);


window.addEventListener(
    "keyup",
    event => {

        keys[
            event.code
        ] = false;

    }
);


/* =========================================================
   PLAYER MOVEMENT
========================================================= */

let velocityY = 0;

let canJump = true;

const playerHeight =
    2;

const normalSpeed =
    7;

const sprintSpeed =
    12;


/* =========================================================
   HOUSE COLLISION
========================================================= */

function collidesWithHouse(
    x,
    z
) {

    for (
        const house of houseCollisions
    ) {

        const padding =
            1.2;


        if (

            x >
            house.x -
            house.width / 2 -
            padding

            &&

            x <
            house.x +
            house.width / 2 +
            padding

            &&

            z >
            house.z -
            house.depth / 2 -
            padding

            &&

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


/* =========================================================
   PLAYER UPDATE
========================================================= */

function updatePlayer(
    delta
) {

    if (
        !controls.isLocked ||
        playerDead
    ) {

        return;

    }


    const speed =
        keys["ShiftLeft"] ||
            keys["ShiftRight"]
            ? sprintSpeed
            : normalSpeed;


    let moveX = 0;

    let moveZ = 0;


    if (
        keys["KeyW"]
    ) {

        moveZ += 1;

    }


    if (
        keys["KeyS"]
    ) {

        moveZ -= 1;

    }


    if (
        keys["KeyA"]
    ) {

        moveX -= 1;

    }


    if (
        keys["KeyD"]
    ) {

        moveX += 1;

    }


    if (
        moveX !== 0 ||
        moveZ !== 0
    ) {

        const length =
            Math.sqrt(
                moveX *
                moveX +
                moveZ *
                moveZ
            );


        moveX /=
            length;

        moveZ /=
            length;


        const oldX =
            camera.position.x;

        const oldZ =
            camera.position.z;


        controls.moveRight(
            moveX *
            speed *
            delta
        );


        controls.moveForward(
            moveZ *
            speed *
            delta
        );


        if (
            collidesWithHouse(
                camera.position.x,
                camera.position.z
            )
        ) {

            camera.position.x =
                oldX;

            camera.position.z =
                oldZ;

        }

    }


    /* GRAVITY */

    velocityY -=
        20 *
        delta;


    camera.position.y +=
        velocityY *
        delta;


    if (
        camera.position.y <=
        playerHeight
    ) {

        camera.position.y =
            playerHeight;

        velocityY =
            0;

        canJump =
            true;

    }


    /* JUMP */

    if (
        keys["Space"] &&
        canJump
    ) {

        velocityY =
            8;

        canJump =
            false;

    }

}


/* =========================================================
   ENEMY VISION
========================================================= */

const enemyVisionRaycaster =
    new THREE.Raycaster();


function enemyCanSeePlayer(
    enemy
) {

    if (
        playerDead
    ) {

        return false;

    }


    const enemyPosition =
        new THREE.Vector3();

    enemy.getWorldPosition(
        enemyPosition
    );

    enemyPosition.y +=
        1.35;


    const playerPosition =
        camera.position.clone();


    const distance =
        enemyPosition.distanceTo(
            playerPosition
        );


    if (
        distance >
        enemy.userData.detectionRange
    ) {

        return false;

    }


    const direction =
        playerPosition
            .sub(enemyPosition)
            .normalize();


    /* FIELD OF VIEW */

    const forward =
        new THREE.Vector3(
            0,
            0,
            -1
        );


    forward.applyQuaternion(
        enemy.quaternion
    );


    forward.normalize();


    const angle =
        forward.angleTo(
            direction
        );


    if (
        angle >
        THREE.MathUtils.degToRad(
            65
        )
    ) {

        return false;

    }


    /* ENVIRONMENT BLOCKING */

    enemyVisionRaycaster.set(
        enemyPosition,
        direction
    );


    const hits =
        enemyVisionRaycaster.intersectObjects(
            environmentMeshes,
            false
        );


    if (
        hits.length > 0 &&
        hits[0].distance <
        distance - 0.5
    ) {

        return false;

    }


    return true;

}


/* =========================================================
   ENEMY SHOOTING
========================================================= */

const enemyShotRaycaster =
    new THREE.Raycaster();


function enemyShoot(
    enemy
) {

    if (
        playerDead ||
        !enemy.userData.alive
    ) {

        return;

    }


    const data =
        enemy.userData;


    if (
        data.attackCooldown >
        0
    ) {

        return;

    }


    if (
        data.reloadCooldown >
        0
    ) {

        return;

    }


    /* RELOAD */

    if (
        data.ammo <= 0
    ) {

        data.reloadCooldown =
            2.0;

        return;

    }


    const origin =
        new THREE.Vector3();

    enemy.getWorldPosition(
        origin
    );

    origin.y +=
        1.35;


    const target =
        camera.position.clone();


    const direction =
        target
            .sub(origin)
            .normalize();


    /*
        Small random inaccuracy.

        This makes enemies dangerous,
        but not perfectly accurate.
    */

    direction.x +=
        (
            Math.random() -
            0.5
        ) * 0.025;

    direction.y +=
        (
            Math.random() -
            0.5
        ) * 0.025;

    direction.z +=
        (
            Math.random() -
            0.5
        ) * 0.025;


    direction.normalize();


    enemyShotRaycaster.set(
        origin,
        direction
    );


    /* ENVIRONMENT */

    const environmentHits =
        enemyShotRaycaster
            .intersectObjects(
                environmentMeshes,
                false
            );


    const playerDistance =
        origin.distanceTo(
            camera.position
        );


    let blocked = false;


    if (
        environmentHits.length > 0 &&
        environmentHits[0].distance <
        playerDistance
    ) {

        blocked = true;

    }


    /* AMMO */

    data.ammo--;


    /*
        Enemy fires roughly once
        every 1 to 1.7 seconds.
    */

    data.attackCooldown =
        1.0 +
        Math.random() *
        0.7;


    /* MUZZLE */

    showEnemyMuzzleFlash(
        enemy
    );


    /* HIT */

    if (
        !blocked
    ) {

        const distance =
            origin.distanceTo(
                camera.position
            );


        if (
            distance <= 12
        ) {

            damagePlayer(
                18
            );

        }

        else if (
            distance <= 25
        ) {

            damagePlayer(
                12
            );

        }

        else {

            damagePlayer(
                7
            );

        }

    }

}


/* =========================================================
   ENEMY MUZZLE FLASH
========================================================= */

function showEnemyMuzzleFlash(
    enemy
) {

    const flash =
        enemy.userData.muzzleFlash;

    const light =
        enemy.userData.muzzleLight;


    if (
        !flash ||
        !light
    ) {

        return;

    }


    flash.visible =
        true;

    light.intensity =
        4;


    setTimeout(
        () => {

            flash.visible =
                false;

            light.intensity =
                0;

        },
        70
    );

}


/* =========================================================
   ENEMY MOVEMENT TOWARD TARGET
========================================================= */

function moveEnemyToward(
    enemy,
    target,
    delta,
    speedMultiplier = 1
) {

    const data =
        enemy.userData;


    const dx =
        target.x -
        enemy.position.x;

    const dz =
        target.z -
        enemy.position.z;


    const distance =
        Math.sqrt(
            dx * dx +
            dz * dz
        );


    if (
        distance <
        0.8
    ) {

        return;

    }


    const direction =
        Math.atan2(
            dx,
            dz
        );


    enemy.rotation.y =
        direction +
        Math.PI;


    enemy.position.x +=
        Math.sin(direction) *
        data.speed *
        speedMultiplier *
        delta;


    enemy.position.z +=
        Math.cos(direction) *
        data.speed *
        speedMultiplier *
        delta;


    enemy.position.x =
        THREE.MathUtils.clamp(
            enemy.position.x,
            -38,
            38
        );


    enemy.position.z =
        THREE.MathUtils.clamp(
            enemy.position.z,
            -55,
            -5
        );

}


/* =========================================================
   ENEMY AI
========================================================= */

function updateEnemies(
    delta
) {
    if (window.__enhancedEnemyAI) {
        return;
    }

    for (
        const enemy of enemies
    ) {

        if (
            !enemy.userData.alive
        ) {

            continue;

        }


        const data =
            enemy.userData;


        /* TIMERS */

        if (
            data.attackCooldown >
            0
        ) {

            data.attackCooldown -=
                delta;

        }


        if (
            data.reloadCooldown >
            0
        ) {

            data.reloadCooldown -=
                delta;


            if (
                data.reloadCooldown <=
                0
            ) {

                data.ammo =
                    data.maxAmmo;

            }

        }


        if (
            data.searchTimer >
            0
        ) {

            data.searchTimer -=
                delta;

        }


        /* =================================================
           CAN SEE PLAYER
        ================================================= */

        const seesPlayer =
            enemyCanSeePlayer(
                enemy
            );


        if (
            seesPlayer
        ) {

            data.state =
                "attack";

            data.lastKnownPlayerPosition
                .copy(
                    camera.position
                );

            data.searchTimer =
                8;

        }


        /* =================================================
           PATROL
        ================================================= */

        if (
            data.state ===
            "patrol"
        ) {

            data.turnTimer -=
                delta;


            if (
                data.turnTimer <=
                0
            ) {

                data.direction +=
                    (
                        Math.random() -
                        0.5
                    ) * 2;


                data.turnTimer =
                    2 +
                    Math.random() *
                    4;

            }


            const direction =
                data.direction;


            enemy.position.x +=
                Math.sin(
                    direction
                ) *
                data.speed *
                delta;


            enemy.position.z +=
                Math.cos(
                    direction
                ) *
                data.speed *
                delta;


            enemy.position.x =
                THREE.MathUtils.clamp(
                    enemy.position.x,
                    -38,
                    38
                );


            enemy.position.z =
                THREE.MathUtils.clamp(
                    enemy.position.z,
                    -55,
                    -5
                );


            enemy.rotation.y =
                direction +
                Math.PI;

        }


        /* =================================================
           INVESTIGATE
        ================================================= */

        else if (
            data.state ===
            "investigate"
        ) {

            moveEnemyToward(
                enemy,
                data.lastKnownPlayerPosition,
                delta,
                1.25
            );


            /*
                If enemy reaches the location
                and can't see player, search.
            */

            const distance =
                enemy.position.distanceTo(
                    data.lastKnownPlayerPosition
                );


            if (
                distance < 2
            ) {

                data.state =
                    "search";

                data.searchTimer =
                    6;

            }

        }


        /* =================================================
           ATTACK
        ================================================= */

        else if (
            data.state ===
            "attack"
        ) {

            const distance =
                enemy.position.distanceTo(
                    camera.position
                );


            /*
                Keep enough distance instead
                of running directly into player.
            */

            if (
                distance >
                data.attackRange
            ) {

                moveEnemyToward(
                    enemy,
                    camera.position,
                    delta,
                    1.15
                );

            }


            /*
                Always face player.
            */

            const target =
                camera.position.clone();

            target.y =
                enemy.position.y;


            enemy.lookAt(
                target
            );


            /*
                Shoot when close enough.
            */

            if (
                distance <=
                data.attackRange
            ) {

                enemyShoot(
                    enemy
                );

            }


            /*
                If player is lost,
                search around last position.
            */

            if (
                !seesPlayer
            ) {

                data.state =
                    "search";

                data.searchTimer =
                    7;

            }

        }


        /* =================================================
           SEARCH
        ================================================= */

        else if (
            data.state ===
            "search"
        ) {

            /*
                Search around the last known
                location.
            */

            const searchTarget =
                data.lastKnownPlayerPosition.clone();


            searchTarget.x +=
                Math.sin(
                    performance.now() *
                    0.0008
                ) * 3;


            searchTarget.z +=
                Math.cos(
                    performance.now() *
                    0.0008
                ) * 3;


            moveEnemyToward(
                enemy,
                searchTarget,
                delta,
                0.8
            );


            if (
                seesPlayer
            ) {

                data.state =
                    "attack";

                data.searchTimer =
                    8;

            }


            if (
                data.searchTimer <=
                0
            ) {

                data.state =
                    "patrol";

                data.turnTimer =
                    1;

            }

        }

    }

}


/* =========================================================
   BOMB BLINK
========================================================= */

let blinkTimer =
    0;


function updateBomb(
    delta
) {

    blinkTimer +=
        delta;


    if (
        blinkTimer >
        0.5
    ) {

        blinkTimer =
            0;


        bombIndicator.visible =
            !bombIndicator.visible;


        bombLight.intensity =
            bombIndicator.visible
                ? 3
                : 0.5;

    }

}


/* =========================================================
   WEAPON UPDATE
========================================================= */

function updateWeapon(
    delta
) {

    if (
        muzzleFlashTimer >
        0
    ) {

        muzzleFlashTimer -=
            delta;

    }


    if (
        muzzleFlashTimer <=
        0
    ) {

        muzzleFlash.visible =
            false;

        muzzleLight.intensity =
            0;

    }


    /* WEAPON BOB */

    if (
        controls.isLocked &&
        !playerDead
    ) {

        const moving =
            keys["KeyW"] ||
            keys["KeyS"] ||
            keys["KeyA"] ||
            keys["KeyD"];


        if (
            moving
        ) {

            weapon.position.y =
                -0.38 +
                Math.sin(
                    performance.now() *
                    0.008
                ) *
                0.008;

        }

        else {

            weapon.position.y =
                -0.38;

        }

    }

}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    levelText.textContent =
        "1";

    scoreText.textContent =
        score;

}


objectiveText.textContent =
    "Locate the bomb";


statusText.textContent =
    "CLICK TO ENTER";


updateHUD();

updateHealthHUD();


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


/* =========================================================
   CLOCK
========================================================= */

const clock =
    new THREE.Clock();


/* =========================================================
   GAME LOOP
========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    const delta =
        Math.min(
            clock.getDelta(),
            0.05
        );


    updatePlayer(
        delta
    );


    updateEnemies(
        delta
    );


    updateBomb(
        delta
    );


    updateWeapon(
        delta
    );


    renderer.render(
        scene,
        camera
    );

}


animate();
export {
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
};

import("./combatEnhancements.js");