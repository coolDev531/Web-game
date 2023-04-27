const canvas = document.getElementById('ufoCanvas');
const ctx = canvas.getContext('2d');

const img = new Image();
img.src = '../images/ufo.png';

img.onload = () => {
  return ctx.drawImage(img, 100, 50); // img ,x ,y
};
