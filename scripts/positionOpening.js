class OpeningPosition {
  constructor() {}

  draw(play) {
    const { width, height } = play;

    // get rid of all the items on the screen
    play.clearCanvas();

    ctx.font = '80px Comic Sans MS';

    ctx.textAlign = 'center';

    /* const gradient = ctx.createLinearGradient(
        play.width / 2 - 180,
        play.height / 2,
        play.width / 2 + 180,
        play.height / 2
        ); */

    // Calculate the left x-coordinate of the gradient's start point as play.width / 2 - 0.2 * play.width
    const startX = width / 2 - 0.2 * width;

    // Calculate the right x-coordinate of the gradient's end point as play.width / 2 + 0.2 * play.width
    const endX = width / 2 + 0.2 * width;

    // Create the gradient with the start point at (startX, play.height / 2) and the end point at (endX, play.height / 2)
    const gradient = ctx.createLinearGradient(
      // Start point of the gradient is 180 pixels to the left of the center of the play area
      startX,
      // Start point of the gradient is at the vertical center of the play area
      height / 2,
      // End point of the gradient is 180 pixels to the right of the center of the play area
      endX,
      // End point of the gradient is at the vertical center of the play area
      height / 2
    );

    gradient.addColorStop(0, 'yellow');
    gradient.addColorStop(0.5, 'red');
    gradient.addColorStop(1.0, 'yellow');
    ctx.fillStyle = gradient;
    ctx.fillText('UFO HUNTER', width / 2, height / 2 - 70);

    // press space to start
    ctx.font = '40px Comic Sans MS';
    ctx.fillStyle = '#D7DF01';
    ctx.fillText('Press Space to Start', width / 2, height / 2);

    // game controls
    ctx.fillStyle = '#2e2f00';
    ctx.fillText('Game Controls', play.width / 2, play.height / 2 + 210);
    ctx.fillText(
      'Left Arrow: Move Left',
      play.width / 2,
      play.height / 2 + 260
    );

    ctx.fillText(
      'Right Arrow: Move Right',
      play.width / 2,
      play.height / 2 + 300
    );

    ctx.fillText('Space: Fire', play.width / 2, play.height / 2 + 340);
  }

  onKeyDown(play, keyCode) {
    if (keyCode === 'Space') {
      // space key
      play.goToPosition(new TransferPosition(play.level));
    }
  }
}
