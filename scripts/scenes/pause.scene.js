class PauseScene extends Scene {
  constructor() {
    super();
  }

  draw(play) {
    ctx.clearRect(0, 0, play.width, play.height);
    ctx.font = '40px Comic Sans MS';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('Paused', play.width / 2, play.height / 2 - 300);

    ctx.fillStyle = '#D7DF01';
    ctx.font = '36px Comic Sans MS';
    ctx.fillText(
      'ESC: back to the current game',
      play.width / 2,
      play.height / 2 - 250
    );
    ctx.fillText(
      'Enter: quit the current game',
      play.width / 2,
      play.height / 2 - 210
    );

    ctx.font = '40px Comic Sans MS';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      'Game controls reminder',
      play.width / 2,
      play.height / 2 - 120
    );
    ctx.fillStyle = '#D7DF01';
    ctx.font = '36px Comic Sans MS';
    ctx.fillText(
      'Left Arrow : Move Left',
      play.width / 2,
      play.height / 2 - 70
    );
    ctx.fillText(
      'Right Arrow : Move Right',
      play.width / 2,
      play.height / 2 - 30
    );
    ctx.fillText('Space : Fire', play.width / 2, play.height / 2 + 10);
  }

  update(play) {}

  onKeyDown(play, keyCode) {
    if (keyCode === 'Escape') {
      play.popScene();
    }

    if (keyCode === 'Enter') {
      play.goToScene(new OpeningScene());
    }
  }
}
