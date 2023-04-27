// init class
class TransferPosition {
  constructor(level) {}

  draw(play) {
    play.clearCanvas();
    ctx.font = '40px Comic Sans MS';
    ctx.fillStyle = '#D7DF01';
    ctx.fillText(
      'We are in Transfer Position',
      play.width / 2,
      play.height / 2
    );
  }
}
