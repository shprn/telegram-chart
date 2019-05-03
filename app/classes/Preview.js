import Slider from './Slider.js';
import Line from './Line.js';
import PreviewLine from './PreviewLine.js';

export default class Preview {

	// constructor
	constructor (chart, params) {
		this.chart = chart;
		this.elem = null;
		this.elemSvg = null;
		this.slider = new Slider(this, {
			start: chart.viewport.viewbox.start,
			end: chart.viewport.viewbox.end
		});
	}

	renderSlider() {
		this.slider.render();
	}

	renderItems () {
		this.elemSvg.innerHTML = "";
		this.elemSvg.setAttribute("viewBox", "0 0 " + this.elem.clientWidth + " " + this.elem.clientHeight);
		let context = this;
		this.chart.viewport.items.forEach(function(item) {
			let previewLine = new PreviewLine(context, item);
			previewLine.render();
		});
	}

	render () {
		if (!this.elem) {
			this.elem = this.chart.elem.querySelector('.preview');
		}

		if(!this.elemSvg) {
			this.elemSvg = this.chart.elem.querySelector('.preview-svg');
			this.elemSvg.setAttribute("preserveAspectRatio", "none");
		}

		this.renderItems();
		this.renderSlider();
	}
}