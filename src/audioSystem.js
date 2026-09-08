/* =========================================================
   PROCEDURAL WEB AUDIO SYSTEM
   Synthesizes all tactical sound effects with zero external assets.
========================================================= */

let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    return audioCtx;
}

// User interaction unlock
document.addEventListener("click", () => getAudioContext(), { once: true });
document.addEventListener("keydown", () => getAudioContext(), { once: true });

/* =========================================================
   PLAYER GUNSHOT SOUND
========================================================= */
function playPlayerGunshot() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Transient attack punch
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.09);

    oscGain.gain.setValueAtTime(0.7, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.09);

    // Noise blast (Muzzle report)
    const bufferSize = ctx.sampleRate * 0.22;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2800, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.22);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.55, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(t);
    noise.stop(t + 0.22);
}

/* =========================================================
   ENEMY GUNSHOT SOUND (Distant / Suppressed)
========================================================= */
function playEnemyGunshot() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.07);

    oscGain.gain.setValueAtTime(0.25, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.07);

    // Filtered noise
    const bufferSize = ctx.sampleRate * 0.14;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(900, t);
    filter.Q.setValueAtTime(2.5, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(t);
    noise.stop(t + 0.14);
}

/* =========================================================
   HIT MARKER & HEADSHOT CRITICAL
========================================================= */
function playHitmarker(isHeadshot = false) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (isHeadshot) {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(1760, t + 0.08);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.start(t);
        osc.stop(t + 0.12);
    } else {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(600, t + 0.05);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        osc.start(t);
        osc.stop(t + 0.05);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
}

/* =========================================================
   WEAPON RELOAD SOUND
========================================================= */
function playReloadSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Mag out click
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(450, t);
    osc1.frequency.exponentialRampToValueAtTime(120, t + 0.06);
    g1.gain.setValueAtTime(0.3, t);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    osc1.connect(g1);
    g1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.06);

    // Mag in click
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(300, t + 0.45);
    osc2.frequency.exponentialRampToValueAtTime(750, t + 0.52);
    g2.gain.setValueAtTime(0.35, t + 0.45);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.52);
    osc2.connect(g2);
    g2.connect(ctx.destination);
    osc2.start(t + 0.45);
    osc2.stop(t + 0.52);

    // Bolt rack
    const osc3 = ctx.createOscillator();
    const g3 = ctx.createGain();
    osc3.type = "sawtooth";
    osc3.frequency.setValueAtTime(800, t + 0.85);
    osc3.frequency.exponentialRampToValueAtTime(250, t + 0.95);
    g3.gain.setValueAtTime(0.4, t + 0.85);
    g3.gain.exponentialRampToValueAtTime(0.001, t + 0.95);
    osc3.connect(g3);
    g3.connect(ctx.destination);
    osc3.start(t + 0.85);
    osc3.stop(t + 0.95);
}

/* =========================================================
   BOMB COUNTDOWN BEEP (Scales pitch & urgency)
========================================================= */
function playBombBeep(urgencyFactor = 0) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const baseFreq = 880 + urgencyFactor * 600;
    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, t);

    gain.gain.setValueAtTime(0.2 + urgencyFactor * 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
}

/* =========================================================
   WIRE SNIP SOUND
========================================================= */
function playWireSnip() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "highpass";
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.07);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.07);
}

/* =========================================================
   LEVEL VICTORY FANFARE
========================================================= */
function playVictorySound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t + idx * 0.14);

        gain.gain.setValueAtTime(0, t + idx * 0.14);
        gain.gain.linearRampToValueAtTime(0.3, t + idx * 0.14 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.14 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + idx * 0.14);
        osc.stop(t + idx * 0.14 + 0.45);
    });
}

/* =========================================================
   EXPLOSION SOUND
========================================================= */
function playExplosionSound() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Sub rumble
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 1.2);
    g.gain.setValueAtTime(0.8, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 1.2);

    // Deep noise burst
    const bufferSize = ctx.sampleRate * 1.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.exponentialRampToValueAtTime(60, t + 1.5);

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.9, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 1.5);
}

/* =========================================================
   ITEM PICKUP CHIME
========================================================= */
function playPickupSound(isHealth = false) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    if (isHealth) {
        osc.frequency.setValueAtTime(440, t);
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.15);
    } else {
        osc.frequency.setValueAtTime(550, t);
        osc.frequency.exponentialRampToValueAtTime(1100, t + 0.15);
    }

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
}

export {
    playPlayerGunshot,
    playEnemyGunshot,
    playHitmarker,
    playReloadSound,
    playBombBeep,
    playWireSnip,
    playVictorySound,
    playExplosionSound,
    playPickupSound
};
