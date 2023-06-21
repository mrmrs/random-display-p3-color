const test = require('ava');
const randomDisplayP3Color = require('./');

test('should return a valid Display-P3 color', (t) => {
  t.plan(10);

  for (let i = 0; i < 10; i++) {
    const color = randomDisplayP3Color();
    const regex = /^color\(display-p3 (\d+(\.\d+)?|\.\d+) (\d+(\.\d+)?|\.\d+) (\d+(\.\d+)?|\.\d+)\)$/;

    t.regex(color, regex);
  }
});

