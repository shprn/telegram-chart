export default class Slider {

	// constructor
	constructor (preview, position) {
		this.preview = preview;
		this.elem = null;
		this.elemPreviewLeft = null
		this.elemPreviewRight = null;
		this.elemSliderLeft = null;
		this.elemSliderRight = null;
		this.start = position.start;
		this.end = position.end;

		this._previewCoords = null;
		this._shiftX = null;
		this._MIN_SLIDER_WIDTH = 25;


		this._onDocumentMouseMove = this.__onDocumentMouseMove.bind(this);
		this._onDocumentMouseUp = this.__onDocumentMouseUp.bind(this);
		this._elemDrag = null;
	}

	_startDrag (e) {
		this._elemDrag = e.target;
		this._touch = e.touches;
        this._shiftX = e.clientX || e.touches[0].clientX;
        this._shiftX -= this._elemDrag.getBoundingClientRect().left;
        this._previewCoords = this.preview.elem.getBoundingClientRect();
        
        document.addEventListener('mousemove', this._onDocumentMouseMove);
        document.addEventListener('mouseup', this._onDocumentMouseUp);
        document.addEventListener('touchmove', this._onDocumentMouseMove, {passive: false});
        document.addEventListener('touchend', this._onDocumentMouseUp, {passive: false});
        document.addEventListener('touchcancel', this._onDocumentMouseUp, {passive: false});
	}

	_endDrag () {
		document.removeEventListener('mousemove', this._onDocumentMouseMove);
		document.removeEventListener('mouseup', this._onDocumentMouseUp);
		document.removeEventListener('touchmove', this._onDocumentMouseMove);
		document.removeEventListener('touchend', this._onDocumentMouseUp);
		document.removeEventListener('touchcancel', this._onDocumentMouseUp);
	}

	__onDocumentMouseMove (e) {
		e.preventDefault();
		let clientX = e.clientX || e.touches[0].clientX;
		this._moveTo(clientX);
    }

    __onDocumentMouseUp (e) {
    	e.preventDefault();
		this._endDrag();
    }

    _getLimitedValue (value, minValue, maxValue) {
		let val = Math.max(value, minValue);
        val = Math.min(val, maxValue);
        return val;
    }

 	_moveTo (clientX) {
        let left = clientX - this._previewCoords.left - this._shiftX;
        let newStart = this.start;
        let newEnd = this.end;

		if (this._elemDrag.classList.contains("slider-left")) {
			newStart = this._getLimitedValue(
				left,
				0,
				this.elem.offsetLeft + this.elem.offsetWidth - this._MIN_SLIDER_WIDTH) /
			this.preview.elem.clientWidth;

		} else if (this._elemDrag.classList.contains("slider-right")) {
			newEnd = this._getLimitedValue(
				left + this._elemDrag.offsetWidth,
				this.elem.offsetLeft + this._MIN_SLIDER_WIDTH,
				this.preview.elem.clientWidth) /
			this.preview.elem.clientWidth;

		} else {
			let start = this._getLimitedValue(
				left,
				0,
				this.preview.elem.clientWidth - this._elemDrag.offsetWidth);

			newStart = start / this.preview.elem.clientWidth;
			newEnd = (start + this._elemDrag.offsetWidth) / this.preview.elem.clientWidth;
		}

		this.setViewbox({
    		start: Math.round(1000*newStart)/1000,
    		end: Math.round(1000*newEnd)/1000
    	});

		this.render();

		// set viewbox for viewport and render
		this.preview.chart.viewport.setViewbox({
			start: this.start,
			end: this.end
		});
		//if (this._elemDrag.classList.contains("slider")) {
		// fast render
		//	this.preview.chart.viewport.renderViewbox();	
		//} else {
			this.preview.chart.viewport.render(true);
		//}

    }

    setViewbox (viewbox) {
    	this.start = viewbox.start;
    	this.end = viewbox.end;
    }

	render () {
		let context = this;

		if (!this.elem) {
			this.elem = this.preview.elem.querySelector('.slider');

			this.elem.addEventListener('mousedown', function (e) {
				e.preventDefault();
		        context._startDrag(event);
		        return false;
			});
			this.elem.addEventListener('touchstart', function (e) {
				e.preventDefault();
		        context._startDrag(event);
		        return false;
			}, {passive: false});			
		}

		if (!this.elemSliderLeft) {
			this.elemSliderLeft = this.preview.elem.querySelector('.slider-left');

			this.elemSliderLeft.addEventListener('touchstart', function (e) {
				e.preventDefault();
		        context._startDrag(event);
		        return false;
			}, {passive: false});			
		}

		if (!this.elemSlideright) {
			this.elemSliderRight = this.preview.elem.querySelector('.slider-right');

			this.elemSliderRight.addEventListener('touchstart', function (e) {
				e.preventDefault();
		        context._startDrag(event);
		        return false;
			}, {passive: false});			
		}

		if (!this.elemPreviewLeft) {
			this.elemPreviewLeft = this.preview.elem.querySelector('.preview-left');
		}

		if (!this.elemPreviewRight) {
			this.elemPreviewRight = this.preview.elem.querySelector('.preview-right');
		}

		this.elem.style.left = 100*this.start + '%';
		this.elem.style.width = 100*(this.end-this.start) + '%';

		this.elemPreviewLeft.style.width = 100*this.start + '%';
		this.elemPreviewRight.style.left = 100*this.end + '%';
	}
}