class GameScene extends Scene {
  constructor(settings, level) {
    super();

    this.settings = settings;
    this.level = level;
  }

  draw(play) {
    super.draw(play);
    ctx.font = '40px Comic Sans MS';
    ctx.fillStyle = '#DFDF01';
    ctx.fillText('We are in InGamePosition', play.width / 2, play.height / 2);
  }
}
