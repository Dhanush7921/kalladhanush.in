/**
 * Optional ambient soundscape synthesised with the Web Audio API — no audio files.
 * OFF by default; only starts after the visitor presses the sound toggle.
 */
export class AmbientSound {
  private ctx?: AudioContext;
  private master?: GainNode;
  private nodes: AudioScheduledSourceNode[] = [];
  running = false;

  static supported() {
    return typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window);
  }

  async start() {
    if (this.running) return;
    const Ctx: typeof AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = this.ctx ?? new Ctx();
    await this.ctx.resume();
    const ctx = this.ctx;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.master = master;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 520;
    filter.Q.value = 0.6;
    filter.connect(master);

    // A low, warm chord (A1, E2, A2, C#3) with gentle detune.
    [55, 82.41, 110, 138.59].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      osc.detune.value = (i % 2 ? 1 : -1) * 4;
      const g = ctx.createGain();
      g.gain.value = [0.32, 0.12, 0.1, 0.05][i];
      osc.connect(g).connect(filter);
      osc.start();
      this.nodes.push(osc);
    });

    // Slow breathing on the filter.
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 220;
    lfo.connect(lfoGain).connect(filter.frequency);
    lfo.start();
    this.nodes.push(lfo);

    master.gain.linearRampToValueAtTime(0.16, ctx.currentTime + 2.5);
    this.running = true;
  }

  stop() {
    if (!this.ctx || !this.master || !this.running) return;
    const ctx = this.ctx;
    const master = this.master;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    const nodes = this.nodes;
    this.nodes = [];
    window.setTimeout(() => { nodes.forEach((n) => n.stop()); master.disconnect(); }, 900);
    this.running = false;
  }

  /** A soft rising chime for the START transition (only when sound is on). */
  chime() {
    if (!this.ctx || !this.running) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    [440, 659.25, 880].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0, now + i * 0.12);
      g.gain.linearRampToValueAtTime(0.06, now + i * 0.12 + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 2.2);
      o.connect(g).connect(ctx.destination);
      o.start(now + i * 0.12);
      o.stop(now + i * 0.12 + 2.4);
    });
  }
}
