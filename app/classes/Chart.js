import Header from './Header.js';
import Viewport from './Viewport.js';
import Preview from './Preview.js';
import Labels from './Labels.js';

export default class Chart {

	// constructor
	constructor (userParams) {

		console.log('chart constructor started');
		this.elem = null;
		this.className = 'chart';
		this.elemTheme = null;
		this.header = null;
		this.viewport = null;
		this.preview = null;
		this.labels = null;
		let params = this.loadParams(userParams)

		this.elem = document.getElementById(params.id);
		if (!this.elem) {
			console.log("Element with id='" + params.id + "' not found");
			return;
		}

		this.throttleEvent('resize', 'optimizedResize');
		let context = this;
		window.addEventListener('optimizedResize', function() {
			context.render();
		});

		this.loadTemplate();
		
		this.header = new Header(this, params);		
		this.viewport = new Viewport(this, params);
		this.preview = new Preview(this, params);
		this.labels = new Labels(this, params);		
		this.theme = params.theme;
		this.animate = false;
		this.animateDuration = 1.3;	// seconds
		this.render();
	}

	loadTemplate() {
		this.elem.innerHTML = `
			<div class="header">
				<h3 class="title"></h3>
			</div>
			<div class="viewport-window">
				<div class="viewport">
					<div class="hint hidden">
						<div class="hint-line"></div>
						<div class="hint-message"></div>
					</div>					
					<div class="axis-x">
						<div class="values"></div>
						<div class="grid"></div>
					</div>
					<div class="axis-y">
						<div class="values"></div>
						<div class="grid"></div>
					</div>
					<div class="plot">
						<svg class="plot-svg"></svg>
					</div>
				</div>
			</div>
			<div class="preview">
				<svg class="preview-svg"></svg>
				<div class="preview-left"></div>
				<div class="preview-right"></div>
				<div class="slider">
					<div class="slider-left"></div>
					<div class="slider-right"></div>
				</div>
			</div>
			<div class="labels"></div>
			<div class='theme-container'><div class="theme-switcher"></div></div>
			`;
	}

	// set default value of parameter if it is missed
	extendParam (userValue, defaultValue) {
		if (typeof(userValue) != "undefined" && userValue !== null) {
			return userValue;
		}
		
		return defaultValue;
	}

	throttleEvent (type, name, obj) {
        obj = obj || window;
        let running = false;

        obj.addEventListener(type, function() {
            if (running) {
            	return;
            }
            running = true;
             requestAnimationFrame(function() {
                obj.dispatchEvent(new CustomEvent(name));
                running = false;
            });
        });
    };

	_getColumnXName (types) {
		for (let key in types) {
			if (types[key] == 'x')
				return key;
		}

		return '';
	}

	_getPointsByRowColumn (row, column) {
		let points = [];
		let count = Math.min(row.length, column.length);
		for (let i = 1; i < count; i++) {
			points.push({x: row[i], y: column[i]});
		}

		return points;
	}

	// get user or default params
	loadParams (userParams) {
		// default colors
		let defaultSeriesColors = [];
		defaultSeriesColors.push("#76eb00");
		defaultSeriesColors.push("#e60000");

		let params = {};
		Object.assign(params, userParams)

		params.title = this.extendParam(params.title, "Chart");

		// transform columns to comfortable look
		// columns: [[x, ...] [y0, ...] [y1, ...]] =>
		// row: [... , ...]
		// rowName: x
		// columns: {
		//          y0: [... , ...],
		//          y1: [... , ...]
		//         }
		let columns = {};
		let row = [];
		let rowName = this._getColumnXName(params.chart.types);	

		for (let i = 0; i < params.chart.columns.length; i++) {
			let key = params.chart.columns[i][0];
			let data = [];
			Object.assign(data, params.chart.columns[i]);
			data.splice(0, 1)
			
			if (key == rowName) {
				row = data;
			} else {
				columns[key] = data;
			}
		}

		params.chart.row = row;
		params.chart.rowName = rowName;
		params.chart.columns = columns;

		if (!params.axis) {
			params.axis = {};
		}

		if (!params.axis.x) {
			params.axis.x = {};
		}		
		params.axis.x.min = this.extendParam(params.axis.x.min, undefined);
		params.axis.x.max = this.extendParam(params.axis.x.max, undefined);
		params.axis.x.step = this.extendParam(params.axis.x.step, undefined);

		if (!params.axis.y) {
			params.axis.y = {};
		};
		params.axis.y.min = this.extendParam(params.axis.y.min, undefined);
		params.axis.y.max = this.extendParam(params.axis.y.max, undefined);
		params.axis.y.step = this.extendParam(params.axis.y.step, undefined);
	
		if (!params.viewbox) {
			params.viewbox = {};
		};
		params.viewbox.start = this.extendParam(params.viewbox.start, 0);
		params.viewbox.end = this.extendParam(params.viewbox.end, 1);
		params.theme = this.extendParam(params.theme, 0);
		
		return params;
	} 

	// enable series
	enableSeries (index) {
		this.labels.enableItem(index);
		this.viewport.enableItem(index);
		this.renderLabel(index);
		this.renderViewport(true);
		this.renderPreview();
	}

	// enable series
	disableSeries (index) {
		this.labels.disableItem(index);
		this.viewport.disableItem(index);
		this.renderLabel(index);
		this.renderViewport(true);
		this.renderPreview();
	}

	// toogle series by index
	toggleSeries (index) {
		this.labels.toggleItem(index);
		this.viewport.toggleItem(index);
		this.renderLabel(index);
		this.renderViewport(true);
		this.renderPreview();
	}

	toggleTheme () {
		this.theme = this.theme ? 0 : 1;
		this.renderTheme();
	}

	setViewbox(viewbox) {
		this.viewport.setViewbox(viewbox);
		this.renderViewport();
	}

	renderTheme () {
		if (!this.elemTheme) {
			this.elemTheme = this.elem.querySelector('.theme-switcher');
			let context = this;
			this.elemTheme.addEventListener('click', function() {
				context.toggleTheme();
			});
		}

		if (this.theme == 0) {
			this.elem.className = this.className;
			this.elemTheme.innerHTML = "Switch to Night Mode";
		} else {
			this.elem.className = this.className + ' night';
			this.elemTheme.innerHTML = "Switch to Day Mode";			
		}
	}

	renderHeader () {
		this.header.render();
	}

	renderLabels () {
		this.labels.render();
	}

	renderViewport () {
		this.viewport.render();
	}

	renderLabel (index) {
		this.labels.renderItem(index);
	}

	renderPreview () {
		this.preview.render();
	}

	render () {
		this.renderTheme();
		this.renderHeader();
		this.renderViewport();
		this.renderPreview();
		this.renderLabels();
	}

}
