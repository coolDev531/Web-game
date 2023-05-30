class GameObject {
  constructor(x, y, moveSpeed) {
    this.position = {
      x,
      y,
    };

    this.moveSpeed = moveSpeed;
  }

  setImage(src, { width, height } = {}) {
    this.image = new Image();
    this.image.onload = () => {
      this.width = width || this.image.naturalWidth;
      this.height = height || this.image.naturalHeight;
    };
    this.image.src = src;
    this.image.width = this.width;
    this.image.height = this.height;
  }

  drawImage() {
    ctx.drawImage(
      this.image,
      this.position.x - this.width / 2, // we want to make sure we're handling the center of the spaceship image and not the top left corner
      this.position.y - this.height / 2, // we want to make sure we're handling the center of the spaceship image
      this.width,
      this.height
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
    if (!this.position || !gameObject?.position) return;

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

    this.canHit = true;

    this.setImage('images/spaceship.png', {
      width: 34,
      height: 28,
    });

    window.addEventListener('mousedown', () => {
      this.isMouseDown = true;
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });
  }

  draw(play) {
    this.drawImage(play);
  }

  update(play) {
    this.handleMovement(play);
    this.handleShoot(play, play.currentScene());
  }

  removeEventListeners() {
    window.removeEventListener('mousedown', () => {
      this.isMouseDown = true;
    });

    window.removeEventListener('mouseup', () => {
      this.isMouseDown = false;
    });
  }

  handleShoot(play, scene) {
    // only allow shooting if the last bullet time is null or if the current time - last bullet time is greater than the max frequency
    const shootingEnabled =
      scene.lastBulletTime === null ||
      new Date().getTime() - scene.lastBulletTime >
        play.settings.bulletMaxFrequency;

    const shotPressed = play.pressedKeys['Space'] || this.isMouseDown;

    if (!shootingEnabled || !shotPressed) return;

    const bulletMiddle = new Bullet(
      this.position.x,
      // we want to make sure that the bullet will be created at the top of the spaceship
      this.position.y - this.height / 2,
      play.settings.bulletSpeed
    );

    scene.bullets.push(bulletMiddle);

    // bullet left and middle are if powerups are collected
    const bulletLeft = new Bullet(
      this.position.x - this.width / 2,
      this.position.y - this.height / 2,
      play.settings.bulletSpeed
    );

    const bulletRight = new Bullet(
      this.position.x + this.width / 2,
      this.position.y - this.height / 2,
      play.settings.bulletSpeed
    );

    if (play.playerPowerUps === 1) {
      bulletMiddle.position.x = this.position.x + this.width / 2; // move the bullet to the right because we only have 2 bullets
      scene.bullets.push(bulletLeft);
    }

    if (play.playerPowerUps === 2) {
      scene.bullets.push(bulletLeft);
      scene.bullets.push(bulletRight);
    }

    play.soundsController.playSound('shot');
    scene.lastBulletTime = new Date().getTime();
  }

  handleMovement(play) {
    const pressedLeft =
      play.pressedKeys['ArrowLeft'] || play.pressedKeys['KeyA'];
    const pressedRight =
      play.pressedKeys['ArrowRight'] || play.pressedKeys['KeyD'];

    if (pressedLeft) {
      this.move(play, 'left'); // move() derived from GameObject super class
    } else if (pressedRight) {
      this.move(play, 'right'); // move() derived from GameObject super class
    } else if (play.mouse?.isActive) {
      const mouseX = play.mouse?.position?.x;
      // not pressing keys, move the spaceship with the mouse
      // if the mouse is to the left of the spaceship, move left
      const nextDirection = mouseX < this.position.x ? 'left' : 'right';

      // dont move if the mouse is on the spaceship
      if (Mathf.distance(mouseX, this.position.x) < 2.1) return;

      // write code to handle that below
      this.move(play, nextDirection);
    }

    this.keepInBoundaries(play);
  }

  keepInBoundaries(play) {
    const { clampedX, clampedY } = this.getBoundaries(play);
    this.position.x = clampedX;
    this.position.y = clampedY; // don't actually need this clampedY because we're not moving up and down we're only moving left and right check handleMovement()
  }

  damage(play, amountDealt = 1) {
    if (!this.canHit) return;

    play.soundsController.playSound('explosion');

    this.canHit = false;

    setTimeout(() => {
      this.canHit = true;
    }, play.settings.spaceshipHitDelay);

    // game over
    if (play.shields === 0) {
      play.gameOver();
    }

    play.shields -= amountDealt;
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
  constructor(x, y, moveSpeed, row, column, level) {
    super(x, y, moveSpeed);
    this.row = row;
    this.column = column;

    const isEvenLevel = level % 2 === 0;
    const imageSrc = isEvenLevel ? 'images/ufo2.png' : 'images/ufo.png';

    this.setImage(imageSrc, {
      width: 32,
      height: 24,
    });
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

class Coin extends GameObject {
  constructor(x, y, moveSpeed) {
    super(x, y, moveSpeed);
    this.setImage('images/coin.png', {
      width: 30,
      height: 30,
    });
  }

  draw(play) {
    this.drawImage();
  }

  drop(play, index) {
    this.move(play, 'down'); // move() derived from GameObject super class
    this.removeIfCollidedWithBottomBoundary(play, index);
  }

  removeIfCollidedWithBottomBoundary(play, index) {
    if (this.position.y > play.height) {
      play.currentScene().coins.splice(index, 1);
    }
  }
}

class Powerup extends GameObject {
  constructor(x, y, moveSpeed) {
    super(x, y, moveSpeed);

    this.setImage('images/powerup.png', {
      width: 30,
      height: 30,
    });
  }

  draw(play) {
    this.drawImage();
  }

  drop(play, index) {
    this.move(play, 'down'); // move() derived from GameObject super class
    this.removeIfCollidedWithBottomBoundary(play, index);
  }

  removeIfCollidedWithBottomBoundary(play, index) {
    if (this.position.y > play.height) {
      play.currentScene().powerUps.splice(index, 1);
    }
  }
}

class Asteroid extends GameObject {
  constructor(x, y, moveSpeed) {
    super();
    this.canHit = true;
    this.health = 3;

    this.position = {
      x,
      y,
    };

    this.moveSpeed = {
      x: moveSpeed,
      y: moveSpeed,
    };

    this.setImage('images/asteroid.png', {
      width: 64,
      height: 64,
    });
  }

  draw(play) {
    this.drawImage();
  }

  update(play) {
    this.dvdLogoIt(play);

    const spaceship = play.currentScene().spaceship;

    this.onCollision(
      spaceship,
      () => {
        spaceship.damage(play);
      },
      {
        topPadding: 10,
        rightPadding: 10,
        leftPadding: 10,
      }
    );
  }

  damage(play, index) {
    if (!this.canHit) return;

    this.canHit = false;
    this.health -= 1;

    setTimeout(() => {
      this.canHit = true;
    }, 1000);

    play.soundsController.playSound('ufoDeath');

    if (this.health > 0) return;

    play.incrementScore(play.settings.pointsPerAsteroid);
    play.currentScene().asteroids.splice(index);
  }

  dvdLogoIt(play) {
    // // move like the dvd logo thing, bounce off the walls
    const { clampedX, clampedY } = this.getBoundaries(play);

    if (clampedX !== this.position.x) {
      this.position.x = clampedX;
      this.moveSpeed.x *= -1;
    }
    if (clampedY !== this.position.y) {
      this.position.y = clampedY;
      this.moveSpeed.y *= -1;
    }
    this.position.x += this.moveSpeed.x * play.settings.updateSeconds;
    this.position.y += this.moveSpeed.y * play.settings.updateSeconds;
  }
}
