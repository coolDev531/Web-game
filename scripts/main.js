const INITIAL_CANVAS_WIDTH = 900;
const INITIAL_CANVAS_HEIGHT = 750;
const SCROLLBAR_HEIGHT = 20;

const canvas = document.getElementById('ufoCanvas');
const ctx = canvas.getContext('2d');
canvas.width = INITIAL_CANVAS_WIDTH;
canvas.height = INITIAL_CANVAS_HEIGHT;

// canvas doesn't resize without javascript, css doesn't work. which means it'll overflow if we don't fix it
function resize() {
  const windowHeight = window.innerHeight - SCROLLBAR_HEIGHT;
  const windowWidth = window.innerWidth - SCROLLBAR_HEIGHT;

  // Calculate the new width and height based on the window dimensions and canvas aspect ratio
  const windowRatio = windowWidth / windowHeight;
  const canvasRatio = canvas.width / canvas.height;
  let width, height;

  if (windowRatio > canvasRatio) {
    // If the window's aspect ratio is greater than the canvas's aspect ratio,
    // it means that the available width is more constrained than the height.
    height = windowHeight; // Set the height to match the window height

    // Calculate the corresponding width by multiplying the height by the canvas's aspect ratio
    width = height * canvasRatio;
  } else {
    // If the window's aspect ratio is less than or equal to the canvas's aspect ratio,
    // it means that the available height is more constrained than the width.
    width = windowWidth; // Set the width to match the window width

    // Calculate the corresponding height by dividing the width by the canvas's aspect ratio
    height = width / canvasRatio;
  }

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  play.boundaries = {
    top: play.height * 0.2, // 20% of canvas height from top
    bottom: play.height * 0.867, // 86.7% of canvas height from top
    left: play.width * 0.111, // 11.1% of canvas width from left
    right: play.width * 0.889, // 88.9% of canvas width from left
  };
}

class GameController {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;
    this.soundsController = new SoundsController();

    this.level = 1;
    this.score = 0;
    this.shields = 2;
    this.playerPowerUps = 0;

    // this.boundaries = {
    //   top: 150,
    //   bottom: 650,
    //   left: 100,
    //   right: 800,
    // };

    this.boundaries = {
      top: this.height * 0.2, // 20% of canvas height from top
      bottom: this.height * 0.867, // 86.7% of canvas height from top
      left: this.width * 0.111, // 11.1% of canvas width from left
      right: this.width * 0.889, // 88.9% of canvas width from left
    };

    this.settings = {
      // game settings
      updateSeconds: 1 / 60,
      spaceshipSpeed: 200,
      bulletSpeed: 130,
      bulletMaxFrequency: 500, // how many bullets can be fired by the spaceship per second one after another
      ufoRows: 4,
      ufoColumns: 8,
      ufoSpeed: 35,
      ufoSinkingValue: 30, // how many pixels the ufo will sink when it reaches the boundaries
      bombSpeed: 75,
      bombFrequency: 0.05, // how often the ufos will drop bombs
      pointsPerUfo: 25,
      coinSpeed: 125,
      pointsPerCoin: 100,
      powerUpSpeed: 100,
      maxPowerUps: 2,
    };

    // we collect here the different scenes, states of the game
    this.scenesContainer = new Stack();

    this.pressedKeys = {};
  }

  // return to current game scene, status. Always returns to top element of scenes container
  currentScene() {
    return !this.scenesContainer.isEmpty() ? this.scenesContainer.peek() : null;
  }

  goToScene(scene) {
    if (this.currentScene()) {
      this.currentScene().destroy?.();
      this.scenesContainer.clear();
    }

    // if we find an 'awake' fn in a given scene. we call it.
    if (scene.awake) {
      scene.awake(play);
    }

    // setting the current game scene in the scenesContainer
    this.pushScene(scene);
  }

  pushScene(scene) {
    this.scenesContainer.push(scene);
  }

  popScene() {
    // pop in a stack removes the top element so it's the current scene
    this.scenesContainer.pop();
  }

  clearCanvas() {
    ctx.clearRect(0, 0, this.width, this.height);
  }

  start() {
    addEventListeners(this);
    this.goToScene(new OpeningScene());

    const sixtyFps = this.settings.updateSeconds * 1000; // 16.66666667ms
    setInterval(() => gameLoop(this), sixtyFps); // convert to ms
  }

  gameOver() {
    this.goToScene(new GameOverScene());
  }

  onKeyDown(keyCode) {
    this.pressedKeys[keyCode] = true;

    const currentScene = this.currentScene();
    if (currentScene?.onKeyDown) {
      if (play.mouse) {
        play.mouse.isActive = false; // deactivate mouse when pressing keys
      }

      currentScene.onKeyDown(this, keyCode);
    }
  }

  onKeyUp(keyCode) {
    delete this.pressedKeys[keyCode];
  }

  incrementScore(points) {
    this.score += points;

    const isMultipleOfTenThousand = this.score % 10000 === 0;
    if (isMultipleOfTenThousand) {
      this.shields += 1;
      this.soundsController.playSound('powerup');
    }
  }

  resetStats() {
    this.level = 1;
    this.score = 0;
    this.shields = 2;
    this.playerPowerUps = 0;
  }
}

function gameLoop(play) {
  const currentScene = play.currentScene();

  if (!currentScene) {
    return;
  }

  currentScene.update?.(play);
  currentScene.draw?.(play);
}

function addEventListeners(play) {
  // Call resize() when the page is loaded, to set the initial size of the canvas
  window.addEventListener('load', resize, false);

  // Call resize() whenever the window is resized, to update the size of the canvas
  window.addEventListener('resize', resize);

  window.addEventListener('keydown', (e) => {
    const keyCode = e.code;

    if (
      keyCode === 'ArrowLeft' ||
      keyCode === 'ArrowRight' ||
      keyCode === 'Space'
    ) {
      // Prevent the event from triggering browser navigation shortcuts like Back
      e.preventDefault();
    }

    play.onKeyDown(keyCode);
  });

  window.addEventListener('keyup', (e) => {
    const keyCode = e.code;
    play.onKeyUp(keyCode);
  });

  // mouse movement
  window.addEventListener('mousemove', (e) => {
    // Get the position of the mouse relative to the canvas
    const mousePosition = getMousePosition(play.canvas, e);
    const mouseX = mousePosition.x;
    const mouseY = mousePosition.y;

    play.mouse = {
      isActive: true,
      position: {
        x: mouseX,
        y: mouseY,
      },
    };
  });

  window.addEventListener('mouseout', () => {
    play.mouse.isActive = false;
  });
}

const play = new GameController(canvas);
play.start();

function getMousePosition(canvas, e) {
  const rect = canvas.getBoundingClientRect();

  // Calculate the scaling factor between the canvas size and the displayed size
  const scale = canvas.width / rect.width;

  // Return the scaled mouse coordinates relative to the canvas size
  return {
    x: (e.clientX - rect.left) * scale,
    y: (e.clientY - rect.top) * scale,
  };
}

window.goToLevel = (level) => {
  play.goToScene(new TransferScene(level));
};
