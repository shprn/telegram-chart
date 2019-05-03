import Axis from './Axis.js';
import Line from './Line.js';

export default class Viewport {

	// constructor
	constructor (chart, params) {
		this.chart = chart;
		this.elem = null;
		this.elemPlot = null;
		this.elemSvg = null;
		this.elemHint = null;

		this.config = params.axis;
		this.globalPointStart = {
			x: params.axis.x.minValue,
			y: params.axis.y.minValue
		};
		this.globalPointEnd = {
			x: params.axis.x.maxValue,
			y: params.axis.y.maxValue
		};
		this.pointStart = {
			x: params.axis.x.minValue,
			y: params.axis.y.minValue
		};
		this.pointEnd = {
			x: params.axis.x.maxValue,
			y: params.axis.y.maxValue
		};
		this.step = {
			x: params.axis.x.step,
			y: params.axis.y.step
		}
		
		this.viewbox = {
			start: params.viewbox.start,
			end: params.viewbox.end
		};

		this.items = [];

		// add new items
		for (let key in params.chart.columns) {
			this.addItem({
				points: this._getPointsByRowColumn(params.chart.row, params.chart.columns[key]),
				color: params.chart.colors[key],
				type: params.chart.types[key],
				name: params.chart.names[key]
			});
		}

		// add all values 'x'
		this.allPointsX = params.chart.row;

		this._globalReset();
		// new axes
		this.axisX = new Axis(this, 'x', params);
		this.axisY = new Axis(this, 'y', params);
	}

	// convert point.x to viewport.x
	pointToViewportX(x) {
		return (x - this.pointStart.x) / (this.pointEnd.x -this.pointStart.x) * this.elem.clientWidth;
	}

	// convert point.y to viewport.y
	pointToViewportY(y) {
		return (1 - (y - this.pointStart.y) / (this.pointEnd.y - this.pointStart.y)) * this.elem.clientHeight;
	}

	// convert point.x to plot.x
	pointToPlotX(x) {
		return (x - this.pointStart.x) / (this.pointEnd.x -this.pointStart.x) * this.elemPlot.clientWidth;
	}

	// convert point.y to plot.y
	pointToPlotY(y) {
		return (1 - (y - this.pointStart.y) / (this.pointEnd.y - this.pointStart.y)) * this.elemPlot.clientHeight;
	}

	plotToPointX (left) {
		return this.pointStart.x + left / this.elemPlot.clientWidth * (this.pointEnd.x - this.pointStart.x);
	}

	_getPointsByRowColumn (row, column) {
		let points = [];
		let count = Math.min(row.length, column.length);
		for (let i = 1; i < count; i++) {
			points.push({x: row[i], y: column[i]});
		}

		return points;
	}

	// add line
	addItem (data) {
		this.items.push(new Line(this, data));
		this._reset();
	}

	// enable line
	enableItem (index) {
		if (index < this.items.length) {
			this.items[index].enable();
			this._reset();
		}
	}

	// disable line
	disableItem (index) {
		if (index < this.items.length) {
			this.items[index].disable();
			this._reset();
		}
	}

	// toggle line
	toggleItem (index) {
		if (index < this.items.length) {
			this.items[index].toggle();
			this._reset();
		}
	}

	setPointsRange(pointStart, pointEnd) {
		this.pointStart = pointStart;
		this.pointEnd = pointEnd;
		this._reset();
	}

	// calculate min/max of x/y
	_getKeyPoint (func, axisName, configValue, global) {
		let result = configValue;
		let viewboxStart = global ? 0 : this.viewbox.start;
		let viewboxEnd = global ? 1 : this.viewbox.end;

		if (result == undefined) {
			result = Math[func].apply(Math, this.items
				.filter(function(item) { return item.enable; })
				.map(function(item) {

					let points = [];
					Object.assign(points, item.points)
					if(axisName == 'y') {
						let length = points.length;
						let start = Math.round(length * viewboxStart);
						let end = Math.round(length * viewboxEnd);
						points.splice(end);
						points.splice(0, start);
					}
					return Math[func].apply(Math, points.map(function(point) {
						return point[axisName];
				}));
			}));			
		}

		if (result == Infinity) {
			result = 0;
		}

		return result;
	}

