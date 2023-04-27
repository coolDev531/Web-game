const INITIAL_CANVAS_WIDTH = 900;
const INITIAL_CANVAS_HEIGHT = 750;
const SCROLLBAR_HEIGHT = 20;

const canvas = document.getElementById('ufoCanvas');
const ctx = canvas.getContext('2d');
canvas.width = INITIAL_CANVAS_WIDTH;
canvas.height = INITIAL_CANVAS_HEIGHT;

// canvas doesn't resize without javascript, css doesn't work. which means it'll overflow if we don't fix it
function resize() {
  // Get the height of the window, accounting for the height of the scrollbar
  const windowHeight = window.innerHeight - SCROLLBAR_HEIGHT;

  // Get the width of the window
  const windowWidth = window.innerWidth - SCROLLBAR_HEIGHT; // give it some padding so it doesn't overflow

  // Determine the maximum height and width that the canvas can be based on the original dimensions
  const maxHeight = INITIAL_CANVAS_HEIGHT;
  const maxWidth = INITIAL_CANVAS_WIDTH;

  // Choose the smaller of the window height and max height, and the smaller of the window width and max width
  const height = Math.min(windowHeight, maxHeight);
  const width = Math.min(windowWidth, maxWidth);

  // Calculate the aspect ratio of the canvas based on the original dimensions
  const heightRatio = height / INITIAL_CANVAS_HEIGHT;
  const widthRatio = width / INITIAL_CANVAS_WIDTH;

  // Choose the smaller of the height and width ratios, so that the canvas will fit within the window
  const ratio = Math.min(heightRatio, widthRatio);

  // Calculate the new width and height of the canvas based on the aspect ratio and the original dimensions
  const newWidth = INITIAL_CANVAS_WIDTH * ratio;
  const newHeight = INITIAL_CANVAS_HEIGHT * ratio;

  // Set the width and height of the canvas using CSS styles
  canvas.style.width = `${newWidth}px`;
  canvas.style.height = `${newHeight}px`;
}

// Call resize() when the page is loaded, to set the initial size of the canvas
window.addEventListener('load', resize, false);

// Call resize() whenever the window is resized, to update the size of the canvas
window.addEventListener('resize', resize);

class GameBasics {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;

    // this.playBoundaries = {
    //   top: 150,
    //   bottom: 650,
    //   left: 100,
    //   right: 800,
    // };

    this.playBoundaries = {
      top: this.height * 0.2, // 20% of canvas height from top
      bottom: this.height * 0.867, // 86.7% of canvas height from top
      left: this.width * 0.111, // 11.1% of canvas width from left
      right: this.width * 0.889, // 88.9% of canvas width from left
    };

    this.setting = {
      // game settings
      updateMilliseconds: 1000 / 60,
    };

    // we collect here the different positions, states of the game
    this.positionContainer = new Stack();
  }

  // return to current game position, status. Always returns to top element of position container
  currentPosition() {
    return !this.positionContainer.isEmpty()
      ? this.positionContainer.peek()
      : null;
  }

  goToPosition(position) {
    if (this.currentPosition()) {
      this.positionContainer.clear();
    }

    // if we find an 'entry' in a given position. we call it.
    if (position.entry) {
      position.entry(play);
    }

    // setting the current game position in the positionContainer
    this.pushPosition(position);
  }

  pushPosition(position) {
    this.positionContainer.push(position);
  }

  popPosition() {
    this.positionContainer.pop();
  }

  start() {
    setInterval(() => {
      gameLoop(this);
    }, this.setting.updateMilliseconds);

    this.goToPosition(new OpeningPosition());
  }
}

const play = new GameBasics(canvas);
play.start();

function gameLoop(play) {
  let currentPosition = play.currentPosition();
  if (currentPosition) {
    // update
    if (currentPosition.update) {
      currentPosition.update(play);
    }

    // draw
    if (currentPosition.draw) {
      currentPosition.draw(play);
    }
  }
}
