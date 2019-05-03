export default class Line {

	// constructor
	constructor (viewport, data) {
		this.viewport = viewport;
		this.elem = null;
		this.elemHintPoint = null;
		this.color = data.color;
		this.type = data.type;
		this.enable = true;
		this.name = data.name;
		this.points = data.points;
		this.pointsIndexed = undefined;
		this.hintPoint = undefined;
		this._calcPointsIndexed();
	}
/*
	set (points) {
		this._calcPointsIndexed();
	}
*/
	// enable series
	enable () {
		this.enable = true;
	}

	// disable series
	disable () {
		this.enable = false;
	}

	// toggle series
	toggle () {
		this.enable = this.enable ? false : true;
	}

	_calcPointsIndexed () {
		this.pointsIndexed = {};

		for (let i = 0; i < this.points.length; i++) {
			this.pointsIndexed[this.points[i].x] = this.points[i].y;
		}
	}

	getPointByX(pointX) {
		let pointY = this.pointsIndexed[pointX];

		if (pointY) {
			return {
				x: pointX,
				y: pointY
			};
		} else {
			return {};
		}
	}

	renderHintPoint () {
		if (!this.elemHintPoint) {
			return;
		}

		if (!this.enable) {
			this.elemHintPoint.setAttributeNS(null, "opacity", 0);
			return;
		}

		if (!this.hintPoint) {
			this.elemHintPoint.setAttributeNS(null, "opacity", 0);
			return;
		}

		this.elemHintPoint.setAttributeNS(null, "cx", this.viewport.pointToViewportX(this.hintPoint.x));
		this.elemHintPoint.setAttributeNS(null, "cy", this.viewport.pointToViewportY(this.hintPoint.y));
		this.elemHintPoint.setAttributeNS(null, "opacity", 1);
	}

	// render DOM element
	render () {
		if (!this.elem) {
			this.elem = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
			this.elem.setAttributeNS(null, "stroke", this.color);
			this.viewport.elemSvg.appendChild(this.elem);
		}

		if (!this.elemHintPoint) {
			this.elemHintPoint = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			this.elemHintPoint.setAttributeNS(null, "r", 4);
			this.elemHintPoint.setAttributeNS(null, "stroke", this.color);
			this.viewport.elemSvg.appendChild(this.elemHintPoint);
		}

		let toOpacity = this.enable ? 1 : 0;

		let context = this;
		let toPointsSvg = this.points.reduce(function(result, point) {
			return result + context.viewport.pointToViewportX(point.x) + ', ' + context.viewport.pointToViewportY(point.y) + ' ';
		}, '');

		this.elem.setAttributeNS(null, "opacity", toOpacity);
		this.elem.setAttributeNS(null, "points", toPointsSvg);

		this.renderHintPoint();
	}

}