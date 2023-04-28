class Scene {
  constructor() {
    this.framesElapsed = 0;
  }

  draw(play) {
    // Base draw method that clears the canvas
    play.clearCanvas();
  }

  update(play) {
    // Base update method that increments the frames elapsed
    this.framesElapsed++;
  }
}