	// calculate default step from start and end points
	_getDefaultStepX (start, end, viewbox, configValue) {

		let result = configValue;

		if (result != undefined && result != Infinity) {
			return reslult;
		}

		let countPerScreen = Math.ceil(this.chart.elem.clientWidth / 50);
		let diffMs = (end - start) * (viewbox.end - viewbox.start);
		result = Math.ceil(diffMs / 86400000 / countPerScreen) * 86400000;

		return result; 
	}

	// calculate default step from start and end points
	_getDefaultStepY (start, end, configValue) {

		let result = configValue;

		if (result != undefined && result != Infinity) {
			return reslult;
		}


		if (end - start == 1) {
			return 1;
		}

		// round key values and step
		// get diff bwtween Start and End
		// get 2 older digits
		// get step for there digits (1 or 5 or 10)
		// get step for diff
		let diffY = end - start;
		let olderDigits = +(""+diffY).substring(0, 2);
		let numDigits = (""+diffY).length;

		if (olderDigits > 60) {
			result = 10;
		} else if (olderDigits > 10) {
			result = 5;
		} else {
			result = 1;
		}
		
		result *= Math.pow(10, (numDigits-2));
		return result;
	}

	// set default step x
	setStepX () {
		this.step.x = this._getDefaultStepX(this.pointStart.x, this.pointEnd.x, this.viewbox, this.config.x.step);
	}

	setStepY () {
		this.step.y = this._getDefaultStepY(this.pointStart.y, this.pointEnd.y, this.config.y.step);
	}

	// find closest 'x' coodrinate at range from PointStart to PointEnd
	getClosestPointXByX(pointX) {
	let length = this.allPointsX.length
		if (length == 0) {
			return {};
		} else if (length == 1) {
			return this.allPointsX[0];
		}

		let i0 = 0;
		let i1 = length;

		while (i1-i0 > 1) {
			let i = i0 + Math.round((i1 - i0) / 2);
			let diff = pointX - this.allPointsX[i];

			if (diff > 0) {
				i0 = i;
			} else if (diff < 0) {
				i1 = i;
			} else {
				return pointX;
			}
		}

		let diff0 = pointX - this.allPointsX[i0];
		let diff1 = this.allPointsX[i1] - pointX;

		if (diff0 < diff1) {
			return this.allPointsX[i0];
		} else {
			return this.allPointsX[i1];
		}
	}

	bodyHint (pointX) {

		let lines = "";
		for (let i = 0; i < this.items.length; i++) {
			let item = this.items[i];
			if (item.enable == false) {
				continue;
			}
			let point = item.getPointByX(pointX);
			lines +=  "<div class='hint-col' style='color:" + item.color + "'><div>" + this.axisY.formatValue(point.y, true) + "</div><div>" + this.items[i].name + "</div></div>";
		}

		return "<div class='hint-header'>" + this.axisX.formatValue(pointX, true) + "</div>" + 
			"<div class='hint-body'>" + lines + "</div>";
	}

	getMaxPointY (pointX) {

		let maxY = undefined;
		for (let i = 0; i < this.items.length; i++) {
			if (this.items[i].enable == false) {
				continue;
			}

			if (maxY == undefined) {
				maxY = this.items[i].pointsIndexed[pointX];
			} else {
				maxY = Math.max(maxY, this.items[i].pointsIndexed[pointX]);
			}
		}

		return maxY;
	}

	showHint (clientX) {
		let left = clientX - this.elemPlot.getBoundingClientRect().left
		let pointX = this.plotToPointX(left);

		let closestPointX = this.getClosestPointXByX(pointX);
		let closestLeft = this.pointToPlotX(closestPointX);

		if (closestPointX == undefined) {
			return;
		}

		if (closestLeft < 0) {
			return;
		}

		// set hint-points
		for (let i = 0; i < this.items.length; i++) {
			this.items[i].hintPoint = this.items[i].getPointByX(closestPointX);
			this.items[i].renderHintPoint ();
		}

		// set styles
		this.elemHint.className = "hint";
		let elemLine = this.elemHint.querySelector('.hint-line');
		elemLine.style.left = closestLeft + 'px';

		let elemMessage = this.elemHint.querySelector('.hint-message');
		elemMessage.innerHTML = this.bodyHint(closestPointX);

		let maxPointY = this.getMaxPointY(closestPointX);
		let maxTop = this.pointToPlotY(maxPointY);

		left = Math.max(closestLeft - 25, this.elemHint.clientWidth*this.viewbox.start);
		left = Math.min(left, this.elemHint.clientWidth*this.viewbox.end - elemMessage.offsetWidth - 10);

		let top = -10
		if (top + elemMessage.offsetHeight > maxTop) {
			top = maxTop + 10;
		}

		elemMessage.style.left = left + 'px';
		elemMessage.style.top = top + 'px';
	}

