class GameOverScene extends Scene {
  constructor() {
    super();
  }

  draw(play) {
    super.draw(play);
    ctx.font = '40px Comic Sans MS';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Game Over!', play.width / 2, play.height / 2 - 120);

    ctx.font = '36px Comic Sans MS';
    ctx.fillStyle = '#D7DF01';
    ctx.fillText(
      "You've reached level " +
        play.level +
        ' and your score is ' +
        play.score +
        '.',
      play.width / 2,
      play.height / 2 - 40
    );

    ctx.font = '36px Comic Sans MS';
    ctx.fillStyle = '#D7DF01';
    ctx.fillText(
      "Press 'Space' to continue.",
      play.width / 2,
      play.height / 2 + 40
    );
  }

  onKeyDown(play, keyCode) {
    if (keyCode === 'Space') {
      play.goToScene(new OpeningScene());
    }
  }
}
