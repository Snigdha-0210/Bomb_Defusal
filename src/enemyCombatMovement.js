import * as THREE from "three";
import { camera } from "./main.js";

/* =========================================================
   ENEMY COMBAT MOVEMENT
   Makes enemies reposition while fighting the player
========================================================= */

const DEFAULT_CONFIG = {
    enemy: {
        preferredDistance: 15,
        minimumDistance: 8,
        attackSpeed: 2.8
    }
};

function combatMoveEnemy(
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

    const cfg =
        (typeof CONFIG !== "undefined" ? CONFIG : (window.CONFIG || DEFAULT_CONFIG));

    const data =
        enemy.userData;

    const playerPosition =
        camera.position;

    const distance =
        enemy.position.distanceTo(
            playerPosition
        );


    /*
     * -----------------------------------------------------
     * FAR RANGE
     * Advance toward the player.
     * -----------------------------------------------------
     */

    if (
        distance >
        cfg.enemy.preferredDistance + 4
    ) {

        moveEnemy(
            enemy,
            playerPosition,
            cfg.enemy.attackSpeed,
            delta
        );

        return;
    }


    /*
     * -----------------------------------------------------
     * VERY CLOSE
     * Back away.
     * -----------------------------------------------------
     */

    if (
        distance <
        cfg.enemy.minimumDistance + 2
    ) {

        const away =
            enemy.position
                .clone()
                .sub(
                    playerPosition
                );

        away.y = 0;

        if (
            away.lengthSq() >
            0.001
        ) {

            away.normalize();

            const target =
                enemy.position
                    .clone()
                    .add(
                        away.multiplyScalar(4)
                    );

            moveEnemy(
                enemy,
                target,
                data.speed * 1.1,
                delta
            );

        }

        return;
    }


    /*
     * -----------------------------------------------------
     * COMBAT DISTANCE
     * Stronger strafing + occasional forward movement.
     * -----------------------------------------------------
     */

    data.strafeTimer -=
        delta;


    if (
        data.strafeTimer <= 0
    ) {

        data.strafeTimer =
            0.7 +
            Math.random() * 1.2;

        data.strafeDirection *=
            -1;

    }


    const toPlayer =
        playerPosition
            .clone()
            .sub(
                enemy.position
            );

    toPlayer.y = 0;


    if (
        toPlayer.lengthSq() >
        0.001
    ) {

        toPlayer.normalize();


        const side =
            new THREE.Vector3(
                -toPlayer.z,
                0,
                toPlayer.x
            );


        /*
         * Larger lateral movement.
         */

        side.multiplyScalar(
            data.strafeDirection *
            (3.5 + Math.random() * 1.5)
        );


        const target =
            enemy.position
                .clone()
                .add(side);


        /*
         * Occasionally push toward the player.
         */

        if (
            Math.random() <
            0.025
        ) {

            target.add(
                toPlayer.clone()
                    .multiplyScalar(2)
            );

        }


        moveEnemy(
            enemy,
            target,
            data.speed * 0.8,
            delta
        );

    }

}


export {
    combatMoveEnemy
};