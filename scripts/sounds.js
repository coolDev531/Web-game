class SoundsController {
  constructor() {
    this.sounds = {
      shot: new Sound('shot', true),
      explosion: new Sound('explosion', true, 0.4),
      ufoDeath: new Sound('ufoDeath', true),
      coin: new Sound('coin', true, 0.5),
      powerup: new Sound('powerup', false, 1),
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
  constructor(fileName, isSpammable = false, volume = 1, extention = '.ogg') {
    this.audio = new Audio();
    this.audio.src = `sounds/${fileName}${extention}`;
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
