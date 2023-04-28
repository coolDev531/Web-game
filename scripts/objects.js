class GameObject {
  constructor(x, y, moveSpeed) {
    this.x = x;
    this.y = y;
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
      this.x -= this.moveSpeed * updateSeconds;
    }

    const pressedRight =
      play.pressedKeys['ArrowRight'] || play.pressedKeys['KeyD'];

    if (pressedRight) {
      // right
      this.x += this.moveSpeed * updateSeconds;
    }

    // if (keyCode === 'ArrowUp' || keyCode === 'KeyW') {
    //   // up
    //   this.y -= this.moveSpeed * updateSeconds;
    // }

    // if (keyCode === 'ArrowDown' || keyCode === 'KeyS') {
    //   // down
    //   this.y += this.moveSpeed * updateSeconds;
    // }
  }
}
