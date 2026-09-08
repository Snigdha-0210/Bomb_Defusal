/* =========================================================
   ENEMY FEEDBACK SYSTEM
========================================================= */

let enemyWarningElement = null;
let enemyMarkerElement = null;

let enemyWarningTimer = 0;
let markedEnemy = null;


/* =========================================================
   CREATE HUD
========================================================= */

function createEnemyFeedbackHUD() {

    if (
        document.getElementById(
            "enemy-feedback"
        )
    ) {
        return;
    }


    enemyWarningElement =
        document.createElement("div");

    enemyWarningElement.id =
        "enemy-feedback";

    enemyWarningElement.textContent =
        "ENEMY SPOTTED";


    enemyWarningElement.style.cssText = `
        position: fixed;
        top: 110px;
        left: 50%;

        transform:
            translateX(-50%) scale(1);

        z-index: 100;

        color: #ff3030;

        font-family: Arial, sans-serif;
        font-size: 20px;
        font-weight: 900;

        letter-spacing: 5px;

        text-shadow:
            0 0 8px rgba(255,0,0,0.9),
            0 0 18px rgba(255,0,0,0.45);

        opacity: 0;

        pointer-events: none;

        transition:
            opacity 0.15s ease,
            transform 0.15s ease;
    `;


    document.body.appendChild(
        enemyWarningElement
    );


    /* =====================================================
       RED ! ABOVE ENEMY
    ===================================================== */

    enemyMarkerElement =
        document.createElement("div");

    enemyMarkerElement.id =
        "enemy-marker";

    enemyMarkerElement.textContent =
        "!";


    enemyMarkerElement.style.cssText = `
        position: fixed;

        z-index: 101;

        color: #ff2020;

        font-family: Arial, sans-serif;
        font-size: 32px;
        font-weight: 900;

        text-shadow:
            0 0 6px #ff0000,
            0 0 15px rgba(255,0,0,0.8);

        transform:
            translate(-50%, -50%);

        pointer-events: none;

        opacity: 0;
    `;


    document.body.appendChild(
        enemyMarkerElement
    );

}


/* =========================================================
   SHOW ENEMY SPOTTED
========================================================= */

function showEnemySpotted(
    enemy = null
) {

    if (
        !enemyWarningElement
    ) {

        createEnemyFeedbackHUD();

    }


    enemyWarningTimer =
        1.8;


    enemyWarningElement.style.opacity =
        "1";

    enemyWarningElement.style.transform =
        "translateX(-50%) scale(1.05)";


    if (
        enemy
    ) {

        markedEnemy =
            enemy;

        enemyMarkerElement.style.opacity =
            "1";

    }

}


/* =========================================================
   HIDE WARNING
========================================================= */

function hideEnemySpotted() {

    if (
        enemyWarningElement
    ) {

        enemyWarningElement.style.opacity =
            "0";

        enemyWarningElement.style.transform =
            "translateX(-50%) scale(1)";

    }


    if (
        enemyMarkerElement
    ) {

        enemyMarkerElement.style.opacity =
            "0";

    }


    markedEnemy =
        null;

}


/* =========================================================
   UPDATE
========================================================= */

function updateEnemyFeedback(
    delta,
    camera
) {

    /* WARNING TIMER */

    if (
        enemyWarningTimer >
        0
    ) {

        enemyWarningTimer -=
            delta;


        if (
            enemyWarningTimer <=
            0
        ) {

            if (
                enemyWarningElement
            ) {

                enemyWarningElement.style.opacity =
                    "0";

            }

        }

    }


    /* =====================================================
       UPDATE RED ! POSITION
    ===================================================== */

    if (
        markedEnemy &&
        markedEnemy.userData &&
        markedEnemy.userData.alive &&
        camera
    ) {

        const worldPosition =
            markedEnemy.position
                .clone();

        worldPosition.y +=
            2.8;


        worldPosition
            .applyMatrix4(
                markedEnemy.matrixWorld
            );


        worldPosition.project(
            camera
        );


        const x =
            (
                worldPosition.x *
                0.5 +
                0.5
            ) *
            window.innerWidth;


        const y =
            (
                -worldPosition.y *
                0.5 +
                0.5
            ) *
            window.innerHeight;


        enemyMarkerElement.style.left =
            `${x}px`;

        enemyMarkerElement.style.top =
            `${y}px`;


        /* HIDE WHEN BEHIND CAMERA */

        if (
            worldPosition.z > 1
        ) {

            enemyMarkerElement.style.opacity =
                "0";

        }
        else {

            enemyMarkerElement.style.opacity =
                "1";

        }

    }

}


/* =========================================================
   INITIALIZE
========================================================= */

createEnemyFeedbackHUD();


/* =========================================================
   EXPORT
========================================================= */

export {
    showEnemySpotted,
    hideEnemySpotted,
    updateEnemyFeedback
};