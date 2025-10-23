const { GlobalKeyboardListener } = require('node-global-key-listener');

const listener = new GlobalKeyboardListener();

console.log('Press Win+Ctrl to see what key names we get...');
console.log('Press Ctrl+C to exit\n');

listener.addListener((event, down) => {
  if (down.DOWN || down.UP) {
    console.log(`${down.DOWN ? 'DOWN' : 'UP  '}: name="${event.name}" state="${event.state}" rawKey=${event.rawKey._nameRaw}`);
  }
});
