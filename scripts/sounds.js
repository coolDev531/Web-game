class SoundsController {
  constructor() {
    this.sounds = {
      shot: new Sound('shot.mp3', true),
      explosion: new Sound('explosion.mp3', true, 0.5),
      ufoDeath: new Sound('ufoDeath.mp3', true),
      coin: new Sound('coin.mp3', true, 0.5),
    };
  }

  playSound(key) {
    const sound = this.sounds[key];
    sound.play();

    if (sound.isSpammable) {
      sound.setToRandomPitch();
    }

    sound.reset();
  }

  mute() {
    Object.values(this.sounds).forEach((sound) => {
      sound.audio.muted = !sound?.audio?.muted;
    });
  }

  isMuted() {
    return Object.values(this.sounds).every((sound) => sound?.audio?.muted);
  }
}

class Sound {
  constructor(fileName, isSpammable = false, volume = 1) {
    this.audio = new Audio();
    this.audio.src = `../sounds/${fileName}`;
    this.audio.setAttribute('preload', 'auto');
    this.audio.volume = volume;
    this.isSpammable = isSpammable;
  }

  play() {
    this.audio.play();
  }

  reset() {
    this.audio.currentTime = 0;
  }

  setToRandomPitch() {
    const min = 0.9;
    const max = 1.3;
    this.audio.playbackRate = Math.random() * (max - min) + min;
  }
}
