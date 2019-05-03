export default class PreviewLine {

	// constructor
	constructor (preview, line) {
		this.preview = preview;
		this.viewport = preview.chart.viewport;
		this.line = line;
		this.elem = null;
	}

	// convert point.x to svg.x
	svgX(x) {
		return (x - this.viewport.globalPointStart.x) / (this.viewport.globalPointEnd.x -this.viewport.globalPointStart.x) * this.preview.elem.clientWidth;
	}

	// convert point.y to svg.y
	svgY(y) {
		return (1 - (y - this.viewport.globalPointStart.y) / (this.viewport.globalPointEnd.y - this.viewport.globalPointStart.y)) * this.preview.elem.clientHeight;
	}

	// render DOM element
	render () {
		if (!this.line.enable) {
			if (this.elem) {
				this.elem.remove();
				this.elem = null;
			}
			return;
		}

		if (!this.elem) {
			this.elem = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
			this.preview.elemSvg.appendChild(this.elem);
		}

		let context = this;
		let pointsSvg = this.line.points.reduce(function(result, point) {
			return result + context.svgX(point.x) + ',' + context.svgY(point.y) + ' ';
		}, '');

		this.elem.setAttributeNS(null, "points", pointsSvg);
    	this.elem.style.stroke = this.line.color;
	}
}