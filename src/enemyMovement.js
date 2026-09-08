import * as THREE from "three";

/* =========================================================
   ENEMY MOVEMENT SYSTEM
   Safe movement + obstacle recovery
========================================================= */

function enemyBlocked(x, z) {

    const houses =
        window.houseCollisions || [];

    for (
        const house of houses
    ) {

        const padding = 0.65;

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


/* =========================================================
   CHECK WHETHER A POSITION IS SAFE
========================================================= */

function enemyPositionSafe(
    x,
    z
) {

    if (
        x < -41 ||
        x > 41 ||
        z < -66 ||
        z > -5
    ) {

        return false;

    }

    return !enemyBlocked(
        x,
        z
    );

}


/* =========================================================
   FIND A FREE POSITION AROUND AN OBSTACLE
========================================================= */

function findEscapePosition(
    enemy
) {

    const startX =
        enemy.position.x;

    const startZ =
        enemy.position.z;

    const angles = [
        0,
        Math.PI / 4,
        Math.PI / 2,
        Math.PI * 3 / 4,
        Math.PI,
        Math.PI * 5 / 4,
        Math.PI * 3 / 2,
        Math.PI * 7 / 4
    ];

    const distances = [
        1.5,
        2.5,
        4
    ];

    for (
        const distance of distances
    ) {

        for (
            const angle of angles
        ) {

            const x =
                startX +
                Math.sin(angle) *
                distance;

            const z =
                startZ +
                Math.cos(angle) *
                distance;

            if (
                enemyPositionSafe(
                    x,
                    z
                )
            ) {

                return new THREE.Vector3(
                    x,
                    enemy.position.y,
                    z
                );

            }

        }

    }

    return null;

}


/* =========================================================
   IMPROVED ENEMY MOVEMENT
========================================================= */

function moveEnemySafe(
    enemy,
    target,
    speed,
    delta
) {

    if (
        !enemy ||
        !target
    ) {

        return false;

    }


    const direction =
        target
            .clone()
            .sub(
                enemy.position
            );

    direction.y = 0;


    if (
        direction.lengthSq() <
        0.01
    ) {

        return true;

    }


    direction.normalize();


    const step =
        speed * delta;


    const nextX =
        enemy.position.x +
        direction.x *
        step;

    const nextZ =
        enemy.position.z +
        direction.z *
        step;


    /* =====================================================
       NORMAL MOVEMENT
    ===================================================== */

    if (
        enemyPositionSafe(
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

        /* =================================================
           TRY X ONLY
        ================================================= */

        const xOnly =
            enemy.position.x +
            direction.x *
            step;

        if (
            enemyPositionSafe(
                xOnly,
                enemy.position.z
            )
        ) {

            enemy.position.x =
                xOnly;

        }

        else {

            /* =============================================
               TRY Z ONLY
            ============================================= */

            const zOnly =
                enemy.position.z +
                direction.z *
                step;

            if (
                enemyPositionSafe(
                    enemy.position.x,
                    zOnly
                )
            ) {

                enemy.position.z =
                    zOnly;

            }

            else {

                /* =========================================
                   OBSTACLE ESCAPE
                ========================================= */

                const escape =
                    findEscapePosition(
                        enemy
                    );

                if (escape) {

                    enemy.position.x +=
                        (
                            escape.x -
                            enemy.position.x
                        ) *
                        Math.min(
                            delta * 4,
                            1
                        );

                    enemy.position.z +=
                        (
                            escape.z -
                            enemy.position.z
                        ) *
                        Math.min(
                            delta * 4,
                            1
                        );

                }

                else {

                    return false;

                }

            }

        }

    }


    /* =====================================================
       WORLD BOUNDS
    ===================================================== */

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


    /* =====================================================
       FACE MOVEMENT DIRECTION
    ===================================================== */

    enemy.rotation.y =
        Math.atan2(
            direction.x,
            direction.z
        ) +
        Math.PI;


    return true;

}


export {
    enemyBlocked,
    moveEnemySafe
};