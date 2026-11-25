import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButtons, IonBackButton,
  IonList, IonItem, IonRadioGroup, IonRadio, IonFooter, 
  IonLabel, IonDatetimeButton, IonModal, IonDatetime, IonButton,
} from '@ionic/angular/standalone';
import { SleepService } from '../services/sleep.service';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';
function toLocalIso(d: Date): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
}

@Component({
  selector: 'app-log-sleepiness',
  templateUrl: './log-sleepiness.page.html',
  styleUrls: ['./log-sleepiness.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonTitle, IonToolbar,
    IonButtons, IonBackButton, IonList, IonItem, IonRadioGroup, IonRadio,
    IonLabel, IonDatetimeButton, IonModal, IonDatetime, IonButton, IonFooter
  ]
})
export class LogSleepinessPage {
  options = [1, 2, 3, 4, 5, 6, 7].map(n => ({
    value: n,
    text: StanfordSleepinessData.ScaleValues[n] as string,
  }));

  selected: number | null = null;          
  loggedAt: string = toLocalIso(new Date());
  maxTime: string = toLocalIso(new Date());

  constructor(private router: Router, private sleepService: SleepService) {}

  get isValid(): boolean {
    return this.selected !== null;
  }

  async save() {
    if (this.selected === null) return;
    await this.sleepService.logSleepinessData(
      new StanfordSleepinessData(this.selected, new Date(this.loggedAt))
    );
    this.router.navigateByUrl('/home');
  }
}