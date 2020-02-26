let rotate = (v, a) => [
	v[0] * Math.cos(a) - v[1] * Math.sin(a),
	v[0] * Math.sin(a) + v[1] * Math.cos(a)
];

let wrap = (x, m) => {
	if (x >= m)
		return x % m;
	while (x < 0)
		x += m;
	return x;
}

class Cursor {
	constructor(parent, targets) {
		this.parent = parent;
		this.element = document.createElement('img');
		let c = this.element;
		c.src = './cursorc.png';
		c.style.filter = `hue-rotate(${~~(Math.random() * 360)}deg) saturate(100)`;
		fake.appendChild(c);

		const rtarget = targets[~~(Math.random() * targets.length)];
		const rect = rtarget.getBoundingClientRect();
		let fakepos = parent.getBoundingClientRect();
		rect.x -= fakepos.x;
		rect.y -= fakepos.y;
		let posa = {
			x: rect.x + rect.width / 2,
			y: rect.y + rect.height / 2
		};
		
		c.style['left'] = `${posa.x}px`;
		c.style['top'] = `${posa.y}px`;
		c.style['position'] = 'absolute';
		this.position = posa;
	}

	update(diff) {
		let pos = this.position;
		pos.x += diff[0];
		pos.y += diff[1];
		pos.x = wrap(pos.x, fake.clientWidth);
		pos.y = wrap(pos.y, fake.clientHeight);

		let c = this.element;
		c.style['left'] = `${pos.x}px`;
		c.style['top'] = `${pos.y}px`;
	}
}

class FakeCursor extends Cursor {
	constructor(parent, targets) {
		super(parent, targets);
		const n = 6;
		const div = 360 / n;
		while (!this.pert)
			this.pert = ~~(Math.random() * div) % n;
	}

	update(diff) {
		let pos = this.position;
		diff = rotate(diff, 60 * this.pert);
		pos.x += diff[0];
		pos.y += diff[1];
		pos.x = wrap(pos.x, fake.clientWidth);
		pos.y = wrap(pos.y, fake.clientHeight);

		let c = this.element;
		c.style['left'] = `${pos.x}px`;
		c.style['top'] = `${pos.y}px`;
	}
}

export {Cursor, FakeCursor};