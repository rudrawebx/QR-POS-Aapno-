// High-Fidelity Web Audio Synthesizer for POS, QR Orders & Kitchen KDS alerts

let sharedAudioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

// Global unlock on first user gesture (click, tap, keypress)
export function unlockAudioContext() {
  if (typeof window === 'undefined') return;
  
  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioCtx = new AudioContextClass();
    }
  }

  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().then(() => {
      isAudioUnlocked = true;
    }).catch(() => {});
  } else if (sharedAudioCtx && sharedAudioCtx.state === 'running') {
    isAudioUnlocked = true;
  }
}

// Auto-register user gesture listener on client load
if (typeof window !== 'undefined') {
  const unlockEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
  const handleUserGesture = () => {
    unlockAudioContext();
    unlockEvents.forEach(evt => window.removeEventListener(evt, handleUserGesture));
  };
  unlockEvents.forEach(evt => window.addEventListener(evt, handleUserGesture, { once: true, passive: true }));
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;
    
    if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume().catch(() => {});
    }
    return sharedAudioCtx;
  } catch (err) {
    console.warn('AudioContext creation failed:', err);
    return null;
  }
}

/**
 * Loud, energetic Dual-Ring Bell Chime for New Incoming QR Customer Orders.
 * Plays a double ringing sequence (Ding-Ding! Ding-Ding!) with high-visibility harmonics.
 */
export function playNewOrderChime() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const playBell = (startTime: number, pitchMultiplier = 1) => {
      const frequencies = [783.99 * pitchMultiplier, 1046.50 * pitchMultiplier, 1318.51 * pitchMultiplier, 1567.98 * pitchMultiplier];
      
      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, startTime + idx * 0.08);

        // Loud punchy attack, smooth decay
        gain.gain.setValueAtTime(0, startTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.7, startTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime + idx * 0.08);
        osc.stop(startTime + idx * 0.08 + 0.5);
      });
    };

    const now = ctx.currentTime;
    // Ring 1
    playBell(now, 1.0);
    // Ring 2 (Repeated chime for high urgency)
    playBell(now + 0.35, 1.15);
  } catch (err) {
    console.warn('Audio order chime could not be played:', err);
  }
}

/**
 * Loud High-Pitch Double Beep for Kitchen Display Screen (KDS) & Order Status changes.
 */
export function playKitchenAlert() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Beep 1 & Beep 2
    [880, 1174.66, 880, 1174.66].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.65, now + idx * 0.12 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.11);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.12);
    });
  } catch (err) {
    console.warn('Kitchen alert sound could not play:', err);
  }
}
