export type SoundName =
  | 'shoot'
  | 'dash'
  | 'radar'
  | 'heal'
  | 'speed'
  | 'hit'
  | 'freeze'
  | 'invisibility'
  | 'wall'
  | 'victory'
  | 'defeat'
  | 'click'
  | 'background';

const SOUND_ENABLED_KEY = 'blobby-sound-enabled';

const soundPaths: Record<SoundName, string> = {
  shoot: '/sounds/shoot.mp3',
  dash: '/sounds/dash.mp3',
  radar: '/sounds/radar.mp3',
  heal: '/sounds/heal.mp3',
  speed: '/sounds/speed.mp3',
  hit: '/sounds/hit.mp3',
  freeze: '/sounds/freeze.mp3',
  invisibility: '/sounds/invisibility.mp3',
  wall: '/sounds/wall.mp3',
  victory: '/sounds/victory.mp3',
  defeat: '/sounds/defeat.mp3',
  click: '/sounds/click.mp3',
  background: '/sounds/background.mp3',
};

const cache = new Map<SoundName, HTMLAudioElement>();
const activeSounds = new Set<HTMLAudioElement>();

let soundEnabled = readSavedSoundPreference();
let masterVolume = 0.55;
let backgroundMusic: HTMLAudioElement | null = null;

function readSavedSoundPreference() {
  try {
    return localStorage.getItem(SOUND_ENABLED_KEY) !== 'false';
  } catch {
    return true;
  }
}

function saveSoundPreference(enabled: boolean) {
  try {
    localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
  } catch {}
}

function getAudio(name: SoundName) {
  const cached = cache.get(name);
  if (cached) return cached;

  const audio = new Audio(soundPaths[name]);
  audio.preload = 'auto';
  audio.volume = masterVolume;
  audio.muted = !soundEnabled;
  cache.set(name, audio);
  return audio;
}

function stopActiveSounds() {
  activeSounds.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
  activeSounds.clear();
}

export function getSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  saveSoundPreference(enabled);

  cache.forEach((audio) => {
    audio.muted = !enabled;
  });

  if (!enabled) {
    stopActiveSounds();
    stopBackgroundMusic();
  }
}

export function setMasterVolume(volume: number) {
  masterVolume = Math.max(0, Math.min(1, volume));

  cache.forEach((audio) => {
    audio.volume = masterVolume;
  });

  activeSounds.forEach((audio) => {
    audio.volume = masterVolume;
  });

  if (backgroundMusic) {
    backgroundMusic.volume = Math.min(0.28, masterVolume * 0.45);
  }
}

export function playSound(name: SoundName, volume = 1) {
  if (!soundEnabled) return;

  try {
    const baseSound = getAudio(name);
    const sound = baseSound.cloneNode(true) as HTMLAudioElement;

    sound.muted = !soundEnabled;
    sound.volume = Math.max(0, Math.min(1, masterVolume * volume));
    sound.currentTime = 0;

    activeSounds.add(sound);
    sound.addEventListener('ended', () => activeSounds.delete(sound), { once: true });
    sound.addEventListener('pause', () => activeSounds.delete(sound), { once: true });

    void sound.play().catch(() => {
      activeSounds.delete(sound);
      // Les navigateurs bloquent le son tant que l'utilisateur n'a pas interagi avec la page.
    });
  } catch {
    // Si le fichier n'existe pas encore, on ignore simplement le son.
  }
}

export function playBackgroundMusic() {
  if (!soundEnabled) return;

  try {
    if (!backgroundMusic) {
      backgroundMusic = getAudio('background');
      backgroundMusic.loop = true;
    }

    backgroundMusic.muted = !soundEnabled;
    backgroundMusic.volume = Math.min(0.28, masterVolume * 0.45);
    void backgroundMusic.play().catch(() => {});
  } catch {}
}

export function stopBackgroundMusic() {
  if (!backgroundMusic) return;
  backgroundMusic.pause();
  backgroundMusic.currentTime = 0;
}
