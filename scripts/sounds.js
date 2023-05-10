class SoundsController {
  constructor() {
    this.sounds = {
      shot: new Sound('shot.mp3', true),
      explosion: new Sound('explosion.mp3'),
      ufoDeath: new Sound('ufoDeath.mp3'),
    };
  }

  init(fileName) {}

  mute() {}

  playSound(key) {
    const sound = this.sounds[key];
    sound.play();

    sound.reset();

    if (sound.isSpammable) {
      sound.setToRandomPitch();
    }
  }
}

class Sound {
  constructor(fileName, isSpammable = false) {
    this.audio = new Audio();
    this.audio.src = `../sounds/${fileName}`;
    this.audio.setAttribute('preload', 'auto');
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
    const max = 1.1;
    this.audio.playbackRate = Math.random() * (max - min) + min;
  }
}
