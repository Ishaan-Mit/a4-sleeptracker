import { Component, ElementRef, ViewChild, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonCard,
  IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/angular/standalone';
import { Chart, registerables } from 'chart.js';
import { SleepService } from '../services/sleep.service';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';
import { register } from 'swiper/element/bundle';

register();
Chart.register(...registerables);

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    RouterLink, IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})

export class HomePage implements AfterViewInit {
  @ViewChild('sleepCanvas') sleepCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('sleepinessCanvas') sleepinessCanvas?: ElementRef<HTMLCanvasElement>;

	private sleepChart?: Chart;
	private sleepinessChart?: Chart;

	constructor(public sleepService:SleepService) {

	}

	ngOnInit() {
		console.log(this.allSleepData);
	}

	get overnightEntries(): OvernightSleepData[] {
		return [...SleepService.AllOvernightData].sort((a, b) => a.sleepStart.getTime() - b.sleepStart.getTime());
	}
	
	get sleepinessEntries(): StanfordSleepinessData[] {
		return [...SleepService.AllSleepinessData].sort((a, b) => a.loggedAt.getTime() - b.loggedAt.getTime());
	}

	ngAfterViewInit() {
    	this.buildCharts();
  	}

	ionViewWillEnter() {
    	this.buildCharts();
  	}

	private async buildCharts() {
		await this.sleepService.ready;
		this.buildSleepChart();
		this.buildSleepinessChart();
	}

	private buildSleepChart() {
		this.sleepChart?.destroy();
		if (!this.sleepCanvas) return;

		const recent = this.overnightEntries.slice(-7);
		this.sleepChart = new Chart(this.sleepCanvas.nativeElement, {
		type: 'bar',
		data: {
			labels: recent.map(e =>
			e.sleepStart.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })),
			datasets: [{
			label: 'Hours slept',
			data: recent.map(e => (e.sleepEnd.getTime() - e.sleepStart.getTime()) / 3600000),
			borderRadius: 6,
			}],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: { legend: { display: false } },
			scales: { y: { beginAtZero: true, title: { display: true, text: 'Hours' } } },
		},
		});
	}

	private buildSleepinessChart() {
	this.sleepinessChart?.destroy();
		if (!this.sleepinessCanvas) return;

		const recent = this.sleepinessEntries.slice(-20); // last 20 ratings
		this.sleepinessChart = new Chart(this.sleepinessCanvas.nativeElement, {
		type: 'line',
		data: {
			labels: recent.map(e =>
			e.loggedAt.toLocaleString('en-US', { month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' })),
			datasets: [{
			label: 'Sleepiness',
			data: recent.map(e => e.loggedValue),
			tension: 0.3,
			}],
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			plugins: { legend: { display: false } },
			layout: { padding: { top: 16, right: 16 } },
			scales: {
				x: { offset: true, ticks: { maxRotation: 0, maxTicksLimit: 3 } },
				y: { min: 1, max: 7, ticks: { stepSize: 1 }, title: { display: true, text: 'Stanford scale (1-7)' } },
			},
		},
		});
	}

	/* Ionic doesn't allow bindings to static variables, so this getter can be used instead. */
	get allSleepData() {
		return SleepService.AllSleepData;
	}
}
