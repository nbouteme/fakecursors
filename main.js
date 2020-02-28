import VirtualKeyboard from './virtkbd.js';

window.onload = async () => {
	let keyboard = new VirtualKeyboard({
		cursors: 16,
		color: true
	});
	await keyboard.mount(fake, txt);
}
