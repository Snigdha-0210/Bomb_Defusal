import { playVictorySound, playExplosionSound } from "./audioSystem.js";
import { setWeatherMood } from "./visualEffects.js";

/* =========================================================
   LEVEL PROGRESSION & MISSION CONTROLLER
========================================================= */

const LEVEL_CONFIGS = [
    {
        level: 1,
        title: "OPERATION INFILTRATION",
        subtitle: "Locate and neutralize the C4 device before enemy patrols converge.",
        mood: "nocturnal",
        enemyCount: 5,
        types: ["ASSAULT", "ASSAULT", "ASSAULT", "SCOUT", "ASSAULT"],
        bombPos: { x: 0, y: 0.45, z: -35 },
        bombTime: 90,
        wireCount: 3
    },
    {
        level: 2,
        title: "THUNDERSTORM SIEGE",
        subtitle: "Storm conditions active. Hostile rushers detected in the village.",
        mood: "rain",
        enemyCount: 8,
        types: ["ASSAULT", "SCOUT", "SCOUT", "ASSAULT", "SCOUT", "ASSAULT", "SCOUT", "ASSAULT"],
        bombPos: { x: -18, y: 0.45, z: -48 },
        bombTime: 75,
        wireCount: 4
    },
    {
        level: 3,
        title: "ROOFTOP MARKSMEN",
        subtitle: "Sniper units deployed with red laser tracking. Exercise extreme caution.",
        mood: "rain",
        enemyCount: 10,
        types: ["SNIPER", "ASSAULT", "SCOUT", "SNIPER", "ASSAULT", "SCOUT", "ASSAULT", "SNIPER", "SCOUT", "ASSAULT"],
        bombPos: { x: 16, y: 0.45, z: -52 },
        bombTime: 65,
        wireCount: 5
    },
    {
        level: 4,
        title: "RED ALERT OUTPOST",
        subtitle: "Heavy Enforcer unit guarding the armed nuclear charge.",
        mood: "crimson",
        enemyCount: 12,
        types: ["HEAVY", "ASSAULT", "SCOUT", "SNIPER", "ASSAULT", "HEAVY", "SCOUT", "SNIPER", "ASSAULT", "SCOUT", "ASSAULT", "HEAVY"],
        bombPos: { x: 0, y: 0.45, z: -58 },
        bombTime: 55,
        wireCount: 5
    }
];

let currentLevelIndex = 0;
let levelStats = {
    shotsFired: 0,
    shotsHit: 0,
    headshots: 0,
    enemiesKilled: 0,
    startTime: Date.now(),
    score: 0
};

function getCurrentLevelConfig() {
    return LEVEL_CONFIGS[currentLevelIndex % LEVEL_CONFIGS.length];
}

function recordShot(hit = false, headshot = false) {
    levelStats.shotsFired++;
    if (hit) levelStats.shotsHit++;
    if (headshot) levelStats.headshots++;
}

function recordKill() {
    levelStats.enemiesKilled++;
    levelStats.score += 150;
}

/* =========================================================
   SHOW VICTORY SCREEN
========================================================= */
function showVictoryScreen(onNextLevelCallback) {
    playVictorySound();

    const config = getCurrentLevelConfig();
    const timeSpent = Math.max(1, Math.round((Date.now() - levelStats.startTime) / 1000));
    const accuracy = levelStats.shotsFired > 0 
        ? Math.round((levelStats.shotsHit / levelStats.shotsFired) * 100) 
        : 100;

    const timeBonus = Math.max(0, (config.bombTime - timeSpent) * 15);
    const totalLevelScore = levelStats.score + (levelStats.headshots * 100) + timeBonus;

    // Determine Rank
    let rank = "B";
    if (accuracy >= 65 && timeSpent < 45) rank = "S";
    else if (accuracy >= 50 || timeSpent < 60) rank = "A";

    const modal = document.createElement("div");
    modal.id = "victory-modal";
    modal.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 300;
        background: rgba(3, 7, 15, 0.94);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: Arial, sans-serif;
        color: white;
        text-align: center;
        padding: 30px;
        backdrop-filter: blur(10px);
        animation: fadeIn 0.4s ease;
    `;

    modal.innerHTML = `
        <div style="font-size: 14px; letter-spacing: 4px; color: #00ff88; margin-bottom: 8px;">MISSION ACCOMPLISHED</div>
        <div style="font-size: 42px; font-weight: 900; letter-spacing: 3px; margin-bottom: 20px;">${config.title}</div>
        
        <div style="display: flex; gap: 40px; margin-bottom: 30px; background: rgba(255,255,255,0.06); padding: 20px 35px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.12);">
            <div>
                <div style="font-size: 12px; opacity: 0.6; margin-bottom: 4px;">RANK</div>
                <div style="font-size: 38px; font-weight: 900; color: #ffd700;">${rank}</div>
            </div>
            <div>
                <div style="font-size: 12px; opacity: 0.6; margin-bottom: 4px;">ACCURACY</div>
                <div style="font-size: 32px; font-weight: bold; color: #00e5ff;">${accuracy}%</div>
            </div>
            <div>
                <div style="font-size: 12px; opacity: 0.6; margin-bottom: 4px;">KILLS</div>
                <div style="font-size: 32px; font-weight: bold; color: #ff3366;">${levelStats.enemiesKilled}</div>
            </div>
            <div>
                <div style="font-size: 12px; opacity: 0.6; margin-bottom: 4px;">SCORE</div>
                <div style="font-size: 32px; font-weight: bold; color: #00ff88;">+${totalLevelScore}</div>
            </div>
        </div>

        <button id="next-level-btn" style="
            background: linear-gradient(135deg, #00ff88, #00b4d8);
            border: none;
            padding: 16px 48px;
            font-size: 18px;
            font-weight: 900;
            color: #03070f;
            letter-spacing: 2px;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 0 25px rgba(0,255,136,0.4);
            transition: transform 0.15s;
        ">CONTINUE TO NEXT LEVEL ➔</button>
    `;

    document.body.appendChild(modal);

    document.getElementById("next-level-btn").onclick = () => {
        modal.remove();
        currentLevelIndex++;
        levelStats = {
            shotsFired: 0,
            shotsHit: 0,
            headshots: 0,
            enemiesKilled: 0,
            startTime: Date.now(),
            score: levelStats.score + totalLevelScore
        };
        if (onNextLevelCallback) {
            onNextLevelCallback(getCurrentLevelConfig());
        }
    };
}

export {
    getCurrentLevelConfig,
    recordShot,
    recordKill,
    showVictoryScreen,
    currentLevelIndex
};
