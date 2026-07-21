import { Injectable, computed, signal } from '@angular/core';
import { CardType, DungeonTheme, Screen } from './game/models';

const MUSIC_KEY = 'riftbound-music-enabled';
const SFX_KEY = 'riftbound-sfx-enabled';
const MUSIC_VOLUME_KEY = 'riftbound-music-volume';
const SFX_VOLUME_KEY = 'riftbound-sfx-volume';
const CONTROLS_COLLAPSED_KEY = 'riftbound-audio-collapsed';

// Musik startet leise (1/4 der Leiste), Sounds starten auf voller Leiste.
const DEFAULT_MUSIC_VOLUME = 0.25;
const DEFAULT_SFX_VOLUME = 1;
// Regler auf 100 % entspricht Player-Volume ~0.43 (alter Standard: 60 % ≈ 0.26).
const MUSIC_VOLUME_SCALE = 0.26 / 0.6;

const MENU_TRACKS = [
  { label: 'Menu Theme 1', src: 'audio/menu/menu-01-theme-1.mp3' },
  { label: 'Menu Theme 2', src: 'audio/menu/menu-03-theme-2.mp3' },
  { label: 'Menu Theme 3', src: 'audio/menu/menu-02-theme-3.mp3' },
] as const;

const COMBAT_TRACKS: Record<DungeonTheme, readonly string[]> = {
  desert: [
    'audio/combat/desert/normal-01.mp3',
    'audio/combat/desert/normal-02.mp3',
  ],
  winter: [
    'audio/combat/winter/normal-01.mp3',
    'audio/combat/winter/normal-02.mp3',
  ],
  crystal: [
    'audio/combat/crystal/normal-01.mp3',
    'audio/combat/crystal/normal-02.mp3',
    'audio/combat/crystal/normal-03.mp3',
  ],
  sky: [
    'audio/combat/sky/normal-01.mp3',
    'audio/combat/sky/normal-02.mp3',
    'audio/combat/sky/normal-03.mp3',
    'audio/combat/sky/normal-04.mp3',
  ],
  void: [
    'audio/combat/void/normal-01.mp3',
    'audio/combat/void/normal-02.mp3',
  ],
};

const COMBAT_THEME_LABELS: Record<DungeonTheme, string> = {
  desert: 'Wüste',
  winter: 'Winter',
  crystal: 'Kristall',
  sky: 'Himmel',
  void: 'Leere',
};

const MENU_SCREENS = new Set<Screen>([
  'title', 'dungeons', 'campaign', 'artifacts', 'allies', 'resonances', 'deck', 'meta', 'cards',
]);

const RUN_SCREENS = new Set<Screen>(['map', 'combat', 'reward', 'rest']);

