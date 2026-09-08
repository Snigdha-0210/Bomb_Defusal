/* =========================================================
   ENEMY INVESTIGATION SYSTEM
   Keeps gunshot investigation separate from enemy AI.
========================================================= */

const investigationRadius = 22;


/* =========================================================
   REGISTER GUNSHOT
========================================================= */

function registerGunshot(
    position,
    enemies
) {

    if (
        !position ||
        !enemies
    ) {
        return;
    }

    for (
        const enemy of enemies
    ) {

        if (
            !enemy ||
            !enemy.userData ||
            !enemy.userData.alive
        ) {
            continue;
        }

        const distance =
            enemy.position.distanceTo(
                position
            );

        if (
            distance >
            investigationRadius
        ) {
            continue;
        }

        const data =
            enemy.userData;

        /*
         * Don't interrupt an enemy
         * that is already actively attacking.
         */
        if (
            data.state ===
            "attack"
        ) {
            continue;
        }

        data.state =
            "investigate";

        data.lastKnownPlayerPosition
            .copy(
                position
            );

        data.searchTimer =
            8;

        /*
         * Give the enemy a slightly
         * different reaction delay.
         */
        data.investigateDelay =
            0.15 +
            Math.random() *
            0.5;
    }
}


/* =========================================================
   UPDATE INVESTIGATION
========================================================= */

function updateInvestigation(
    enemy,
    delta,
    moveEnemy
) {

    if (
        !enemy ||
        !enemy.userData ||
        !enemy.userData.alive
    ) {
        return;
    }

    const data =
        enemy.userData;

    if (
        data.state !==
        "investigate"
    ) {
        return;
    }

    if (
        data.investigateDelay >
        0
    ) {

        data.investigateDelay -=
            delta;

        return;
    }

    if (
        !data.lastKnownPlayerPosition
    ) {
        return;
    }

    const target =
        data.lastKnownPlayerPosition;

    const distance =
        enemy.position.distanceTo(
            target
        );

    /*
     * Move toward the location
     * where the shot was heard.
     */
    if (
        distance > 2.2
    ) {

        moveEnemy(
            enemy,
            target,
            delta,
            1.15
        );

        enemy.lookAt(
            target.x,
            enemy.position.y,
            target.z
        );

        return;
    }

    /*
     * Enemy reached the investigation
     * location.
     */
    data.state =
        "search";

    data.searchTimer =
        6 +
        Math.random() * 3;
}


/* =========================================================
   EXPORT
========================================================= */

export {
    registerGunshot,
    updateInvestigation
};