window.onload = async () => {
	let cursor = await import("./cursor.js");
	let Cursor = cursor.Cursor;
	let FakeCursor = cursor.FakeCursor;
	
	let cursors = [];
	let prevpos;
	let realcursor;
	let enabled = false;

	fake.onmousemove = (e) => {
		if (!enabled)
			return;
		if (!prevpos)
			prevpos = [e.clientX, e.clientY];
		else {
			//let diff = [e.clientX - prevpos[0], e.clientY - prevpos[1]];
			prevpos = [e.clientX, e.clientY];
			let diff = [e.movementX, e.movementY];
			for (let i = 0; i < cursors.length; ++i)
				cursors[i].update(diff);
		}
	}

	document.addEventListener('pointerlockchange', () => {
		enabled = !enabled;
	}, false);


	document.addEventListener('pointerlockerror', () => {
		console.log('failed to lock cursor');
	}, false);

	fake.onclick = e => {
		if (e.which == 1 && !enabled) {
			fake.requestPointerLock();
			/*			 realcursor.position = {x: e.clientX, y: e.clientY};
						 realcursor.update([0, 0]);
			*/
		} else if (e.which == 3 && enabled) {			 
			document.exitPointerLock();
		}
		if (e.which == 1 && enabled) {
			let {x, y} = fake.getBoundingClientRect();
			let k = document.elementsFromPoint(x + realcursor.position.x, y + realcursor.position.y).filter(e => e.classList.contains('lk'))
			if (k)
				k[0].click();
		}
	}

	let buildKey = e => {
		let el = document.createElement('div');
		el.classList.add('lk');
		el.textContent = e;
		el.onclick = () => {
			if (enabled) {
				if (e == '↤')
					txt.value = txt.value.substr(0, txt.value.length - 1);
				else
					txt.value += e;
			}
		}
		return el;
	};

	let buildSpace = e => {
		let el = document.createElement('div');
		el.classList.add('lk');
		el.classList.add('spac');
		el.innerHTML = '&nbsp;';
		el.onclick = () => {
			if (enabled) {
				txt.value += ' ';
			}
		}
		return el;
	};

	let buildSp = () => {
		let el = document.createElement('div');
		el.classList.add('sp');
		el.innerHTML = '&nbsp;';
		return el;
	}

	let sp = n => [...new Array(n)].map(buildSp)
	kbd.append(
		...[..."1234567890↤".split('').map(buildKey),
			...sp(1), ..."AZERTYUIOP".split('').map(buildKey), ...sp(1),
			...sp(2), ..."QSDFGHJKLM".split('').map(buildKey),
			...sp(3), ..."WXCVBN".split('').map(buildKey),
			...sp(13), buildSpace()
		   ]);
	let keys = [...kbd.children].filter(e => !e.classList.contains('sp'));

	for (let i = 0; i < 16; ++i)
		cursors.push(new FakeCursor(fake, keys));
	realcursor = new Cursor(fake, keys);
	cursors.push(realcursor);
}
