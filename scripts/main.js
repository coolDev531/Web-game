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

  canvas.width = newWidth;
  canvas.height = newHeight;

  // Set the width and height of the canvas using CSS styles
  canvas.style.width = `${newWidth}px`;
  canvas.style.height = `${newHeight}px`;

  play.width = newWidth;
  play.height = newHeight;

  play.boundaries = {
    top: play.height * 0.2, // 20% of canvas height from top
    bottom: play.height * 0.867, // 86.7% of canvas height from top
    left: play.width * 0.111, // 11.1% of canvas width from left
    right: play.width * 0.889, // 88.9% of canvas width from left
  };
}

class GameBasics {
  constructor(canvas) {
    this.canvas = canvas;
    this.width = canvas.width;
    this.height = canvas.height;

    this.level = 1;
    this.score = 0;
    this.shields = 2;

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

    // devTools
    window.goToScene = (sceneKey) => {
      const scene = selectScene(sceneKey);
      this.goToScene(scene);
    };
  }

  gameOver() {
    this.goToScene(new GameOverScene());
  }

  onKeyDown(keyCode) {
    this.pressedKeys[keyCode] = true;

    const currentScene = this.currentScene();
    if (currentScene?.onKeyDown) {
      currentScene.onKeyDown(this, keyCode);
    }
  }

  onKeyUp(keyCode) {
    delete this.pressedKeys[keyCode];
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

const play = new GameBasics(canvas);
play.soundsController = new SoundsController();
play.start();

function selectScene(key) {
  switch (key) {
    case 'opening':
      return new OpeningScene();
    case 'game':
      return new GameScene(this.settings, 1);
  }
}

function getMousePosition(canvas, e) {
  // Get the size of the canvas bounding rect
  const rect = canvas.getBoundingClientRect();
  // Return the mouse coordinates based on the canvas size and the position of the canvas on the screen
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}
