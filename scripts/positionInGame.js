class InGamePosition {
  constructor(settings, level) {
    this.settings = settings;
    this.level = level;
  }

  draw(play) {
    ctx.clearRect(0, 0, play.width, play.height);
    ctx.font = '40px Comic Sans MS';
    ctx.fillStyle = '#DFDF01';
    ctx.fillText('We are in InGamePosition', play.width / 2, play.height / 2);
  }
}
