/* =========================================================
   ENEMY PATROL SYSTEM
   Persistent destinations + obstacle recovery
========================================================= */
import * as THREE from "three";
function createPatrolState(enemy) {

    const data =
        enemy.userData;

    if (
        data.patrolInitialized
    ) {
        return;
    }

    data.patrolInitialized =
        true;

    data.patrolDirection =
        Math.random() *
        Math.PI * 2;

    data.patrolTarget =
        null;

    data.patrolTimer =
        0;

    data.patrolPauseTimer =
        0;

    data.patrolBlockedTimer =
        0;
}


/* =========================================================
   CHOOSE NEW DESTINATION
========================================================= */

function choosePatrolTarget(
    enemy
) {

    const data =
        enemy.userData;

    const angle =
        Math.random() *
        Math.PI * 2;

    const distance =
        10 +
        Math.random() * 12;

    const target =
        enemy.position.clone();

    target.x +=
        Math.sin(angle) *
        distance;

    target.z +=
        Math.cos(angle) *
        distance;


    /*
     * Keep patrol destinations
     * inside the village.
     */

    target.x =
        THREE.MathUtils.clamp(
            target.x,
            -37,
            37
        );

    target.z =
        THREE.MathUtils.clamp(
            target.z,
            -61,
            -6
        );


    data.patrolTarget =
        target;

    data.patrolDirection =
        angle;

    data.patrolTimer =
        6 +
        Math.random() * 6;

    data.patrolBlockedTimer =
        0;
}


/* =========================================================
   IMPROVED PATROL
========================================================= */

function patrolEnemyEnhanced(
    enemy,
    delta,
    moveEnemy
) {

    if (
        !enemy ||
        !enemy.userData ||
        !moveEnemy
    ) {
        return;
    }


    const data =
        enemy.userData;


    createPatrolState(
        enemy
    );


    /* -----------------------------------------------------
       SHORT NATURAL PAUSE
    ----------------------------------------------------- */

    if (
        data.patrolPauseTimer >
        0
    ) {

        data.patrolPauseTimer -=
            delta;

        return;
    }


    /* -----------------------------------------------------
       CREATE FIRST DESTINATION
    ----------------------------------------------------- */

    if (
        !data.patrolTarget
    ) {

        choosePatrolTarget(
            enemy
        );

    }


    /* -----------------------------------------------------
       UPDATE TIMER
    ----------------------------------------------------- */

    data.patrolTimer -=
        delta;


    /* -----------------------------------------------------
       CHECK DESTINATION
    ----------------------------------------------------- */

    const distanceToTarget =
        enemy.position.distanceTo(
            data.patrolTarget
        );


    if (
        distanceToTarget < 2 ||
        data.patrolTimer <= 0
    ) {

        /*
         * Occasionally pause before
         * choosing the next route.
         */

        if (
            Math.random() <
            0.15
        ) {

            data.patrolPauseTimer =
                0.6 +
                Math.random() *
                1.2;

        }


        choosePatrolTarget(
            enemy
        );

        return;
    }


    /* -----------------------------------------------------
       MOVE TOWARD DESTINATION
    ----------------------------------------------------- */

    const previousX =
        enemy.position.x;

    const previousZ =
        enemy.position.z;


    const patrolSpeed =
        data.speed *
        0.85;


    moveEnemy(
        enemy,
        data.patrolTarget,
        patrolSpeed,
        delta
    );


    /* -----------------------------------------------------
       DETECT IF BLOCKED
    ----------------------------------------------------- */

    const movedDistance =
        Math.hypot(
            enemy.position.x -
            previousX,

            enemy.position.z -
            previousZ
        );


    if (
        movedDistance < 0.005
    ) {

        data.patrolBlockedTimer +=
            delta;

    }
    else {

        data.patrolBlockedTimer =
            0;

    }


    /* -----------------------------------------------------
       STUCK RECOVERY
    ----------------------------------------------------- */

    if (
        data.patrolBlockedTimer >
        0.35
    ) {

        data.patrolBlockedTimer =
            0;

        /*
         * Immediately abandon the blocked
         * route and select another direction.
         */

        choosePatrolTarget(
            enemy
        );

        return;
    }


    /* -----------------------------------------------------
       FACE MOVEMENT DIRECTION
    ----------------------------------------------------- */

    const dx =
        data.patrolTarget.x -
        enemy.position.x;

    const dz =
        data.patrolTarget.z -
        enemy.position.z;


    if (
        Math.abs(dx) +
        Math.abs(dz) >
        0.05
    ) {

        const desiredRotation =
            Math.atan2(
                dx,
                dz
            );


        let difference =
            desiredRotation -
            enemy.rotation.y;


        while (
            difference >
            Math.PI
        ) {

            difference -=
                Math.PI * 2;

        }


        while (
            difference <
            -Math.PI
        ) {

            difference +=
                Math.PI * 2;

        }


        enemy.rotation.y +=
            difference *
            Math.min(
                delta * 5,
                1
            );

    }

}


export {
    patrolEnemyEnhanced
};