function loadSetting(key: string, fallback = true): boolean {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    return stored !== 'false';
  } catch {
    return fallback;
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

function loadVolume(key: string, fallback: number): number {
  if (typeof localStorage === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    if (stored === null) return fallback;
    const value = Number(stored);
    if (!Number.isFinite(value)) return fallback;
    return Math.min(1, Math.max(0, value));
  } catch {
    return fallback;
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
  readonly controlsCollapsed = signal(loadSetting(CONTROLS_COLLAPSED_KEY, false));
  readonly musicVolume = signal(loadVolume(MUSIC_VOLUME_KEY, DEFAULT_MUSIC_VOLUME));
  readonly sfxVolume = signal(loadVolume(SFX_VOLUME_KEY, DEFAULT_SFX_VOLUME));
  readonly menuActive = signal(false);
  readonly combatMusicActive = signal(false);
  readonly currentCombatTrackLabel = signal('');
  readonly musicPlaying = signal(false);
  readonly currentTrackIndex = signal(0);
  readonly currentTrackLabel = computed(() => MENU_TRACKS[this.currentTrackIndex()].label);

  private musicPlayer: HTMLAudioElement | null = null;
  private combatPlayer: HTMLAudioElement | null = null;
  private combatTracks: readonly string[] = [];
  private combatTrackIndex = 0;
  private combatTheme: DungeonTheme | null = null;
  private activeScreen: Screen | null = null;
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

    this.combatPlayer = new Audio();
    this.combatPlayer.preload = 'metadata';
    this.combatPlayer.volume = this.musicVolume() * MUSIC_VOLUME_SCALE;
    this.combatPlayer.addEventListener('playing', () => this.musicPlaying.set(true));
    this.combatPlayer.addEventListener('pause', () => this.musicPlaying.set(false));
    this.combatPlayer.addEventListener('ended', () => this.advanceCombatTrack());
  }

  syncScreen(screen: Screen, theme?: DungeonTheme) {
    const runScreenEntered = (screen === 'map' || screen === 'combat')
      && this.activeScreen !== screen;
    this.activeScreen = screen;
    if (runScreenEntered) this.setControlsCollapsed(true);

    const active = MENU_SCREENS.has(screen);
    this.menuActive.set(active);
    if (active) {
      this.stopCombatMusic();
      void this.playMenuMusic();
    } else {
      this.musicPlayer?.pause();
      if (RUN_SCREENS.has(screen) && theme) this.startCombatMusic(theme);
      else this.stopCombatMusic();
    }
  }

  startCombatMusic(theme: DungeonTheme) {
    const tracks = COMBAT_TRACKS[theme];
    if (tracks.length === 0 || !this.combatPlayer) return;
    if (this.combatMusicActive() && this.combatTheme === theme) {
      this.musicPlayer?.pause();
      void this.playCombatMusic();
      return;
    }
    this.combatTheme = theme;
    this.combatTracks = tracks;
    this.combatTrackIndex = Math.floor(Math.random() * tracks.length);
    this.combatMusicActive.set(true);
    this.musicPlayer?.pause();
    this.loadCombatTrack();
    void this.playCombatMusic();
  }

  stopCombatMusic() {
    this.combatMusicActive.set(false);
    this.currentCombatTrackLabel.set('');
    this.combatPlayer?.pause();
  }

  /** Browser erlauben Audio erst nach der ersten Berührung oder Taste. */
  unlock() {
    this.unlocked = true;
    const context = this.getAudioContext();
    if (context?.state === 'suspended') void context.resume();
    if (this.menuActive() && this.musicEnabled()) void this.playMenuMusic();
    else if (this.combatMusicActive() && this.musicEnabled()) void this.playCombatMusic();
  }

  toggleControls() {
    this.setControlsCollapsed(!this.controlsCollapsed());
  }

  private setControlsCollapsed(collapsed: boolean) {
    this.controlsCollapsed.set(collapsed);
    saveSetting(CONTROLS_COLLAPSED_KEY, collapsed);
  }

  toggleMusic() {
    const enabled = !this.musicEnabled();
    this.musicEnabled.set(enabled);
    saveSetting(MUSIC_KEY, enabled);
    if (enabled) {
      this.unlock();
    } else {
      this.musicPlayer?.pause();
      this.combatPlayer?.pause();
    }
  }

  toggleSfx() {
    const enabled = !this.sfxEnabled();
    this.sfxEnabled.set(enabled);
    saveSetting(SFX_KEY, enabled);
    if (enabled) this.unlock();
  }

  setMusicVolume(volume: number) {
    const clamped = Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : DEFAULT_MUSIC_VOLUME));
    this.musicVolume.set(clamped);
    saveVolume(MUSIC_VOLUME_KEY, clamped);
    if (this.musicPlayer) this.musicPlayer.volume = clamped * MUSIC_VOLUME_SCALE;
    if (this.combatPlayer) this.combatPlayer.volume = clamped * MUSIC_VOLUME_SCALE;
    // Regler auf 0 mutet automatisch, Hochschieben hebt den Mute wieder auf.
    if (clamped === 0 && this.musicEnabled()) {
      this.musicEnabled.set(false);
      saveSetting(MUSIC_KEY, false);
      this.musicPlayer?.pause();
      this.combatPlayer?.pause();
    } else if (clamped > 0 && !this.musicEnabled()) {
      this.musicEnabled.set(true);
      saveSetting(MUSIC_KEY, true);
    }
    this.unlock();
  }

  setSfxVolume(volume: number) {
    const clamped = Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : DEFAULT_SFX_VOLUME));
    this.sfxVolume.set(clamped);
    saveVolume(SFX_VOLUME_KEY, clamped);
    // Regler auf 0 mutet automatisch, Hochschieben hebt den Mute wieder auf.
    if (clamped === 0 && this.sfxEnabled()) {
      this.sfxEnabled.set(false);
      saveSetting(SFX_KEY, false);
    } else if (clamped > 0 && !this.sfxEnabled()) {
      this.sfxEnabled.set(true);
      saveSetting(SFX_KEY, true);
    }
    this.unlock();
  }

  /** Soundeffekte wurden nochmals ungefähr verdoppelt; die Musiklautstärke bleibt unverändert. */
  private sfxGainFactor(): number {
    return this.sfxVolume() * 4;
  }

  /** Wechselt manuell zum nächsten Menü-Theme. */
  nextTrack() {
    this.loadTrack((this.currentTrackIndex() + 1) % MENU_TRACKS.length);
    this.unlock();
    if (this.menuActive() && this.musicEnabled()) void this.playMenuMusic();
  }

  /** Wechselt manuell zur nächsten Musik des aktuellen Dungeons. */
  nextCombatTrack() {
    if (!this.combatMusicActive() || this.combatTracks.length === 0) return;
    this.combatTrackIndex = (this.combatTrackIndex + 1) % this.combatTracks.length;
    this.loadCombatTrack();
    this.unlock();
    if (this.musicEnabled()) void this.playCombatMusic();
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
    // Der zentrale SFX-Faktor hebt alle Effekte, einschließlich Klicks, gleichmäßig an.
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
    // Musik startet direkt beim Laden; blockt der Browser Autoplay,
    // versucht es die nächste Berührung oder Taste erneut.
    if (!this.menuActive() || !this.musicEnabled() || !this.musicPlayer) return;
    try {
      await this.musicPlayer.play();
    } catch {
      // Der nächste Tap versucht es erneut, falls der Browser Autoplay noch blockiert.
    }
  }

  private async playCombatMusic() {
    if (!this.unlocked || !this.combatMusicActive() || !this.musicEnabled() || !this.combatPlayer) return;
    try {
      await this.combatPlayer.play();
    } catch {
      // Der nächste Tap versucht es erneut, falls der Browser Autoplay noch blockiert.
    }
  }

  private advanceTrack() {
    if (!this.menuActive() || !this.musicEnabled()) return;
    this.loadTrack((this.currentTrackIndex() + 1) % MENU_TRACKS.length);
    void this.playMenuMusic();
  }

  private advanceCombatTrack() {
    if (!this.combatMusicActive() || !this.musicEnabled() || this.combatTracks.length === 0) return;
    this.combatTrackIndex = (this.combatTrackIndex + 1) % this.combatTracks.length;
    this.loadCombatTrack();
    void this.playCombatMusic();
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

  private loadCombatTrack() {
    if (!this.combatPlayer || this.combatTracks.length === 0) return;
    const src = this.combatTracks[this.combatTrackIndex];
    if (this.combatTheme) {
      this.currentCombatTrackLabel.set(
        `${COMBAT_THEME_LABELS[this.combatTheme]} · Kampfmusik ${this.combatTrackIndex + 1}`,
      );
    }
    this.combatPlayer.src = typeof document === 'undefined'
      ? src
      : new URL(src, document.baseURI).toString();
    this.combatPlayer.load();
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
