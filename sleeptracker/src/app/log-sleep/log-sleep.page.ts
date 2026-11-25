import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonList, IonItem, IonLabel, IonDatetimeButton, IonModal, IonDatetime, IonButton, IonText
} from '@ionic/angular/standalone';
import { SleepService } from '../services/sleep.service';
import { OvernightSleepData } from '../data/overnight-sleep-data';

function toLocalDate(d: Date): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function toMinutes(value: string): number {
  const t = value.includes('T') ? value.split('T')[1] : value;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

@Component({
  selector: 'app-log-sleep',
  templateUrl: './log-sleep.page.html',
  styleUrls: ['./log-sleep.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonBackButton, IonList, IonItem, IonLabel, IonDatetimeButton,
    IonModal, IonDatetime, IonButton, IonText
  ]
})

export class LogSleepPage {
  nightDate: string = toLocalDate(new Date(Date.now()-24*60*60*1000));
  maxDate: string = toLocalDate(new Date(Date.now()));
  bedtime = '22:00';
  wakeTime = '06:00';


  constructor(private router: Router, private sleepService: SleepService) {}

  get durationMin(): number {
    return (toMinutes(this.wakeTime) - toMinutes(this.bedtime) + 1440) % 1440;
  }

  get durationText(): string {
    return `${Math.floor(this.durationMin / 60)}h ${this.durationMin % 60}m`;
  }

  private buildTimes(): { start: Date; end: Date } {
    const [y, mo, d] = this.nightDate.slice(0, 10).split('-').map(Number);
    const bedMin = toMinutes(this.bedtime);
    const start = new Date(y, mo - 1, d, Math.floor(bedMin / 60), bedMin % 60);
    // A bedtime before noon (e.g. 1:00 AM) belongs to the morning after the chosen night
    if (bedMin < 720) start.setDate(start.getDate() + 1);
    return { start, end: new Date(start.getTime() + this.durationMin * 60000) };
  }

  // Error prevention
  get errorMessage(): string {
    if (this.durationMin === 0) return "Bedtime and wake time can't be the same.";
    if (this.buildTimes().end.getTime() > Date.now()) return 'That wake time is in the future.';
    return '';
  }

  get isValid(): boolean {
    return this.errorMessage === '';
  }

  async save() {
    if (!this.isValid) return;
    const { start, end } = this.buildTimes();
    this.sleepService.logOvernightData(new OvernightSleepData(start, end));
    this.router.navigateByUrl('/home');
  }


}