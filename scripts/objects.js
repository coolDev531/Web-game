class GameObject {
  constructor(x, y, moveSpeed) {
    this.position = {
      x,
      y,
    };

    this.moveSpeed = moveSpeed;

    this.width = null;
    this.height = null;

    this.image = new Image();
    this.image.onload = () => {
      this.width = this.image.naturalWidth;
      this.height = this.image.naturalHeight;
    };
  }
}

class Spaceship extends GameObject {
  constructor(x, y, moveSpeed) {
    super(x, y, moveSpeed);

    this.image.src = 'images/spaceship.png';
  }

  handleShoot(play, scene) {
    // only allow shooting if the last bullet time is null or if the current time - last bullet time is greater than the max frequency
    if (
      scene.lastBulletTime === null ||
      new Date().getTime() - scene.lastBulletTime >
        play.settings.bulletMaxFrequency
    ) {
      const pressedSpace = play.pressedKeys['Space'];
      if (pressedSpace) {
        const bullet = new Bullet(
          this.position.x,
          // we want to make sure that the bullet will be created at the top of the spaceship
          this.position.y - this.height / 2,
          play.settings.bulletSpeed
        );
        scene.bullets.push(bullet);
        scene.lastBulletTime = new Date().getTime();
      }
    }
  }

  handleMovement(play) {
    const { updateSeconds } = play.settings;

    const pressedLeft =
      play.pressedKeys['ArrowLeft'] || play.pressedKeys['KeyA'];

    if (pressedLeft) {
      // left
      this.position.x -= this.moveSpeed * updateSeconds;
    }

    const pressedRight =
      play.pressedKeys['ArrowRight'] || play.pressedKeys['KeyD'];

    if (pressedRight) {
      // right
      this.position.x += this.moveSpeed * updateSeconds;
    }

    // const pressedUp = play.pressedKeys['ArrowUp'] || play.pressedKeys['KeyW'];
    // if (pressedUp) {
    //   // up
    //   this.y -= this.moveSpeed * updateSeconds;
    // }

    // if (keyCode === 'ArrowDown' || keyCode === 'KeyS') {
    //   // down
    //   this.y += this.moveSpeed * updateSeconds;
    // }

    this.keepInBoundaries(play);
  }

  keepInBoundaries(play) {
    const clampedX = Mathf.clamp(
      this.position.x,
      play.boundaries.left,
      play.boundaries.right
    );
    const clampedY = Mathf.clamp(
      this.position.y,
      play.boundaries.top,
      play.boundaries.bottom
    );

    this.position.x = clampedX;
    this.position.y = clampedY; // don't actually need this clampedY because we're not moving up and down we're only moving left and right check handleMovement()
  }
}

class Bullet extends GameObject {
  constructor(x, y, moveSpeed) {
    super(x, y, moveSpeed);
  }

  create(fillStyle = '#ff0000') {
    ctx.fillStyle = fillStyle;

    // decrementing the x and y values so it's going up
    ctx.fillRect(this.position.x - 1, this.position.y - 6, 2, 6);
  }

  move(play, index) {
    const { updateSeconds } = play.settings;

    this.position.y -= updateSeconds * this.moveSpeed;

    // if the bullet is out of the canvas, remove it from the bullets array
    // in canvas the top left corner is 0,0
    if (this.position.y < 0) {
      play.currentScene().bullets.splice(index, 1);
    }
  }
}
