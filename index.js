'use strict';

module.exports = function randomDisplayP3Color(minRed = 0, maxRed = 255, minGreen = 0, maxGreen = 255, minBlue = 0, maxBlue = 255) {
  const red = Math.floor(Math.random() * (maxRed - minRed + 1)) + minRed;
  const green = Math.floor(Math.random() * (maxGreen - minGreen + 1)) + minGreen;
  const blue = Math.floor(Math.random() * (maxBlue - minBlue + 1)) + minBlue;
  
  return `color(display-p3 ${red / 255} ${green / 255} ${blue / 255})`;
};
