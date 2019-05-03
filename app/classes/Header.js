export default class Title {

	// constructor
	constructor (chart, params) {
		this.chart = chart;
		this.elem = null;
		this.elemTitle = null;
		this.title = "";
		this.setTitle(params.title);
	}

	// set Title
	setTitle (title) {
		this.title = title;
	}

	// render DOM element
	render() {
		if (!this.elem) {
			this.elem = this.chart.elem.querySelector('.header');
		}

		if (!this.elemTitle) {
			this.elemTitle = this.elem.querySelector('.title');
		}

		this.elemTitle.textContent = this.title;		
	}

}
