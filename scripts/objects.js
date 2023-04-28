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

  move(play, direction) {
    const { updateSeconds } = play.settings;

    switch (direction) {
      case 'left':
        this.position.x -= this.moveSpeed * updateSeconds;
        break;
      case 'right':
        this.position.x += this.moveSpeed * updateSeconds;
        break;

      /* in mathematics, the positive y-axis generally points upwards and the negative y-axis points downwards.
        However, in computer graphics, it's common for the positive y-axis to point downwards instead.
         which is why we're using the opposite of what we would expect for moving up and down */

      /* 
      This may seem counterintuitive at first, but it's often more convenient for representing screen coordinates,
       because the origin (0, 0) is located at the top-left corner of the screen. 
       So, increasing the y-coordinate moves the object downwards, towards the bottom of the screen.
      */
      case 'up':
        /* When moving up, the y-coordinate is decremented by the moveSpeed multiplied by updateSeconds,
           which makes sense because moving up means the object is moving towards the top of the screen */
        this.position.y -= this.moveSpeed * updateSeconds;
        break;
      case 'down':
        /* when moving down, the y - coordinate is incremented, 
         which makes sense because moving down means the object is moving towards the bottom of the screen */
        this.position.y += this.moveSpeed * updateSeconds;
        break;
    }
  }
}

class Spaceship extends GameObject {
  constructor(x, y, moveSpeed) {
    super(x, y, moveSpeed);

    this.image.src = 'images/spaceship.png';
  }

  handleShoot(play, scene) {
    // only allow shooting if the last bullet time is null or if the current time - last bullet time is greater than the max frequency
    const shootingEnabled =
      scene.lastBulletTime === null ||
      new Date().getTime() - scene.lastBulletTime >
        play.settings.bulletMaxFrequency;

    if (!shootingEnabled || !play.pressedKeys['Space']) return;

    const bullet = new Bullet(
      this.position.x,
      // we want to make sure that the bullet will be created at the top of the spaceship
      this.position.y - this.height / 2,
      play.settings.bulletSpeed
    );
    scene.bullets.push(bullet);
    scene.lastBulletTime = new Date().getTime();
  }

  handleMovement(play) {
    const pressedLeft =
      play.pressedKeys['ArrowLeft'] || play.pressedKeys['KeyA'];

    if (pressedLeft) {
      this.move(play, 'left'); // move() derived from GameObject super class
    }

    const pressedRight =
      play.pressedKeys['ArrowRight'] || play.pressedKeys['KeyD'];

    if (pressedRight) {
      this.move(play, 'right'); // move() derived from GameObject super class
    }

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

  draw(fillStyle = '#ff0000') {
    ctx.fillStyle = fillStyle;

    // decrementing the x and y values so it's going up
    ctx.fillRect(this.position.x - 1, this.position.y - 6, 2, 6);
  }

  action(play, index) {
    this.move(play, 'up'); // move() derived from GameObject super class

    // if the bullet is out of the canvas, remove it from the bullets array
    // in canvas the top left corner is 0,0
    if (this.position.y < 0) {
      play.currentScene().bullets.splice(index, 1);
    }
  }
}
