import { Injectable, computed, signal } from '@angular/core';
import { CardType, Screen } from './game/models';

const MUSIC_KEY = 'riftbound-music-enabled';
const SFX_KEY = 'riftbound-sfx-enabled';
const MUSIC_VOLUME_KEY = 'riftbound-music-volume';
const SFX_VOLUME_KEY = 'riftbound-sfx-volume';

// Bei Standard-Lautstärke (60 %) entspricht die Musik dem bisherigen Pegel von 0.26.
const DEFAULT_VOLUME = 0.6;
const MUSIC_VOLUME_SCALE = 0.26 / DEFAULT_VOLUME;

const MENU_TRACKS = [
  { label: 'Menu Theme 1', src: 'audio/menu/menu-01-theme-1.mp3' },
  { label: 'Menu Theme 3', src: 'audio/menu/menu-02-theme-3.mp3' },
  { label: 'Menu Theme 2', src: 'audio/menu/menu-03-theme-2.mp3' },
] as const;

const MENU_SCREENS = new Set<Screen>([
  'title', 'dungeons', 'campaign', 'artifacts', 'resonances', 'deck', 'meta', 'cards',
]);

function loadSetting(key: string): boolean {
  if (typeof localStorage === 'undefined') return true;
  try {
    return localStorage.getItem(key) !== 'false';
  } catch {
    return true;
  }
}

function saveSetting(key: string, enabled: boolean) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, String(enabled));
  } catch {
    // Audio bleibt auch ohne localStorage nutzbar.
  }
}

function loadVolume(key: string): number {
  if (typeof localStorage === 'undefined') return DEFAULT_VOLUME;
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return DEFAULT_VOLUME;
    const value = Number(stored);
    if (!Number.isFinite(value)) return DEFAULT_VOLUME;
    return Math.min(1, Math.max(0, value));
  } catch {
    return DEFAULT_VOLUME;
  }
}

function saveVolume(key: string, volume: number) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(key, String(volume));
  } catch {
    // Audio bleibt auch ohne localStorage nutzbar.
  }
}

@Injectable({ providedIn: 'root' })
export class AudioService {
  readonly musicEnabled = signal(loadSetting(MUSIC_KEY));
  readonly sfxEnabled = signal(loadSetting(SFX_KEY));
  readonly musicVolume = signal(loadVolume(MUSIC_VOLUME_KEY));
  readonly sfxVolume = signal(loadVolume(SFX_VOLUME_KEY));
  readonly menuActive = signal(false);
  readonly musicPlaying = signal(false);
  readonly currentTrackIndex = signal(0);
  readonly currentTrackLabel = computed(() => MENU_TRACKS[this.currentTrackIndex()].label);

  private musicPlayer: HTMLAudioElement | null = null;
  private audioContext: AudioContext | null = null;
  private unlocked = false;

  constructor() {
    if (typeof Audio === 'undefined') return;
    this.musicPlayer = new Audio();
    this.musicPlayer.preload = 'metadata';
    this.musicPlayer.volume = this.musicVolume() * MUSIC_VOLUME_SCALE;
    this.musicPlayer.addEventListener('playing', () => this.musicPlaying.set(true));
    this.musicPlayer.addEventListener('pause', () => this.musicPlaying.set(false));
    this.musicPlayer.addEventListener('ended', () => this.advanceTrack());
    this.loadTrack(0);
  }

  syncScreen(screen: Screen) {
    const active = MENU_SCREENS.has(screen);
    this.menuActive.set(active);
    if (active) {
      void this.playMenuMusic();
    } else {
      this.musicPlayer?.pause();
    }
  }

  /** Browser erlauben Audio erst nach der ersten Berührung oder Taste. */
  unlock() {
    this.unlocked = true;
    const context = this.getAudioContext();
    if (context?.state === 'suspended') void context.resume();
    if (this.menuActive() && this.musicEnabled()) void this.playMenuMusic();
  }

  toggleMusic() {
    const enabled = !this.musicEnabled();
    this.musicEnabled.set(enabled);
    saveSetting(MUSIC_KEY, enabled);
    if (enabled) {
      this.unlock();
    } else {
      this.musicPlayer?.pause();
    }
  }

  toggleSfx() {
    const enabled = !this.sfxEnabled();
    this.sfxEnabled.set(enabled);
    saveSetting(SFX_KEY, enabled);
    if (enabled) this.unlock();
  }

