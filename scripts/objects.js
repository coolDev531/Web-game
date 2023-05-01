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
    this.turnAround = 1;
    this.row = row;
    this.column = column;

    this.setImage('images/ufo.png');
  }

  draw() {
    this.drawImage();
  }

  update(play, levelMoveSpeed) {
    this.position.x +=
      levelMoveSpeed * play.settings.updateSeconds * this.turnAround;

    this.onBoundaryCollision(play);
    // this.keepInBoundaries(play);
  }

  // if the ufo is on the boundary, turn around
  onBoundaryCollision(play) {
    const { clampedX } = this.getBoundaries(play);

    /* clampedX is the x position of the ufo after it has been clamped to the boundaries of the canvas
       if the ufo is on the left boundary, clampedX will be equal to the left boundary
       if the ufo is on the right boundary, clampedX will be equal to the right boundary
       if the ufo is not on the boundary, clampedX will be equal to the ufo's current x position
    */

    /* why are we comparing clamedX with this.position.x?
       because we want to know if the ufo is on the boundary
       if the ufo is on the boundary, clampedX will be different from this.position.x
       if the ufo is not on the boundary, clampedX will be equal to this.position.x 
    */

    if (clampedX !== this.position.x) {
      this.turnAround *= -1;
    }
  }
}
