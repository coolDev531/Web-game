class GameScene extends Scene {
  constructor(settings, level) {
    super();

    this.settings = settings;
    this.level = level;
    this.object = null;
    this.spaceship = null;
    // this.spaceshipSpeed = this.settings.spaceshipSpeed;
  }

  // another possible names for 'entry': awake, start
  onMounted(play) {
    this.spaceship = new Spaceship(
      play.width / 2,
      play.boundaries.bottom,
      play.settings.spaceshipSpeed
    );
  }

  update(play) {
    this.spaceship.handleMovement(play);
  }

  draw(play) {
    super.draw(play);

    ctx.drawImage(
      this.spaceship.image,
      this.spaceship.position.x - this.spaceship.width / 2, // we want to make sure we're handling the center of the spaceship image and not the top left corner
      this.spaceship.position.y - this.spaceship.height / 2 // we want to make sure we're handling the center of the spaceship image
    );
  }
}
