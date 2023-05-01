class GameScene extends Scene {
  constructor(settings, level) {
    super();

    this.settings = settings;
    this.level = level;
    this.object = null;
    this.spaceship = null;
    this.bullets = [];
    this.lastBulletTime = null;
    this.ufos = []; // enemies
    this.ufoSpeed = settings.ufoSpeed;
  }

  awake(play) {
    this.spaceship = new Spaceship(
      play.width / 2,
      play.boundaries.bottom,
      play.settings.spaceshipSpeed
    );

    // create enemies
    this.spawnUfos(play);

    window.addEventListener('resize', this.handleResize, true);
  }

  update(play) {
    this.spaceship.update(play);

    // move bullets
    this.bullets.forEach((bullet, index) => {
      bullet.fire(play, index);
    });

    // move enemies
    this.ufos.forEach((ufo) => {
      ufo.update(play, this.ufoSpeed);
    });
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize, true);
  }

  draw(play) {
    super.draw(play);

    this.spaceship.draw();

    // draw bullets
    this.bullets.forEach((bullet) => {
      bullet.draw();
    });

    // draw enemies
    this.ufos.forEach((ufo) => {
      ufo.draw();
    });
  }

  spawnUfos(play) {
    this.ufoSpeed = play.settings.ufoSpeed + this.level * 7; // increase the speed of the ufos by 7 for each level
    const maxRows = play.settings.ufoRows;
    const maxColumns = play.settings.ufoColumns;
    const initialUfos = [];

    let currentRow, currentColumn;

    for (currentRow = 0; currentRow < maxRows; currentRow++) {
      for (currentColumn = 0; currentColumn < maxColumns; currentColumn++) {
        let x, y;
        x = play.width / 2 + currentColumn * 50 - (maxColumns - 1) * 25; // maxColumns - 1 * 25 is to center the ufos, 50 is the distance between the ufos on the horizontal axis (x) and 25 is half of that distance
        y = play.boundaries.top + 30 + currentRow * 30; // the distance is going to be 30 pixels between the ufos on the vertical axis

        initialUfos.push(
          new Ufo(x, y, this.ufoSpeed, currentRow, currentColumn)
        );

        // console.log(
        //   `UFO placed at row: ${currentRow}, column: ${currentColumn}, x: ${x}, y: ${y}`
        // );
      }
    }

    this.ufos = initialUfos;
  }

  handleResize() {
    // can't pass play to this function to get current scene because the removeEventListener will not work so using global currentScene from window
    window.currentScene.spaceship.position.x = play.width / 2;
    window.currentScene.spaceship.position.y = play.boundaries.bottom;
  }

  // we're going to have 4 columns and 4 lines,
  // each enemy is 32px wide and 24px tall
}
