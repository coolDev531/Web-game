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
