// Speech Engine for Thai Voiceover Narration

export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  isThai: boolean;
}

class SpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedVoiceName: string | null = null;
  private isMuted: boolean = false;
  private speechRate: number = 1.05;
  private speechPitch: number = 1.0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    // Default to a Thai voice if available
    const thaiVoice = this.voices.find(
      (v) => v.lang.toLowerCase().includes('th') || v.lang.toLowerCase().includes('thai')
    );
    if (thaiVoice && !this.selectedVoiceName) {
      this.selectedVoiceName = thaiVoice.name;
    }
  }

  public getAvailableVoices(): VoiceOption[] {
    this.loadVoices();
    return this.voices.map((v) => ({
      id: v.name,
      name: `${v.name} (${v.lang})`,
      lang: v.lang,
      isThai: v.lang.toLowerCase().includes('th') || v.lang.toLowerCase().includes('thai'),
    }));
  }

  public setVoice(voiceName: string) {
    this.selectedVoiceName = voiceName;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stop();
    }
  }

  public setRate(rate: number) {
    this.speechRate = rate;
  }

  public setPitch(pitch: number) {
    this.speechPitch = pitch;
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public speak(
    text: string,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
      onBoundary?: (charIndex: number) => void;
    }
  ): Promise<void> {
    return new Promise((resolve) => {
      this.stop();

      if (this.isMuted || !this.synth || !text.trim()) {
        callbacks?.onStart?.();
        // Resolve after brief delay if muted
        setTimeout(() => {
          callbacks?.onEnd?.();
          resolve();
        }, 1500);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;
      utterance.rate = this.speechRate;
      utterance.pitch = this.speechPitch;

      // Select voice
      if (this.selectedVoiceName) {
        const found = this.voices.find((v) => v.name === this.selectedVoiceName);
        if (found) {
          utterance.voice = found;
        }
      } else {
        const thai = this.voices.find(
          (v) => v.lang.toLowerCase().includes('th') || v.lang.toLowerCase().includes('thai')
        );
        if (thai) {
          utterance.voice = thai;
        }
      }

      utterance.onstart = () => {
        callbacks?.onStart?.();
      };

      utterance.onboundary = (e) => {
        callbacks?.onBoundary?.(e.charIndex);
      };

      utterance.onend = () => {
        callbacks?.onEnd?.();
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis notice:', e);
        callbacks?.onEnd?.();
        this.currentUtterance = null;
        resolve();
      };

      this.synth.speak(utterance);
    });
  }
}

export const speechEngine = new SpeechEngine();
