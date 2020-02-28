import { Cursor, FakeCursor } from './cursor.js';

let angle = (a, b) => {
	let r = Math.atan2(b[1], b[0]) - Math.atan2(a[1], a[0]);
	// on veut le plus petit angle possible pour ajuster
	if (Math.abs(r) > Math.PI)
		return -(Math.sign(r) * 2 * Math.PI - r);
	return r;
}

let vadd = (a, b) => a.map((e, i) => e + b[i]);
let vmag = a => Math.sqrt(a.reduce((a, e) => a + e * e, 0));
let r2d = x => x * (180 / Math.PI);

export default class VirtualKeyboard {
	constructor(options) {
		this.options = options;

		// Références aux curseurs instanciés
		this.cursors = [];

		// Somme des angles des mouvements du curseur
		this.cumang = 0;

		// utilisé pour tracker le mouvement...
		this.prev = [0, 0];
		this.pprev = [1, 0];

		// est-ce qu'on a le contrôle du curseur
		this.enabled = false;
	}

	mount(target, input) {
		// un peu hack car on ne sait pas quel élément a capturé le curseur
		document.addEventListener('pointerlockchange', () => {
			this.enabled = !this.enabled;
		}, false);

		document.addEventListener('pointerlockerror', () => {
			console.log('failed to lock cursor');
			this.enabled = false;
		}, false);

		let buildKey = (e, f) => {
			let el = document.createElement('div');
			el.classList.add('lk');
			el.textContent = e;
			el.onclick = () => this.enabled && f();
			return el;
		};

		let buildTKey = e => buildKey(e,   () => txt.value += e);
		let buildEKey = _ => buildKey('↤', () => txt.value = txt.value.substr(0, txt.value.length - 1));

		let buildSpace = e => {
			let el = document.createElement('div');
			el.classList.add('lk');
			el.classList.add('spac');
			el.innerHTML = '&nbsp;';
			el.onclick = () => this.enabled && (txt.value += ' ');
			return el;
		};

		let buildSp = () => {
			let el = document.createElement('div');
			el.classList.add('sp');
			el.innerHTML = '&nbsp;';
			return el;
		}
		
		target.onmousemove = (e) => {
			if (!this.enabled)
				return;
			let diff = [e.movementX, e.movementY];
			if (vmag(this.prev) > 25) {
				this.cumang += r2d(angle(this.prev, this.pprev));
				this.pprev = this.prev;
				this.prev = [0, 0];
			}
			this.prev = vadd(this.prev, diff);
			if (Math.abs(this.cumang) > 1080) // l'utilisateur est perdu, demander aux autres curseurs d'arrêter de copier
				for (let i = 0; i < this.cursors.length; ++i)
					this.cursors[i].adjust();
			for (let i = 0; i < this.cursors.length; ++i)
				this.cursors[i].update(diff);
		}

		target.onclick = e => {
			this.cumang = 0;
			if (e.which == 1 && !this.enabled)
				target.requestPointerLock();
			else if (e.which == 3 && this.enabled)
				document.exitPointerLock();
			if (e.which == 1 && this.enabled) {
				let {x, y} = target.getBoundingClientRect();
				let k = document
					.elementsFromPoint(x + this.realcursor.position.x,
									   y + this.realcursor.position.y)
					.filter(e => e.classList.contains('lk'));
				if (k) {
					k[0].click();
					for (let i = 0; i < this.cursors.length; ++i)
						this.cursors[i].reajust();
				}
			}
		}

		let kbd = document.createElement('div');
		kbd.classList.add('kbd');
		target.append(kbd);
		let sp = n => [...new Array(n)].map(buildSp);
		kbd.append(
			...[..."1234567890".split('').map(buildTKey), buildEKey(),
				...sp(1), ..."AZERTYUIOP".split('').map(buildTKey), ...sp(1),
				...sp(2), ..."QSDFGHJKLM".split('').map(buildTKey),
				...sp(3), ..."WXCVBN".split('').map(buildTKey),
				...sp(13), buildSpace(), ...sp(6)
			   ]);
		let keys = [...kbd.children].filter(e => !e.classList.contains('sp'));
		for (let i = 0; i < this.options.cursors; ++i)
			this.cursors.push(new FakeCursor(fake, keys, this.options.color));
		this.realcursor = new Cursor(fake, keys, this.options.color);
		this.cursors.push(this.realcursor);
	}
}