	hideHint () {
		this.elemHint.className = "hint hidden";

		for (let i = 0; i < this.items.length; i++) {
			this.items[i].hintPoint = undefined;
			this.items[i].renderHintPoint ();
		}
	}

	// set default min, max, step, diff values
	_globalReset () {
		let context = this;

		this.globalPointStart.x = this._getKeyPoint('min', 'x', this.config.x.min, true);
		this.globalPointStart.y = this._getKeyPoint('min', 'y', this.config.y.min, true);
		this.globalPointEnd.x = this._getKeyPoint('max', 'x', this.config.x.max, true);
		this.globalPointEnd.y = this._getKeyPoint('max', 'y', this.config.y.max, true);
	}

	// set default min, max, step, diff values
	_reset () {
		let context = this;

		this.pointStart.x = this._getKeyPoint('min', 'x', this.config.x.min);
		this.pointStart.y = this._getKeyPoint('min', 'y', this.config.y.min);
		this.pointEnd.x = this._getKeyPoint('max', 'x', this.config.x.max);
		this.pointEnd.y = this._getKeyPoint('max', 'y', this.config.y.max);

		if (this.pointEnd.x <= this.pointStart.x) {
			this.pointEnd.x = this.pointStart.x + 1;
		} 

		if (this.pointEnd.y <= this.pointStart.y) {
			this.pointEnd.y = this.pointStart.y + 1;
		} 

		this.setStepX();
		this.setStepY();

		// round key points
		this.pointStart.y = Math.floor(this.pointStart.y/this.step.y) * this.step.y;
		this.pointEnd.y = Math.ceil(this.pointEnd.y/this.step.y) * this.step.y;

	}

	setViewbox(viewbox) {
		this.viewbox.start = viewbox.start;
		this.viewbox.end = viewbox.end;

		if (this.viewbox.start >= 0.99) {
			this.viewbox.start = 0.99;
		}

		if (this.viewbox.end == this.viewbox.start) {
			this.viewbox.end = this.viewbox.start + 0.01;
		}
		this._reset();
	}

	renderAxisX () {
		this.axisX.render();
	}

	renderAxisY () {
		this.axisY.render();
	}


	renderViewbox()
 	{
		this.elem.style.left = -100*this.viewbox.start / (this.viewbox.end - this.viewbox.start) + '%';
		this.elem.style.width = 100 / (this.viewbox.end - this.viewbox.start) + '%';
		this.axisY.elem.style.left = 100*this.viewbox.start + '%';
		
		this.hideHint();
		this.setStepX();
		this.renderAxisX();

 	}	

	renderItems (animate = false) {
		this.elemSvg.setAttribute("viewBox", "0 0 " + this.elem.clientWidth + " " + this.elem.clientHeight);
		this.items.forEach(function(item) {
			item.render(animate);
		});
	}

 	render(animate = false) {

		if (!this.elem) {
			this.elem = this.chart.elem.querySelector('.viewport');

			let context = this;
			this.elem.addEventListener('mousemove', function (e) {
				e.preventDefault();
				if (context.elem.contains(e.target)) {
					context.showHint(e.clientX);
				}
			});

			this.elem.addEventListener('mouseleave', function (e) {
				e.preventDefault();
				if (e.target == context.elem) {
		        	context.hideHint();
		    	}
			});			
		}

		if(!this.elemPlot) {
			this.elemPlot = this.elem.querySelector('.plot');
		}
		
		if(!this.elemSvg) {
			this.elemSvg = this.elemPlot.querySelector('.plot-svg');
			this.elemSvg.setAttribute("preserveAspectRatio", "none");			
		}

		if (!this.elemHint) {
			this.elemHint = this.chart.elem.querySelector('.hint');
		}
		
		this.renderAxisX();
		this.renderAxisY();
		this.renderViewbox();
		this.renderItems(animate);
	}
}