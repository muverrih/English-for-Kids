// Sound effects utility using Web Audio API
class SoundManager {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private isMuted: boolean = false;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
    return this.audioContext;
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.gainNode) {
      this.gainNode.gain.value = muted ? 0 : 1;
    }
  }

  // Play a beep sound with customizable frequency and duration
  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
    if (this.isMuted) return;
    
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Could not play sound:', e);
    }
  }

  // Success sound - ascending notes
  playSuccess() {
    this.playTone(523.25, 0.1, 'sine', 0.2); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.2), 100); // E5
    setTimeout(() => this.playTone(783.99, 0.2, 'sine', 0.2), 200); // G5
  }

  // Applause sound - 4-5 seconds of clapping
  playApplause() {
    if (this.isMuted) return;

    try {
      const ctx = this.getAudioContext();
      const duration = 4.5; // 4.5 seconds of applause
      const clapsPerSecond = 12;
      const totalClaps = Math.floor(duration * clapsPerSecond);
      
      // Create realistic applause effect with multiple clap layers
      for (let i = 0; i < totalClaps; i++) {
        setTimeout(() => {
          // Each clap is a short burst of noise
          const bufferSize = ctx.sampleRate * 0.06;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const output = buffer.getChannelData(0);
          
          for (let j = 0; j < bufferSize; j++) {
            // Pink noise-like clap sound with natural decay
            output[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.15));
          }
          
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          
          const gainNode = ctx.createGain();
          const filterNode = ctx.createBiquadFilter();
          
          filterNode.type = 'bandpass';
          filterNode.frequency.value = 1800 + Math.random() * 1200;
          filterNode.Q.value = 0.4;
          
          source.connect(filterNode);
          filterNode.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          // Gradual volume: starts strong, fades at the end
          const progress = i / totalClaps;
          const fadeOut = progress > 0.7 ? 1 - ((progress - 0.7) / 0.3) : 1;
          const volume = (0.12 + Math.random() * 0.08) * fadeOut;
          
          gainNode.gain.setValueAtTime(volume, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
          
          source.start();
        }, i * (1000 / clapsPerSecond) + Math.random() * 40);
      }
    } catch (e) {
      console.warn('Could not play applause:', e);
    }
  }

  // Correct answer sound
  playCorrect() {
    this.playTone(880, 0.15, 'triangle'); // A5
    setTimeout(() => this.playTone(1108.73, 0.2, 'triangle'), 100); // C#6
  }

  // Wrong answer sound
  playWrong() {
    this.playTone(220, 0.15, 'sawtooth'); // A3
    setTimeout(() => this.playTone(196, 0.25, 'sawtooth'), 100); // G3
  }

  // Click/tap sound
  playClick() {
    this.playTone(800, 0.05, 'square');
  }

  // Pop sound for animations
  playPop() {
    this.playTone(600, 0.08, 'sine');
    setTimeout(() => this.playTone(900, 0.05, 'sine'), 50);
  }

  // Star earned sound
  playStar() {
    this.playTone(1046.50, 0.1, 'triangle'); // C6
    setTimeout(() => this.playTone(1318.51, 0.1, 'triangle'), 80); // E6
    setTimeout(() => this.playTone(1567.98, 0.15, 'triangle'), 160); // G6
  }

  // Level up / achievement sound
  playLevelUp() {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 0.15, 'triangle'), i * 100);
    });
  }

  // Flip card sound
  playFlip() {
    this.playTone(400, 0.05, 'sine');
    setTimeout(() => this.playTone(500, 0.05, 'sine'), 30);
  }

  // Speak English word using Web Speech API (fallback)
  speak(text: string, lang: string = 'en-US') {
    if (this.isMuted) return;
    
    try {
      speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Could not speak:', e);
    }
  }

  // Speak using ElevenLabs TTS (professional voice)
  async speakWithElevenLabs(text: string): Promise<void> {
    if (this.isMuted) return;

    // Check cache first
    const cacheKey = text.toLowerCase().trim();
    const cachedAudio = this.audioCache.get(cacheKey);
    if (cachedAudio) {
      cachedAudio.currentTime = 0;
      await cachedAudio.play();
      return;
    }

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase not configured, falling back to Web Speech API');
        this.speak(text);
        return;
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ text }),
        }
      );

      if (!response.ok) {
        console.warn('ElevenLabs TTS failed, falling back to Web Speech API');
        this.speak(text);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Cache the audio element
      this.audioCache.set(cacheKey, audio);
      
      await audio.play();
    } catch (e) {
      console.warn('ElevenLabs TTS error, falling back to Web Speech API:', e);
      this.speak(text);
    }
  }

  // Clear audio cache (useful when component unmounts)
  clearCache() {
    this.audioCache.forEach((audio) => {
      URL.revokeObjectURL(audio.src);
    });
    this.audioCache.clear();
  }
}

export const soundManager = new SoundManager();
