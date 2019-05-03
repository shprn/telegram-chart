export default class Label {

	// constructor
	constructor (labels, data) {
		this.labels = labels;
		this.elem = null;
		this.name = data.name;
		this.enable = data.enable;
		this.color = data.color;
		this.index = this.labels.items.length;
	}

	// enable label
	enable () {
		this.enable = true;
	}

	// disable label
	disable () {
		this.enable = false;
	}

	// toggle label
	toggle () {
		this.enable = this.enable ? false : true;
	}

	render () {
		if (!this.elem) {
			this.elem = document.createElement("div");	
			this.labels.elem.appendChild(this.elem);

			// add click event on label
			let context = this;
			this.elem.addEventListener('click', function(e) {
				context.labels.chart.toggleSeries(context.index);
			});
		}

		this.elem.className = 'label' + (this.enable ? " enable" : "");
		this.elem.innerHTML = "<i class='zmdi' style='background:" + (this.enable ? this.color : "none") + "'></i>" + this.name;
	}
}