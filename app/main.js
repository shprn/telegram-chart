import Chart from './classes/Chart.js';
import css from './css/styles.css'

console.log('app started');

let index = 0;
let request = window.location.search.split('?');
if (request.length > 1) {
	index = +request[1];
}

let chart = new Chart({
	id: "TelegramChart",
	title: "Telegram Chart",
	axis: {
		x: {
			min: undefined,
			max: undefined,
			step: undefined,
		},
	},
	viewbox: {
		start: 0.8,
		end: 1
	},
	theme: 0,
	chart: chart_data[index]
});
