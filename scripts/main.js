const INITIAL_CANVAS_WIDTH = 900;
const INITIAL_CANVAS_HEIGHT = 750;
const SCROLLBAR_HEIGHT = 20;

const canvas = document.getElementById('ufoCanvas');

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
