/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API sound synthesis for zero-dependency, high-fidelity sound effects

let sharedAudioCtx: AudioContext | null = null;

/**
 * Initializes or unlocks the browser AudioContext during a user gesture (e.g. click).
 */
export function initAudio(): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === 'suspended') {
      void sharedAudioCtx.resume();
    }
  } catch (err) {
    console.warn('Web Audio init note:', err);
  }
}

/**
 * Plays a warm, melodic success chime when login loading finishes successfully.
 * Uses a polyphonic ascending major chord (C5 -> E5 -> G5 -> C6) with natural decay.
 */
export function playLoginSuccessSound(): void {
  try {
    initAudio();
    if (!sharedAudioCtx) return;

    const ctx = sharedAudioCtx;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const now = ctx.currentTime;

    // Harmonic ascending sequence (C Major chime)
    // Notes: C5 (523.25 Hz), E5 (659.25 Hz), G5 (783.99 Hz), C6 (1046.50 Hz)
    const notes = [
      { freq: 523.25, timeOffset: 0.0, duration: 0.28, gain: 0.14 },
      { freq: 659.25, timeOffset: 0.08, duration: 0.32, gain: 0.16 },
      { freq: 783.99, timeOffset: 0.16, duration: 0.36, gain: 0.18 },
      { freq: 1046.5, timeOffset: 0.25, duration: 0.55, gain: 0.22 },
    ];

    notes.forEach(({ freq, timeOffset, duration, gain }) => {
      const startTime = now + timeOffset;

      // Primary tone (Sine wave for clean purity)
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Smooth attack and natural exponential release
      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.exponentialRampToValueAtTime(gain, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);

      // Subtle warm overtone (Triangle wave at 2x frequency, very soft)
      const harmonicOsc = ctx.createOscillator();
      const harmonicGain = ctx.createGain();

      harmonicOsc.type = 'triangle';
      harmonicOsc.frequency.setValueAtTime(freq * 2, startTime);

      harmonicGain.gain.setValueAtTime(0.0001, startTime);
      harmonicGain.gain.exponentialRampToValueAtTime(gain * 0.2, startTime + 0.015);
      harmonicGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.7);

      harmonicOsc.connect(harmonicGain);
      harmonicGain.connect(ctx.destination);

      harmonicOsc.start(startTime);
      harmonicOsc.stop(startTime + duration * 0.7);
    });
  } catch (err) {
    console.warn('Audio playback note:', err);
  }
}
