class GameObject {
  constructor(x, y, moveSpeed) {
    this.position = {
      x,
      y,
    };

    this.moveSpeed = moveSpeed;

    this.width = null;
    this.height = null;
  }

  setImage(src) {
    this.image = new Image();
    this.image.onload = () => {
      this.width = this.image.naturalWidth;
      this.height = this.image.naturalHeight;
    };
    this.image.src = src;
  }

  drawImage() {
    ctx.drawImage(
      this.image,
      this.position.x - this.width / 2, // we want to make sure we're handling the center of the spaceship image and not the top left corner
      this.position.y - this.height / 2 // we want to make sure we're handling the center of the spaceship image
    );
  }

  move(play, direction) {
    const { updateSeconds } = play.settings;

    const operations = {
      left: () => (this.position.x -= this.moveSpeed * updateSeconds),
      right: () => (this.position.x += this.moveSpeed * updateSeconds),

      /*  in mathematics, the positive y-axis generally points upwards and the negative y-axis points downwards.
          However, in computer graphics, it's common for the positive y-axis to point downwards instead.
          which is why we're using the opposite of what we would expect for moving up and down 
          This may seem counterintuitive at first, but it's often more convenient for representing screen coordinates,
          because the origin (0, 0) is located at the top-left corner of the screen. 
          So, increasing the y-coordinate moves the object downwards, towards the bottom of the screen.
      */
      up: () => (this.position.y -= this.moveSpeed * updateSeconds),
      down: () => (this.position.y += this.moveSpeed * updateSeconds),
    };

    operations[direction]();
  }

  isCollisionWith(
    gameObject,
    { topPadding = 0, rightPadding = 0, leftPadding = 0 }
  ) {
    const left =
      this.position.x + leftPadding >=
      gameObject.position.x - gameObject.width / 2;
    const right =
      this.position.x + rightPadding <=
      gameObject.position.x + gameObject.width / 2;
    const top =
      this.position.y + topPadding >=
      gameObject.position.y - gameObject.height / 2;
    const bottom =
      this.position.y <= gameObject.position.y + gameObject.height / 2;

    return left && right && top && bottom;
  }

  onCollision(
    gameObject,
    callback,
    paddingOptions = { topPadding: 0, rightPadding: 0, leftPadding: 0 }
  ) {
    if (this.isCollisionWith(gameObject, paddingOptions)) {
      callback();
    }
  }

  getBoundaries(play) {
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

    return {
      clampedX,
      clampedY,
    };
  }
}

class Spaceship extends GameObject {
  constructor(x, y, moveSpeed) {
    super(x, y, moveSpeed);

    this.setImage('images/spaceship.png');
  }

  draw(play) {
    this.drawImage(play);
  }

  update(play) {
    this.handleMovement(play);
    this.handleShoot(play, play.currentScene());
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

    play.soundsController.playSound('shot');
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
    const { clampedX, clampedY } = this.getBoundaries(play);
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

  fire(play, index) {
    this.move(play, 'up'); // move() derived from GameObject super class
    this.removeIfCollidedWithTopBoundary(play, index);
  }

  removeIfCollidedWithTopBoundary(play, index) {
    // if the bullet is out of the canvas, remove it from the bullets array
    // in canvas the top left corner is 0,0
    if (this.position.y < 0) {
      play.currentScene().bullets.splice(index, 1);
    }
  }
}

class Ufo extends GameObject {
  constructor(x, y, moveSpeed, row, column) {
    super(x, y, moveSpeed);
    this.row = row;
    this.column = column;

    this.setImage('images/ufo.png');
  }

  draw() {
    this.drawImage();
  }

  move(play, turnAround) {
    return (this.position.x +=
      this.moveSpeed * play.settings.updateSeconds * turnAround);
  }

  getNextPosition(play, ufoTurnAround, horizontalMoving, verticalMoving) {
    const { updateSeconds } = play.settings;

    const newX =
      this.position.x +
      this.moveSpeed * updateSeconds * ufoTurnAround * horizontalMoving;

    const newY =
      this.position.y + this.moveSpeed * updateSeconds * verticalMoving;

    const reachedLeftOrRightBoundary =
      newX >= play.boundaries.right || newX <= play.boundaries.left;

    return {
      newX,
      newY,
      horizontalMoving,
      verticalMoving,
      reachedLeftOrRightBoundary,
    };
  }
}

// the bomb dropped by the ufo
class Bomb extends GameObject {
  constructor(x, y, moveSpeed) {
    super(x, y, moveSpeed);
  }

  draw(play) {
    ctx.fillStyle = '#FE2EF7';
    ctx.fillRect(this.position.x - 2, this.position.y, 4, 6);
  }

  drop(play, index) {
    this.move(play, 'down'); // move() derived from GameObject super class
    this.removeIfCollidedWithBottomBoundary(play, index);
  }

  removeIfCollidedWithBottomBoundary(play, index) {
    if (this.position.y > play.height) {
      play.currentScene().bombs.splice(index, 1);
    }
  }
}
