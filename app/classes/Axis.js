export default class Axis {

	// constructor
	constructor (viewport, axisName, data) {
		this.viewport = viewport;
		this.elem = null;
		this.elemValues = null;
		this.elemGrid = null;

		this.name = axisName;
		this.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		this.days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		this.digits = ["", "K", "M"];
	}

	// format value to render
	formatValue (val, full = false) {
		if (this.name == 'x') {
			let d = new Date(val);
			if (full) {
				return this.days[d.getDay()] + ', ' + this.months[d.getMonth()] + " " + d.getDate();
			}
			else {
				return this.months[d.getMonth()] + " " + d.getDate();
			}
		} else {
			if (full) {
				return val;
			} else {
				let _val = val;
				let i = 0;
				for (i = 0; i < this.digits.length; i++) {
					if (_val / 1000 < 1) {
						break;
					}
					_val = _val / 1000;
				}

				return _val + this.digits[i];
			}
		}
	}

	_getRealEndX() {
		return this.viewport.pointStart.x + Math.ceil((this.viewport.pointEnd.x-this.viewport.pointStart.x)/this.viewport.step.x)*this.viewport.step.x;
	}

	_setAxisWidth() {
		let start = this.viewport.pointStart.x;
		let end = this.viewport.pointEnd.x;
		let realEnd = this._getRealEndX();

		this.elem.style.right = -100*(realEnd - end) / (end - start) + '%';
	}

	// create object with new values / lines elements
	// return object:
	//   key = value
	// fields:
	//   new:
	//     elemValue
	//     elemLine
	_prepareNewElements() {
		let elems = {};

		let pointStart = this.viewport.pointStart[this.name];
		let pointEnd = this.viewport.pointEnd[this.name];
		let step = this.viewport.step[this.name];

		let childValue = null;
		let childLine = null;

		if (this.name == 'x') {
			pointEnd = this._getRealEndX();
		}
		
		for (let value = pointStart; value <= pointEnd; value+= step) {
			childValue = document.createElement("div");
			childValue.className = 'value';
			childValue.dataset.value = value;
			childValue.textContent = this.formatValue(value);

			if (this.name == 'y') {
				childLine = document.createElement("div");
				childLine.className = 'line';
				childValue.style.top = this.viewport.pointToPlotY(value) + 'px';
				childLine.style.top = this.viewport.pointToPlotY(value) + 'px';
			}

			elems[value]= {
				elemValue: childValue,
				elemLine: childLine
			};
		}

		return elems;
	}

	// render DOM element
	render() {
		if(!this.elem) {
			this.elem = this.viewport.elem.querySelector(".axis-" + this.name);
		}

		if (!this.elemValues) {
			this.elemValues = this.elem.querySelector(".values");
		}

		if (!this.elemGrid) {
			this.elemGrid = this.elem.querySelector(".grid");
		}

		if (this.name == 'x') {
			this._setAxisWidth();
		}

		let newElems = this._prepareNewElements();

		this.elemValues.innerHTML = "";
		this.elemGrid.innerHTML = "";

		for (let key in newElems) {
			if (newElems[key].elemValue) {
				this.elemValues.appendChild(newElems[key].elemValue);
			}
			if (newElems[key].elemLine) {
				this.elemGrid.appendChild(newElems[key].elemLine);
			}
		}

		return;
	}
}