  setMusicVolume(volume: number) {
    const clamped = Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : DEFAULT_VOLUME));
    this.musicVolume.set(clamped);
    saveVolume(MUSIC_VOLUME_KEY, clamped);
    if (this.musicPlayer) this.musicPlayer.volume = clamped * MUSIC_VOLUME_SCALE;
    this.unlock();
  }

  setSfxVolume(volume: number) {
    const clamped = Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : DEFAULT_VOLUME));
    this.sfxVolume.set(clamped);
    saveVolume(SFX_VOLUME_KEY, clamped);
    this.unlock();
  }

  /** Faktor für alle Soundeffekte relativ zur Standard-Lautstärke. */
  private sfxGainFactor(): number {
    return this.sfxVolume() / DEFAULT_VOLUME;
  }

  /** Wechselt manuell zum nächsten Menü-Theme. */
  nextTrack() {
    this.loadTrack((this.currentTrackIndex() + 1) % MENU_TRACKS.length);
    this.unlock();
    if (this.menuActive() && this.musicEnabled()) void this.playMenuMusic();
  }

  playEnemyHit(damage: number, blocked: boolean) {
    this.playImpact('enemy', damage, blocked);
  }

  playPlayerHit(damage: number) {
    this.playImpact('player', damage, false);
  }

  playButtonClick() {
    const context = this.readySfxContext();
    if (!context) return;
    const now = context.currentTime;
    const gain = context.createGain();
    // 1,5-fache Grundlautstärke gegenüber der ursprünglichen Version (0.035).
    gain.gain.setValueAtTime(0.0525 * this.sfxGainFactor(), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    gain.connect(context.destination);

    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(560, now);
    oscillator.frequency.exponentialRampToValueAtTime(320, now + 0.05);
    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + 0.055);
  }

  playCard(type: CardType) {
    const context = this.readySfxContext();
    if (!context) return;
    const now = context.currentTime;

    if (type === 'Angriff') {
      this.playTone(context, now, 'sawtooth', 310, 95, 0.1, 0.035);
      this.playNoise(context, now, 0.075, 'highpass', 1200, 0.022);
    } else if (type === 'Verteidigung') {
      this.playTone(context, now, 'sine', 390, 620, 0.18, 0.04);
      this.playTone(context, now + 0.025, 'sine', 680, 920, 0.16, 0.025);
    } else if (type === 'Technik') {
      this.playTone(context, now, 'triangle', 720, 980, 0.095, 0.034);
      this.playTone(context, now + 0.055, 'sine', 980, 1320, 0.085, 0.022);
    } else if (type === 'Macht') {
      this.playTone(context, now, 'triangle', 120, 330, 0.26, 0.05);
      this.playTone(context, now + 0.05, 'sine', 240, 520, 0.24, 0.026);
    } else {
      this.playTone(context, now, 'sawtooth', 190, 58, 0.24, 0.03);
      this.playNoise(context, now, 0.2, 'lowpass', 620, 0.025);
    }
  }

  private async playMenuMusic() {
    if (!this.unlocked || !this.menuActive() || !this.musicEnabled() || !this.musicPlayer) return;
    try {
      await this.musicPlayer.play();
    } catch {
      // Der nächste Tap versucht es erneut, falls der Browser Autoplay noch blockiert.
    }
  }

  private advanceTrack() {
    if (!this.menuActive() || !this.musicEnabled()) return;
    this.loadTrack((this.currentTrackIndex() + 1) % MENU_TRACKS.length);
    void this.playMenuMusic();
  }

  private loadTrack(index: number) {
    if (!this.musicPlayer) return;
    this.currentTrackIndex.set(index);
    const track = MENU_TRACKS[index];
    this.musicPlayer.src = typeof document === 'undefined'
      ? track.src
      : new URL(track.src, document.baseURI).toString();
    this.musicPlayer.load();
  }

  private getAudioContext(): AudioContext | null {
    if (this.audioContext) return this.audioContext;
    if (typeof window === 'undefined') return null;
    const AudioContextConstructor = window.AudioContext
      ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return null;
    this.audioContext = new AudioContextConstructor();
    return this.audioContext;
  }

  private readySfxContext(): AudioContext | null {
    if (!this.sfxEnabled() || !this.unlocked) return null;
    const context = this.getAudioContext();
    if (context?.state === 'suspended') void context.resume();
    return context;
  }

  private playTone(
    context: AudioContext,
    start: number,
    type: OscillatorType,
    from: number,
    to: number,
    duration: number,
    volume: number,
  ) {
    const gain = context.createGain();
    gain.gain.setValueAtTime(volume * this.sfxGainFactor(), start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    gain.connect(context.destination);
    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, start);
    oscillator.frequency.exponentialRampToValueAtTime(to, start + duration);
    oscillator.connect(gain);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }

  private playNoise(
    context: AudioContext,
    start: number,
    duration: number,
    filterType: BiquadFilterType,
    frequency: number,
    volume: number,
  ) {
    const length = Math.floor(context.sampleRate * duration);
    const buffer = context.createBuffer(1, length, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = context.createBufferSource();
    source.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(frequency, start);
    const gain = context.createGain();
    gain.gain.setValueAtTime(volume * this.sfxGainFactor(), start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(context.destination);
    source.start(start);
    source.stop(start + duration);
  }

  private playImpact(target: 'enemy' | 'player', damage: number, blocked: boolean) {
    const context = this.readySfxContext();
    if (!context) return;

    const now = context.currentTime;
    const weight = Math.min(1, Math.max(0.25, damage / 24));
    const master = context.createGain();
    master.gain.setValueAtTime(((blocked ? 0.055 : 0.075) + weight * 0.05) * this.sfxGainFactor(), now);
    master.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    master.connect(context.destination);

    const oscillator = context.createOscillator();
    oscillator.type = target === 'player' ? 'sawtooth' : 'triangle';
    oscillator.frequency.setValueAtTime(target === 'player' ? 115 : 185, now);
    oscillator.frequency.exponentialRampToValueAtTime(target === 'player' ? 48 : 72, now + 0.14);
    oscillator.connect(master);
    oscillator.start(now);
    oscillator.stop(now + 0.16);

    const noiseLength = Math.floor(context.sampleRate * 0.1);
    const noiseBuffer = context.createBuffer(1, noiseLength, context.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseLength; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * (1 - i / noiseLength);
    }
    const noise = context.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(blocked ? 900 : target === 'player' ? 1250 : 1750, now);
    noise.connect(filter);
    filter.connect(master);
    noise.start(now);
    noise.stop(now + 0.1);
  }
}
