// init class
class TransferPosition {
  constructor(level) {
    this.level = level;
    this.fontSize = 140;
    this.fontColor = 255;
    // this.framesElapsed = 1;
  }

  draw(play) {
    play.clearCanvas();
    ctx.font = `${this.fontSize}px Comic Sans MS`;
    ctx.textAlign = 'center';
    ctx.fillStyle = `rgba(255,${this.fontColor},${this.fontColor},1)`;

    ctx.fillText(
      `Get ready for level ${this.level}`,
      play.width / 2,
      play.height / 2
    );
  }

  update() {
    // 2s 60fps -> 120fps = 2s
    // this.framesElapsed++;

    // if (this.framesElapsed > 120) {
    //   play.goToPosition(new InGamePosition(play.settings, this.level));
    // }

    this.fontSize -= 1;
    this.fontColor -= 1.5;

    if (this.fontSize < 1) {
      play.goToPosition(new InGamePosition(play.setting, this.level));
    }
  }
}
