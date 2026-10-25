export function createSignatureSound(Audio = globalThis.AudioContext || globalThis.webkitAudioContext) {
  let context = null, nodes = [], timer = null, generation = 0;
  function stop() {
    generation++; clearTimeout(timer); timer = null;
    for (const node of nodes) { try { node.stop(); } catch {} }
    nodes = []; context?.suspend().catch(() => {});
  }
  async function play(onEnd = () => {}) {
    stop(); if (typeof Audio !== 'function') return false;
    const current = generation;
    try {
      context ||= new Audio(); await context.resume();
      if (current !== generation) { context.suspend().catch(() => {}); return false; }
      const now = context.currentTime, master = context.createGain();
      master.gain.value = .13; master.connect(context.destination);
      const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * .18;
      const noise = context.createBufferSource(), filter = context.createBiquadFilter(), envelope = context.createGain();
      noise.buffer = buffer; filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now); filter.frequency.exponentialRampToValueAtTime(1300, now + 1); filter.frequency.exponentialRampToValueAtTime(100, now + 2);
      envelope.gain.setValueAtTime(.001, now); envelope.gain.exponentialRampToValueAtTime(.5, now + .5); envelope.gain.exponentialRampToValueAtTime(.001, now + 2);
      noise.connect(filter).connect(envelope).connect(master); noise.start(now); nodes.push(noise);
      for (const [offset, frequency] of [[1.8, 220], [2.1, 330], [2.4, 660]]) {
        for (const harmonic of [1, 2.01, 3.98]) {
          const oscillator = context.createOscillator(), gain = context.createGain();
          oscillator.type = 'sine'; oscillator.frequency.value = frequency * harmonic;
          gain.gain.setValueAtTime(.001, now + offset); gain.gain.exponentialRampToValueAtTime(.18 / harmonic, now + offset + .008); gain.gain.exponentialRampToValueAtTime(.001, now + offset + 1.5);
          oscillator.connect(gain).connect(master); oscillator.start(now + offset); oscillator.stop(now + offset + 1.6); nodes.push(oscillator);
        }
      }
      timer = setTimeout(() => { if (current === generation) { stop(); onEnd(); } }, 4200);
      return true;
    } catch { stop(); return false; }
  }
  return { available: typeof Audio === 'function', play, stop, close() { stop(); context?.close().catch(() => {}); context = null; } };
}
