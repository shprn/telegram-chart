import Label from "./Label.js"

export default class Labels {

	// constructor
	constructor (chart, params) {
		this.chart = chart;
		this.elem = null;
		this.items = [];

		// add new items
		for (let key in params.chart.columns) {
			this.addItem({
				name: params.chart.names[key],
				color: params.chart.colors[key],
				enable: true
			});	
		}
	}

	// add label
	addItem (data) {
		this.items.push(new Label(this, data));
	}

	// delete label
	deleteItem (index) {
		if (index < this.items.length) {
			if (this.items[index].elem) {
				this.items[index].elem.delete();
			}
			this.items.splice(index, 1);
		}
	}

	// delete all labels
	deleteItems (index) {
		this.items.foreach(function(item) {
			if (item.elem) {
				item.elem.delete();
			}
		});
		this.items = [];
	}

	// enable label
	enableItem (index) {
		if (index < this.items.length) {
			this.items[index].enable();
		}
	}

	// disable label
	disableItem (index) {
		if (index < this.items.length) {
			this.items[index].disable();
		}
	}

	// toggle label
	toggleItem (index) {
		if (index < this.items.length) {
			this.items[index].toggle();
		}
	}

	renderItem (index) {
		if (index < this.items.length) {
			this.items[index].render();
		}
	}

	render () {
		if (!this.elem) {
			this.elem = this.chart.elem.querySelector('.labels');
		}

		let context = this;
		this.items.forEach(function(item) {
			context.renderItem(item.index);	
		});		
	}

}