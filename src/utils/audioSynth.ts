// Web Audio API procedural music synthesizer for background music
// Royalty-free, 0 external dependencies, perfectly looped

class AudioSynthEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timerId: any = null;
  private masterGain: GainNode | null = null;
  private destinationNode: MediaStreamAudioDestinationNode | null = null;
  private currentVibe = 'upbeat_electronic';
  private step = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Create stream destination for video recording
      try {
        this.destinationNode = this.ctx.createMediaStreamDestination();
        this.masterGain.connect(this.destinationNode);
      } catch (e) {
        console.warn('MediaStreamDestination not supported', e);
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAudioContext(): AudioContext | null {
    this.initContext();
    return this.ctx;
  }

  public getStreamDestination(): MediaStreamAudioDestinationNode | null {
    this.initContext();
    return this.destinationNode;
  }

  public setVolume(vol: number) {
    this.initContext();
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, vol));
      this.masterGain.gain.setTargetAtTime(clamped * 0.25, this.ctx.currentTime, 0.05);
    }
  }

  public play(vibe: string = 'upbeat_electronic') {
    this.initContext();
    if (this.isPlaying && this.currentVibe === vibe) return;
    this.stop();
    this.isPlaying = true;
    this.currentVibe = vibe;
    this.step = 0;

    // Scheduler tick
    const intervalMs = vibe === 'lofi_chill' ? 175 : vibe === 'dramatic_suspense' ? 250 : 135;
    this.timerId = setInterval(() => {
      this.onTick();
    }, intervalMs);
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private onTick() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const s = this.step % 16;
    this.step++;

    switch (this.currentVibe) {
      case 'upbeat_electronic':
        this.playUpbeatStep(now, s);
        break;
      case 'lofi_chill':
        this.playLofiStep(now, s);
        break;
      case 'dramatic_suspense':
        this.playDramaticStep(now, s);
        break;
      case 'ambient_tech':
      default:
        this.playAmbientStep(now, s);
        break;
    }
  }

  // Upbeat 4-on-the-floor beat with synth pluck
  private playUpbeatStep(time: number, s: number) {
    if (!this.ctx || !this.masterGain) return;

    // Kick on 0, 4, 8, 12
    if (s % 4 === 0) {
      this.triggerKick(time, 130, 45, 0.15);
    }

    // Hi-hat on offbeats: 2, 6, 10, 14
    if (s % 2 === 0) {
      this.triggerHiHat(time, s % 4 === 2 ? 0.05 : 0.02);
    }

    // Snare / Clap on 4, 12
    if (s === 4 || s === 12) {
      this.triggerSnare(time);
    }

    // Bassline / Arp melody
    const notes = [220, 261.63, 293.66, 329.63, 392, 440];
    const bassNote = s < 8 ? 110 : 130.81; // A or C
    if (s % 2 === 0) {
      this.triggerSynthPluck(time, bassNote, 'sawtooth', 0.12, 0.08);
    }

    // Pluck melody pattern
    if ([1, 3, 6, 9, 11, 14].includes(s)) {
      const melodyFreq = notes[(s * 3) % notes.length];
      this.triggerSynthPluck(time, melodyFreq, 'triangle', 0.08, 0.05);
    }
  }

  // Relaxed Lo-fi
  private playLofiStep(time: number, s: number) {
    if (!this.ctx || !this.masterGain) return;

    // Kick on 0 and 7
    if (s === 0 || s === 7) {
      this.triggerKick(time, 90, 40, 0.2);
    }
    // Snare on 4 and 12
    if (s === 4 || s === 12) {
      this.triggerSnare(time, 0.06);
    }
    // Hi-hat subtle
    if (s % 2 === 1) {
      this.triggerHiHat(time, 0.015);
    }
    // Warm Rhodes style chord
    if (s === 0 || s === 8) {
      const chord = s === 0 ? [261.63, 329.63, 392, 493.88] : [220, 261.63, 329.63, 392];
      chord.forEach((freq) => {
        this.triggerSynthPluck(time, freq, 'sine', 0.6, 0.03);
      });
    }
  }

  // Dramatic cinematic suspense
  private playDramaticStep(time: number, s: number) {
    if (!this.ctx || !this.masterGain) return;

    // Deep sub boom on 0
    if (s === 0) {
      this.triggerKick(time, 70, 30, 0.5);
    }
    // Tension pulse every 2 steps
    if (s % 2 === 0) {
      const freq = s < 8 ? 146.83 : 164.81; // D or E
      this.triggerSynthPluck(time, freq, 'sawtooth', 0.2, 0.04);
    }
    // Riser / metallic ping on 14
    if (s === 14) {
      this.triggerHiHat(time, 0.08);
    }
  }

  // Modern ambient tech
  private playAmbientStep(time: number, s: number) {
    if (!this.ctx || !this.masterGain) return;

    if (s % 8 === 0) {
      this.triggerKick(time, 100, 50, 0.15);
    }
    if (s % 4 === 2) {
      this.triggerHiHat(time, 0.02);
    }

    const techNotes = [329.63, 392, 440, 523.25, 659.25];
    if ([0, 3, 5, 8, 11, 13].includes(s)) {
      const f = techNotes[s % techNotes.length];
      this.triggerSynthPluck(time, f, 'sine', 0.2, 0.04);
    }
  }

  // Helper sound synthesizers
  private triggerKick(time: number, startFreq: number, endFreq: number, decay: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + decay);

    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + decay);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + decay);
  }

  private triggerSnare(time: number, vol = 0.09) {
    if (!this.ctx || !this.masterGain) return;
    // Tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    oscGain.gain.setValueAtTime(vol, time);
    oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(time);
    osc.stop(time + 0.1);

    // Noise
    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(vol * 0.8, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.12);
  }

  private triggerHiHat(time: number, vol = 0.03) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(6000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(time);
    noise.stop(time + 0.04);
  }

  private triggerSynthPluck(
    time: number,
    freq: number,
    type: OscillatorType,
    duration: number,
    vol = 0.06
  ) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }
}

export const audioSynth = new AudioSynthEngine();
